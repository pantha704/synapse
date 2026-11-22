/**
 * Demo seed — creates REAL Supabase auth users, so the demo accounts can log in.
 * Run:  npm run seed        (needs .env.local with service role + DATABASE_URL)
 *
 * Accounts (password for all: SynapseDemo2026!)
 *   teacher@demo.synapse.dev        TEACHER
 *   admin@demo.synapse.dev          ADMIN
 *   student1..10@demo.synapse.dev   STUDENT
 */
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "SynapseDemo2026!";
const INSTITUTION = "Demo University";
const BATCH = "B.Tech CSE 2026";
const JOIN_CODE = "SYN2026";
const SUBJECT = "Data Structures";
const TOPICS = [
  "Arrays and Strings",
  "Linked Lists",
  "Stacks and Queues",
  "Trees and BST",
  "Graphs",
  "Hashing",
  "Sorting Algorithms",
  "Dynamic Programming",
];
const STUDENT_NAMES = [
  "Aditi Sharma", "Rahul Das", "Neha Bose", "Arjun Iyer", "Priya Ghosh",
  "Karan Mehta", "Sneha Roy", "Vikram Sen", "Ishita Pal", "Dev Chatterjee",
];

async function ensureAuthUser(email: string, name: string, role: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name, role },
  });
  if (!error && data.user) return { id: data.user.id, created: true };
  if (error && !/already/i.test(error.message)) throw new Error(`${email}: ${error.message}`);

  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const found = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!found) throw new Error(`${email}: exists in auth but not listed`);
  return { id: found.id, created: false };
}

