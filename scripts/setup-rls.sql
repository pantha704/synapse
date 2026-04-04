-- Supabase Row Level Security (RLS) Policies
-- Run this in your Supabase SQL Editor
-- Generated: 2026-04-04

-- Enable RLS on all tables
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_resource_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- ─── Institutions ──────────────────────────────────────
-- Anyone can read institutions (needed for join flow)
CREATE POLICY "Anyone can view institutions"
  ON institutions FOR SELECT
  TO authenticated
  USING (true);

-- ─── Users ─────────────────────────────────────────────
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = supabase_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = supabase_id)
  WITH CHECK (auth.uid() = supabase_id);

-- ─── Batches ───────────────────────────────────────────
-- Anyone can read batches (needed for join flow)
CREATE POLICY "Anyone can view batches"
  ON batches FOR SELECT
  TO authenticated
  USING (true);

-- Teachers can insert batches they own
CREATE POLICY "Teachers can create own batches"
  ON batches FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = teacher_id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.supabase_id = auth.uid() AND users.role = 'TEACHER'
    )
  );

-- ─── Batch Students ────────────────────────────────────
-- Students can view batch enrollments
CREATE POLICY "Anyone can view batch students"
  ON batch_students FOR SELECT
  TO authenticated
  USING (true);

-- Students can join batches
CREATE POLICY "Students can join batches"
  ON batch_students FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.supabase_id = auth.uid() AND users.role = 'STUDENT'
    )
  );

-- ─── Subjects ──────────────────────────────────────────
-- Anyone can view subjects
CREATE POLICY "Anyone can view subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (true);

-- ─── Topic Nodes ───────────────────────────────────────
-- Anyone can view topics
CREATE POLICY "Anyone can view topics"
  ON topic_nodes FOR SELECT
  TO authenticated
  USING (true);

-- ─── Resources ─────────────────────────────────────────
-- Anyone can view resources
CREATE POLICY "Anyone can view resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

-- ─── Student Progress ──────────────────────────────────
-- Students can view and update their own progress
CREATE POLICY "Students can view own progress"
  ON student_progress FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id
  );

CREATE POLICY "Students can update own progress"
  ON student_progress FOR ALL
  TO authenticated
  USING (
    auth.uid() = student_id
  )
  WITH CHECK (
    auth.uid() = student_id
  );

-- ─── Teacher Progress ──────────────────────────────────
-- Teachers can view progress for their batches
CREATE POLICY "Teachers can view batch progress"
  ON teacher_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM batches
      WHERE batches.id = teacher_progress.batch_id
      AND batches.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can assign progress"
  ON teacher_progress FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM batches
      WHERE batches.id = teacher_progress.batch_id
      AND batches.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM batches
      WHERE batches.id = teacher_progress.batch_id
      AND batches.teacher_id = auth.uid()
    )
  );

-- ─── Student Resource Progress ─────────────────────────
-- Students can manage their own resource progress
CREATE POLICY "Students can view own resource progress"
  ON student_resource_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can update own resource progress"
  ON student_resource_progress FOR ALL
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- ─── Engagement Events ─────────────────────────────────
-- Students can insert their own events
CREATE POLICY "Students can log own events"
  ON engagement_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Students can view own events
CREATE POLICY "Students can view own events"
  ON engagement_events FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- ─── AI Sessions ───────────────────────────────────────
-- Students can manage their own AI sessions
CREATE POLICY "Students can view own AI sessions"
  ON ai_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can create own AI sessions"
  ON ai_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can delete own AI sessions"
  ON ai_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = student_id);

-- ─── AI Messages ───────────────────────────────────────
-- Students can view messages from their sessions
CREATE POLICY "Students can view own AI messages"
  ON ai_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ai_sessions
      WHERE ai_sessions.id = ai_messages.session_id
      AND ai_sessions.student_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert own AI messages"
  ON ai_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_sessions
      WHERE ai_sessions.id = ai_messages.session_id
      AND ai_sessions.student_id = auth.uid()
    )
  );

-- ─── Document Chunks ───────────────────────────────────
-- Anyone in the institution can view document chunks
CREATE POLICY "Anyone can view document chunks"
  ON document_chunks FOR SELECT
  TO authenticated
  USING (true);
