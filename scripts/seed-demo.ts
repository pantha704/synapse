/**
 * Demo Seeder Script
 * Run with: bun run scripts/seed-demo.ts
 *
 * Populates the database with realistic demo data for hackathon presentations.
 */

import { PrismaClient, Role, ProgressStatus, ResourceType, EventType } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_INSTITUTION = {
  name: "Demo University",
  slug: "demo-university",
};

const DEMO_TEACHERS = [
  { name: "Dr. Aris Thorne", email: "aris.thorne@demo.edu", supabaseId: "demo-teacher-1" },
  { name: "Prof. Maya Singh", email: "maya.singh@demo.edu", supabaseId: "demo-teacher-2" },
];

const DEMO_BATCHES = [
  { name: "CS101 - Fall 2024", joinCode: "DEMO01", teacherIdx: 0 },
  { name: "CS201 - Spring 2025", joinCode: "DEMO02", teacherIdx: 1 },
];

const DEMO_SUBJECTS = [
  {
    name: "Introduction to Computer Science",
    description: "Fundamentals of programming and computational thinking",
    iconEmoji: "💻",
    topics: [
      { title: "Welcome to CS", description: "Course overview and expectations", order: 0 },
      { title: "Variables & Types", description: "Data types, variables, and operators", order: 1, children: [
        { title: "Primitive Types", description: "Numbers, strings, booleans", order: 0 },
        { title: "Type Conversion", description: "Implicit and explicit casting", order: 1 },
      ]},
      { title: "Control Flow", description: "Conditionals and loops", order: 2, children: [
        { title: "If/Else Statements", description: "Conditional branching", order: 0 },
        { title: "Loops", description: "For, while, and do-while loops", order: 1 },
      ]},
      { title: "Functions", description: "Defining and calling functions", order: 3 },
      { title: "Arrays & Objects", description: "Data structures in JavaScript", order: 4 },
    ],
  },
  {
    name: "Data Structures",
    description: "Trees, heaps, and neural maps",
    iconEmoji: "🌳",
    topics: [
      { title: "Introduction", description: "Why data structures matter", order: 0 },
      { title: "Linked Lists", description: "Singly and doubly linked lists", order: 1 },
      { title: "Stacks & Queues", description: "LIFO and FIFO structures", order: 2 },
      { title: "Binary Trees", description: "Tree traversal algorithms", order: 3, children: [
        { title: "BST Operations", description: "Insert, delete, search", order: 0 },
        { title: "Balanced Trees", description: "AVL and Red-Black trees", order: 1 },
      ]},
      { title: "Hash Maps", description: "Hashing and collision resolution", order: 4 },
      { title: "Graphs", description: "Graph representation and traversal", order: 5 },
    ],
  },
  {
    name: "Algorithms",
    description: "Sorting, searching, and optimization",
    iconEmoji: "⚡",
    topics: [
      { title: "Algorithm Analysis", description: "Big O notation and complexity", order: 0 },
      { title: "Sorting", description: "Merge sort, quick sort, heap sort", order: 1 },
      { title: "Searching", description: "Binary search and hash-based lookup", order: 2 },
      { title: "Dynamic Programming", description: "Memoization and tabulation", order: 3 },
      { title: "Graph Algorithms", description: "BFS, DFS, Dijkstra's algorithm", order: 4 },
    ],
  },
];

const DEMO_STUDENTS = [
  { name: "Alex Rivers", email: "alex.rivers@demo.edu", supabaseId: "demo-student-1" },
  { name: "Sarah Chen", email: "sarah.chen@demo.edu", supabaseId: "demo-student-2" },
  { name: "Marcus Johnson", email: "marcus.johnson@demo.edu", supabaseId: "demo-student-3" },
  { name: "Priya Patel", email: "priya.patel@demo.edu", supabaseId: "demo-student-4" },
  { name: "James Wilson", email: "james.wilson@demo.edu", supabaseId: "demo-student-5" },
  { name: "Emma Davis", email: "emma.davis@demo.edu", supabaseId: "demo-student-6" },
  { name: "Liam Brown", email: "liam.brown@demo.edu", supabaseId: "demo-student-7" },
  { name: "Olivia Martinez", email: "olivia.martinez@demo.edu", supabaseId: "demo-student-8" },
  { name: "Noah Garcia", email: "noah.garcia@demo.edu", supabaseId: "demo-student-9" },
  { name: "Ava Thompson", email: "ava.thompson@demo.edu", supabaseId: "demo-student-10" },
];