async function main() {
  console.log("→ auth users");
  const people = [
    { email: "teacher@demo.synapse.dev", name: "Meera Nair", role: "TEACHER" },
    { email: "admin@demo.synapse.dev", name: "Ravi Menon", role: "ADMIN" },
    ...STUDENT_NAMES.map((name, i) => ({ email: `student${i + 1}@demo.synapse.dev`, name, role: "STUDENT" })),
  ];

  const ids: Record<string, string> = {};
  for (const p of people) {
    const { id, created } = await ensureAuthUser(p.email, p.name, p.role);
    ids[p.email] = id;
    console.log(`  ${created ? "created" : "exists "} ${p.email}`);
  }

  console.log("→ wipe previous demo tenant");
  const old = await prisma.institution.findFirst({ where: { name: INSTITUTION } });
  if (old) {
    const batchIds = (await prisma.batch.findMany({ where: { institutionId: old.id }, select: { id: true } })).map((b) => b.id);
    const subjectIds = (await prisma.subject.findMany({ where: { institutionId: old.id }, select: { id: true } })).map((s) => s.id);
    const userIds = (await prisma.user.findMany({ where: { institutionId: old.id }, select: { id: true } })).map((u) => u.id);

    await prisma.assignmentSubmission.deleteMany({ where: { assignment: { batchId: { in: batchIds } } } });
    await prisma.assignment.deleteMany({ where: { batchId: { in: batchIds } } });
    await prisma.announcementRead.deleteMany({ where: { announcement: { batchId: { in: batchIds } } } });
    await prisma.announcement.deleteMany({ where: { batchId: { in: batchIds } } });
    await prisma.documentChunk.deleteMany({ where: { subjectId: { in: subjectIds } } });
    await prisma.engagementEvent.deleteMany({ where: { studentId: { in: userIds } } });
    await prisma.studentResourceProgress.deleteMany({ where: { studentId: { in: userIds } } });
    await prisma.studentProgress.deleteMany({ where: { studentId: { in: userIds } } });
    await prisma.teacherProgress.deleteMany({ where: { batchId: { in: batchIds } } });
    await prisma.batchStudent.deleteMany({ where: { batchId: { in: batchIds } } });
    await prisma.batchSubject.deleteMany({ where: { batchId: { in: batchIds } } });
    await prisma.resource.deleteMany({ where: { subjectId: { in: subjectIds } } });
    await prisma.topicNode.deleteMany({ where: { subjectId: { in: subjectIds } } });
    await prisma.subject.deleteMany({ where: { institutionId: old.id } });
    await prisma.batch.deleteMany({ where: { institutionId: old.id } });
    await prisma.user.deleteMany({ where: { institutionId: old.id } });
    await prisma.institution.delete({ where: { id: old.id } });
    console.log("  removed", old.id);
  }

  console.log("→ tenant");
  const institution = await prisma.institution.create({
    data: { name: INSTITUTION, slug: "demo-university" },
  });

  const teacher = await prisma.user.create({
    data: {
      supabaseId: ids["teacher@demo.synapse.dev"],
      email: "teacher@demo.synapse.dev",
      name: "Meera Nair",
      role: "TEACHER",
      institutionId: institution.id,
    },
  });
  await prisma.user.create({
    data: {
      supabaseId: ids["admin@demo.synapse.dev"],
      email: "admin@demo.synapse.dev",
      name: "Ravi Menon",
      role: "ADMIN",
      institutionId: institution.id,
    },
  });

  const students = [];
  for (let i = 1; i <= STUDENT_NAMES.length; i++) {
    const email = `student${i}@demo.synapse.dev`;
    students.push(
      await prisma.user.create({
        data: {
          supabaseId: ids[email],
          email,
          name: STUDENT_NAMES[i - 1],
          role: "STUDENT",
          institutionId: institution.id,
        },
      })
    );
  }

  const batch = await prisma.batch.create({
    data: { name: BATCH, joinCode: JOIN_CODE, institutionId: institution.id, teacherId: teacher.id },
  });
  await prisma.batchStudent.createMany({ data: students.map((s) => ({ batchId: batch.id, studentId: s.id })) });

  const subject = await prisma.subject.create({
    data: {
      name: SUBJECT,
      description: "Core data structures, taught with a visual syllabus map.",
      institutionId: institution.id,
    },
  });
  await prisma.batchSubject.create({ data: { batchId: batch.id, subjectId: subject.id } });

  const topics = [];
  for (let i = 0; i < TOPICS.length; i++) {
    topics.push(
      await prisma.topicNode.create({
        data: {
          title: TOPICS[i],
          description: `Module ${i + 1}`,
          order: i,
          subjectId: subject.id,
          positionX: i * 220,
          positionY: (i % 2) * 160,
          nodeType: "topic",
        },
      })
    );
  }

  // the teacher has opened the first five topics
  for (const topic of topics.slice(0, 5)) {
    await prisma.teacherProgress.create({
      data: { batchId: batch.id, topicId: topic.id, status: "COMPLETED", assignedBy: teacher.id },
    });
  }

  const now = Date.now();
  for (let s = 0; s < students.length; s++) {
    const reach = 2 + ((s * 3) % 7);
    for (let t = 0; t < Math.min(reach, topics.length); t++) {
      await prisma.studentProgress.create({
        data: { studentId: students[s].id, topicId: topics[t].id, status: t < reach - 1 ? "COMPLETED" : "IN_PROGRESS" },
      });
      await prisma.engagementEvent.create({
        data: {
          studentId: students[s].id,
          type: "TOPIC_COMPLETE",
          metadata: { topic: topics[t].title },
          createdAt: new Date(now - (t + 1) * 86_400_000 - s * 3_600_000),
        },
      });
    }
    await prisma.engagementEvent.create({
      data: {
        studentId: students[s].id,
        type: s % 4 === 0 ? "LOGIN" : "RESOURCE_VIEW",
        createdAt: new Date(now - (s + 1) * 3_600_000),
      },
    });
  }

  const ann1 = await prisma.announcement.create({
    data: {
      batchId: batch.id,
      authorId: teacher.id,
      title: "Midterm syllabus covered",
      body: "Arrays through Graphs are done. Revise the traversal examples before Monday.",
    },
  });
  await prisma.announcement.create({
    data: {
      batchId: batch.id,
      authorId: teacher.id,
      title: "Lab submission",
      body: "Linked list lab is due Friday. Submit through the Assignments tab.",
    },
  });
  await prisma.announcementRead.create({ data: { announcementId: ann1.id, studentId: students[0].id } });

  const a1 = await prisma.assignment.create({
    data: {
      batchId: batch.id,
      topicId: topics[1].id,
      title: "Implement a linked list",
      instructions: "Push, pop, and reverse in TypeScript. Include three tests.",
      dueAt: new Date(now + 5 * 86_400_000),
      createdBy: teacher.id,
    },
  });
  await prisma.assignment.create({
    data: {
      batchId: batch.id,
      topicId: topics[3].id,
      title: "BST traversal worksheet",
      instructions: "In-order, pre-order, post-order on the given tree.",
      dueAt: new Date(now + 12 * 86_400_000),
      createdBy: teacher.id,
    },
  });
  for (const s of students.slice(0, 4)) {
    await prisma.assignmentSubmission.create({
      data: { assignmentId: a1.id, studentId: s.id, status: "SUBMITTED", submittedAt: new Date(), note: "Done." },
    });
  }

  console.log(`\n✅ ${institution.name} · ${students.length} students · ${topics.length} topics`);
  console.log(`   log in: teacher@demo.synapse.dev / ${PASSWORD}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
