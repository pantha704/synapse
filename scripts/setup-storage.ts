#!/usr/bin/env node
/**
 * Setup Supabase Storage bucket for resources.
 * Run with: bun run scripts/setup-storage.ts
 */

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.DATABASE_URL;

if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

// For storage admin operations, we need the service role key
// If not available, instruct user to create bucket manually in Supabase dashboard
console.log(`
📦 Supabase Storage Setup
━━━━━━━━━━━━━━━━━━━━━━━━

Bucket Name: resources

Please create the bucket manually in your Supabase dashboard:
1. Go to Storage → Create Bucket
2. Name: resources
3. Public: false
4. File size limit: 50MB

Then set up RLS policies:
1. Teachers (role = 'TEACHER'): INSERT, UPDATE, DELETE
2. Students (role = 'STUDENT'): SELECT only

Or run this SQL in your Supabase SQL Editor:

\`\`\`sql
-- Create bucket (run in Storage dashboard if not available via SQL)
-- Then apply these policies:

CREATE POLICY "Teachers can upload resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'role' = 'TEACHER'
);

CREATE POLICY "Teachers can delete resources"
ON storage.objects FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'TEACHER'
);

CREATE POLICY "Anyone can read resources"
ON storage.objects FOR SELECT
TO authenticated
USING (true);
\`\`\`
`);