// Progress profiles: [progressing, stuck, inactive] mix
const PROGRESS_PROFILES = [
  { status: ProgressStatus.COMPLETED, daysAgo: 0 },    // Active now
  { status: ProgressStatus.COMPLETED, daysAgo: 1 },    // Active yesterday
  { status: ProgressStatus.IN_PROGRESS, daysAgo: 2 },  // Recent
  { status: ProgressStatus.IN_PROGRESS, daysAgo: 4 },  // Somewhat recent
  { status: ProgressStatus.NOT_STARTED, daysAgo: 10 }, // Inactive
];

async function seed() {
  console.log("🌱 Seeding demo data...\n");

  // Clean existing demo data
  console.log("🧹 Cleaning existing demo data...");
  await prisma.engagementEvent.deleteMany({ where: { student: { institution: { slug: DEMO_INSTITUTION.slug } } } });
  await prisma.aiMessage.deleteMany({ where: { session: { subject: { institution: { slug: DEMO_INSTITUTION.slug } } } } });
  await prisma.aiSession.deleteMany({ where: { subject: { institution: { slug: DEMO_INSTITUTION.slug } } } });
  await prisma.studentResourceProgress.deleteMany({ where: { student: { institution: { slug: DEMO_INSTITUTION.slug } } } });
  await prisma.studentProgress.deleteMany({ where: { student: { institution: { slug: DEMO_INSTITUTION.slug } } } });
  await prisma.documentChunk.deleteMany({ where: { subject: { institution: { slug: DEMO_INSTITUTION.slug } } } });
  await prisma.teacherProgress.deleteMany({ where: { batch: { institution: { slug: DEMO_INSTITUTION.slug } } } });
  await prisma.batchStudent.deleteMany({ where: { batch: { institution: { slug: DEMO_INSTITUTION.slug } } } });
  await prisma.batchSubject.deleteMany({ where: { batch: { institution: { slug: DEMO_INSTITUTION.slug } } } });
  await prisma.topicNode.deleteMany({ where: { subject: { institution: { slug: DEMO_INSTITUTION.slug } } } });
  await prisma.resource.deleteMany({ where: { subject: { institution: { slug: DEMO_INSTITUTION.slug } } } });
  await prisma.subject.deleteMany({ where: { institution: { slug: DEMO_INSTITUTION.slug } } });
  await prisma.batch.deleteMany({ where: { institution: { slug: DEMO_INSTITUTION.slug } } });
  await prisma.user.deleteMany({ where: { institution: { slug: DEMO_INSTITUTION.slug } } });
  await prisma.institution.deleteMany({ where: { slug: DEMO_INSTITUTION.slug } });

  // Create Institution
  console.log("🏛️  Creating institution...");
  const institution = await prisma.institution.create({ data: DEMO_INSTITUTION });

  // Create Teachers
  console.log("👨‍🏫 Creating teachers...");
  const teachers = await Promise.all(
    DEMO_TEACHERS.map((t) =>
      prisma.user.create({
        data: { supabaseId: t.supabaseId, email: t.email, name: t.name, role: Role.TEACHER, institutionId: institution.id },
      })
    )
  );

  // Create Batches
  console.log("📚 Creating batches...");
  const batches = await Promise.all(
    DEMO_BATCHES.map((b) =>
      prisma.batch.create({
        data: { name: b.name, joinCode: b.joinCode, institutionId: institution.id, teacherId: teachers[b.teacherIdx].id },
      })
    )
  );

  // Create Subjects and Topic Trees
  console.log("📖 Creating subjects and topic trees...");
  for (const subjectData of DEMO_SUBJECTS) {
    const subject = await prisma.subject.create({
      data: { name: subjectData.name, description: subjectData.description, iconEmoji: subjectData.iconEmoji, institutionId: institution.id },
    });

    // Link subjects to batches
    await Promise.all(batches.map((batch) =>
      prisma.batchSubject.create({ data: { batchId: batch.id, subjectId: subject.id } })
    ));

    // Create topic tree
    for (const topicData of subjectData.topics) {
      const parentTopic = await prisma.topicNode.create({
        data: {
          title: topicData.title,
          description: topicData.description,
          order: topicData.order,
          subjectId: subject.id,
          positionX: Math.random() * 600 + 100,
          positionY: Math.random() * 400 + 100,
          nodeType: topicData.children ? "chapter" : "topic",
        },
      });

      if (topicData.children) {
        for (const childData of topicData.children) {
          await prisma.topicNode.create({
            data: {
              title: childData.title,
              description: childData.description,
              order: childData.order,
              subjectId: subject.id,
              parentId: parentTopic.id,
              positionX: Math.random() * 600 + 100,
              positionY: Math.random() * 400 + 100,
              nodeType: "topic",
            },
          });
        }
      }
    }
  }

  // Create Students and assign to batches
  console.log("🎓 Creating students...");
  const allTopics = await prisma.topicNode.findMany();
  const subjects = await prisma.subject.findMany({ where: { institutionId: institution.id } });

  const students = await Promise.all(
    DEMO_STUDENTS.map(async (s, idx) => {
      const student = await prisma.user.create({
        data: { supabaseId: s.supabaseId, email: s.email, name: s.name, role: Role.STUDENT, institutionId: institution.id },
      });

      // Assign to random batch
      const batch = batches[idx % batches.length];
      await prisma.batchStudent.create({ data: { batchId: batch.id, studentId: student.id } });

      // Create progress for each topic with varied status
      const profile = PROGRESS_PROFILES[idx % PROGRESS_PROFILES.length];
      for (const topic of allTopics) {
        const shouldHaveProgress = Math.random() > 0.3; // 70% of topics have some progress
        if (shouldHaveProgress) {
          await prisma.studentProgress.create({
            data: {
              studentId: student.id,
              topicId: topic.id,
              status: idx < 4 ? ProgressStatus.COMPLETED : idx < 7 ? ProgressStatus.IN_PROGRESS : ProgressStatus.NOT_STARTED,
              updatedAt: new Date(Date.now() - profile.daysAgo * 86400000),
            },
          });
        }
      }

      // Create engagement events
      const eventCount = idx < 4 ? 20 + Math.floor(Math.random() * 15) : idx < 7 ? 5 + Math.floor(Math.random() * 10) : Math.floor(Math.random() * 3);
      for (let i = 0; i < eventCount; i++) {
        const daysAgo = Math.floor(Math.random() * 14);
        const eventTypes: EventType[] = [EventType.LOGIN, EventType.PAGE_VIEW, EventType.RESOURCE_VIEW, EventType.AI_CHAT, EventType.TOPIC_COMPLETE];
        await prisma.engagementEvent.create({
          data: {
            studentId: student.id,
            type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
            metadata: JSON.stringify({ page: "/learning-path", duration: Math.floor(Math.random() * 300) }),
            createdAt: new Date(Date.now() - daysAgo * 86400000 - Math.floor(Math.random() * 86400000)),
          },
        });
      }

      return student;
    })
  );

  console.log("\n✅ Demo data seeded successfully!");
  console.log(`   Institution: ${institution.name}`);
  console.log(`   Teachers: ${teachers.length}`);
  console.log(`   Batches: ${batches.length}`);
  console.log(`   Subjects: ${subjects.length}`);
  console.log(`   Topics: ${allTopics.length}`);
  console.log(`   Students: ${students.length}`);
  console.log("\n🎯 Demo ready for presentation!");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
