import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import type {
  BatchPulse,
  CriticalNode,
  LearningNode,
  LearningStatus,
  PeerComparison,
  StudentActivity,
  StudentStats,
} from "@/lib/path-types";

const POSITIONS: LearningNode["position"][] = ["center", "left", "right"];
const DAY_MS = 86_400_000;

async function currentDbUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.user.findUnique({ where: { supabaseId: user.id } });
}

const emptyStats = (name: string, title: string): StudentStats => ({
  name,
  title,
  weeklyPerformance: [0, 0, 0, 0, 0],
  weeklyLabels: ["MON", "TUE", "WED", "THU", "FRI"],
  recentActivity: [],
});

const toStatus = (s?: string): LearningStatus =>
  s === "COMPLETED" ? "completed" : s === "IN_PROGRESS" ? "in-progress" : "locked";

// ponytail: coarse progress (0/50/100) until per-topic resource counts are wired.
const toNode = (
  id: string,
  title: string,
  description: string,
  status: LearningStatus,
  i: number
): LearningNode => ({
  id,
  title,
  description,
  status,
  progress: status === "completed" ? 100 : status === "in-progress" ? 50 : 0,
  icon: status === "completed" ? "check" : status === "in-progress" ? "book" : "lock",
  position: POSITIONS[i % POSITIONS.length],
});

const dayLabel = (d: Date) => ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][d.getDay()];
const asDate = (value: Date | string) => (value instanceof Date ? value : new Date(value));

