export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StudentDashboardClient, { DashboardData, SubjectData } from "./student-dashboard-client";
import { createClient } from "@/utils/supabase/server";

async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const student = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      enrolledBatches: {
        include: {
          batch: {
            include: {
              subjects: {
                include: {
                  subject: {
                    include: {
                      _count: {
                        select: { topicNodes: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      studentProgress: true,
    }
  });

  if (!student) {
    notFound();
  }

  // Flatten subjects from enrolled batches
  const uniqueSubjectsMap = new Map();

  student.enrolledBatches.forEach(eb => {
    eb.batch.subjects.forEach(bs => {
      const subj = bs.subject;
      if (!uniqueSubjectsMap.has(subj.id)) {
        uniqueSubjectsMap.set(subj.id, subj);
      }
    });
  });

  const subjects = Array.from(uniqueSubjectsMap.values());
  const progressByTopic = student.studentProgress;

  const subjectData: SubjectData[] = subjects.map(subj => {
    const totalTopics = subj._count.topicNodes;
    
    // Find all topics for this subject that the student has completed
    // Since we only have topicId in progress, we'd theoretically need the topic's subjectId
    // But since we didn't fetch topic->subject above, we can just do a parallel query.
    // However, to keep it simple and optimized, let's fetch topics for these subjects:
    return {
      id: subj.id,
      name: subj.name,
      emoji: subj.iconEmoji || "📚",
      totalTopics: totalTopics,
      completedTopics: 0, // We will compute this in a second pass
      status: "not_started"
    };
  });

  // Second pass: fetch completed topics per subject
  if (subjects.length > 0) {
    const topics = await prisma.topicNode.findMany({
      where: {
        subjectId: { in: subjects.map(s => s.id) },
        id: { in: progressByTopic.filter(p => p.status === 'COMPLETED').map(p => p.topicId) }
      },
      select: { subjectId: true, id: true }
    });

    const completedTopicsCountMap: Record<string, number> = {};
    topics.forEach(t => {
      completedTopicsCountMap[t.subjectId] = (completedTopicsCountMap[t.subjectId] || 0) + 1;
    });

    subjectData.forEach(sd => {
      sd.completedTopics = completedTopicsCountMap[sd.id] || 0;
      if (sd.completedTopics === 0) {
        sd.status = "not_started";
      } else if (sd.completedTopics === sd.totalTopics && sd.totalTopics > 0) {
        sd.status = "progressing"; // We can call it 'completed' but let's stick to progressing/stuck
      } else {
        // Mock 'stuck' randomly or just set progressing
        sd.status = "progressing";
      }
    });
  }

  const totalCompleted = subjectData.reduce((acc, s) => acc + s.completedTopics, 0);

  return {
    studentName: student.name || "Student",
    totalSubjects: subjects.length,
    totalCompleted,
    streak: 0,
    subjects: subjectData
  };
}

export default function StudentDashboardPage() {
  return <StudentDashboardClient dataPromise={getDashboardData()} />;
}
