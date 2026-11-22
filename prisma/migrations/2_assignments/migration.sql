-- Assignments attached to a topic, with per-student submissions
CREATE TYPE "AssignmentStatus" AS ENUM ('NOT_STARTED', 'SUBMITTED', 'GRADED');

CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "due_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "assignment_submissions" (
    "id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "note" TEXT,
    "submitted_at" TIMESTAMP(3),
    "grade" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "assignments_batch_id_idx" ON "assignments"("batch_id");
CREATE INDEX "assignments_topic_id_idx" ON "assignments"("topic_id");
CREATE INDEX "assignment_submissions_student_id_idx" ON "assignment_submissions"("student_id");
CREATE UNIQUE INDEX "assignment_submissions_assignment_id_student_id_key"
    ON "assignment_submissions"("assignment_id", "student_id");

ALTER TABLE "assignments" ADD CONSTRAINT "assignments_batch_id_fkey"
    FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_topic_id_fkey"
    FOREIGN KEY ("topic_id") REFERENCES "topic_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_fkey"
    FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