export async function getStudentPath(): Promise<{
  nodes: LearningNode[];
  stats: StudentStats;
  peers: PeerComparison[];
  currentStudentId: string;
}> {
  const user = await currentDbUser();
  if (!user) return { nodes: [], stats: emptyStats("Student", "Not signed in"), peers: [], currentStudentId: "" };

  const student = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      enrolledBatches: {
        include: {
          batch: {
            include: {
              subjects: {
                include: { subject: { include: { topicNodes: { orderBy: { order: "asc" } } } } },
              },
            },
          },
        },
      },
      studentProgress: true,
      engagementEvents: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!student) {
    return { nodes: [], stats: emptyStats("Student", "No profile"), peers: [], currentStudentId: "" };
  }

  const subjects = student.enrolledBatches.flatMap((eb) => eb.batch.subjects.map((bs) => bs.subject));
  const subject = subjects[0];
  const statusByTopic = new Map(student.studentProgress.map((p) => [p.topicId, p.status]));

  const nodes: LearningNode[] = (subject?.topicNodes ?? []).map((t, i) =>
    toNode(t.id, t.title, t.description ?? subject?.name ?? "", toStatus(statusByTopic.get(t.id)), i)
  );

  const batchIds = student.enrolledBatches.map((eb) => eb.batchId);
  const classmates = batchIds.length
    ? await prisma.batchStudent.findMany({
        where: { batchId: { in: batchIds } },
        include: {
          student: {
            include: {
              studentProgress: true,
              enrolledBatches: {
                include: {
                  batch: {
                    include: {
                      subjects: {
                        include: { subject: { include: { topicNodes: { select: { id: true } } } } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })
    : [];

  const seen = new Set<string>();
  const peers: PeerComparison[] = classmates
    .filter((c) => (seen.has(c.student.id) ? false : (seen.add(c.student.id), true)))
    .map((c) => {
      const topicIds = new Set(
        c.student.enrolledBatches.flatMap((eb) =>
          eb.batch.subjects.flatMap((bs) => bs.subject.topicNodes.map((t) => t.id))
        )
      );
      const completed = c.student.studentProgress.filter((p) => p.status === "COMPLETED").length;
      const progress = topicIds.size ? Math.round((completed / topicIds.size) * 100) : 0;
      return {
        studentId: c.student.id,
        studentName: c.student.name ?? c.student.email.split("@")[0],
        avatar: c.student.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.student.id}`,
        progress,
        rank: 0,
        // ponytail: no rank-history table yet, so report 0 rather than invent a delta
        weeklyChange: 0,
      };
    })
    .sort((a, b) => b.progress - a.progress)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  const now = Date.now();
  const days = [4, 3, 2, 1, 0].map((back) => new Date(now - back * DAY_MS));
  const counts = days.map(
    (d) =>
      student.engagementEvents.filter((e) => asDate(e.createdAt).toDateString() === d.toDateString()).length
  );
  const max = Math.max(1, ...counts);

  const activityTitle = (type: string) => {
    switch (type) {
      case "TOPIC_COMPLETE":
        return "Completed a topic";
      case "RESOURCE_VIEW":
        return "Viewed course material";
      case "AI_CHAT":
        return "Asked the AI assistant";
      case "LOGIN":
        return "Signed in";
      default:
        return "Studied a page";
    }
  };

  const recentActivity: StudentActivity[] = student.engagementEvents.slice(0, 3).map((e) => ({
    id: e.id,
    type: e.type === "TOPIC_COMPLETE" ? "completed" : e.type === "RESOURCE_VIEW" ? "downloaded" : "submitted",
    title: activityTitle(e.type),
    time: asDate(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  }));

  return {
    nodes,
    stats: {
      name: student.name ?? student.email.split("@")[0],
      title: student.enrolledBatches[0]?.batch.name ?? "No batch yet",
      weeklyPerformance: counts.map((c) => Math.round((c / max) * 100)),
      weeklyLabels: days.map(dayLabel),
      recentActivity,
    },
    peers,
    currentStudentId: student.id,
  };
}

export async function getTeacherPath(): Promise<{
  nodes: LearningNode[];
  batchPulse: BatchPulse;
  criticalNodes: CriticalNode[];
}> {
  const user = await currentDbUser();
  const empty: BatchPulse = {
    activity: 0,
    change: "0%",
    period: "vs last week",
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
  };
  if (!user) return { nodes: [], batchPulse: empty, criticalNodes: [] };

  const teacher = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      taughtBatches: {
        include: {
          students: { select: { studentId: true } },
          subjects: { include: { subject: { include: { topicNodes: { orderBy: { order: "asc" } } } } } },
          teacherProgress: true,
        },
      },
    },
  });
  if (!teacher || teacher.taughtBatches.length === 0) {
    return { nodes: [], batchPulse: empty, criticalNodes: [] };
  }

  const batch = teacher.taughtBatches[0];
  const subject = batch.subjects[0]?.subject;
  const teacherStatus = new Map(batch.teacherProgress.map((p) => [p.topicId, p.status]));
  const nodes = (subject?.topicNodes ?? []).map((t, i) =>
    toNode(t.id, t.title, t.description ?? subject?.name ?? "", toStatus(teacherStatus.get(t.id)), i)
  );

  const studentIds = batch.students.map((s) => s.studentId);
  const events = studentIds.length
    ? await prisma.engagementEvent.findMany({
        where: { studentId: { in: studentIds } },
        orderBy: { createdAt: "desc" },
        take: 500,
      })
    : [];

  const now = Date.now();
  const inWindow = (createdAt: Date | string, from: number, to: number) => {
    const t = asDate(createdAt).getTime();
    return t >= now - from * DAY_MS && t < now - to * DAY_MS;
  };
  const thisWeek = events.filter((e) => inWindow(e.createdAt, 7, 0)).length;
  const lastWeek = events.filter((e) => inWindow(e.createdAt, 14, 7)).length;
  const change = lastWeek ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : thisWeek > 0 ? 100 : 0;
  const weeklyData = [6, 5, 4, 3, 2, 1, 0].map((back) => {
    const day = new Date(now - back * DAY_MS).toDateString();
    return events.filter((e) => asDate(e.createdAt).toDateString() === day).length;
  });

  const progressRows = studentIds.length
    ? await prisma.studentProgress.findMany({ where: { studentId: { in: studentIds } } })
    : [];
  const topicTitles = new Map((subject?.topicNodes ?? []).map((t) => [t.id, t.title]));
  const stuck = new Map<string, number>();
  for (const row of progressRows) {
    if (row.status === "COMPLETED") continue;
    stuck.set(row.topicId, (stuck.get(row.topicId) ?? 0) + 1);
  }
  const criticalNodes: CriticalNode[] = [...stuck.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topicId, count]) => ({
      id: topicId,
      title: topicTitles.get(topicId) ?? "Topic",
      description: `${count} student${count === 1 ? "" : "s"} not finished`,
      severity: count > 1 ? "warning" : "info",
    }));

  return {
    nodes,
    batchPulse: {
      activity: thisWeek,
      change: `${change >= 0 ? "+" : ""}${change}%`,
      period: "vs last week",
      weeklyData,
    },
    criticalNodes,
  };
}

export async function getAdminOverview() {
  const user = await currentDbUser();
  if (!user) return null;
  const where = { institutionId: user.institutionId };

  const [students, teachers, batches, completedRows, totalRows] = await Promise.all([
    prisma.user.count({ where: { ...where, role: "STUDENT" } }),
    prisma.user.count({ where: { ...where, role: "TEACHER" } }),
    prisma.batch.count({ where }),
    prisma.studentProgress.count({ where: { status: "COMPLETED" } }),
    prisma.studentProgress.count(),
  ]);

  return {
    students,
    teachers,
    batches,
    avgCompletion: totalRows ? Math.round((completedRows / totalRows) * 100) : 0,
  };
}
