-- Announcements (teacher posts per batch, students mark read)
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "announcement_reads" (
    "id" TEXT NOT NULL,
    "announcement_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "announcement_reads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "announcements_batch_id_idx" ON "announcements"("batch_id");
CREATE INDEX "announcements_created_at_idx" ON "announcements"("created_at");
CREATE INDEX "announcement_reads_student_id_idx" ON "announcement_reads"("student_id");
CREATE UNIQUE INDEX "announcement_reads_announcement_id_student_id_key"
    ON "announcement_reads"("announcement_id", "student_id");

ALTER TABLE "announcements" ADD CONSTRAINT "announcements_batch_id_fkey"
    FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_announcement_id_fkey"
    FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
