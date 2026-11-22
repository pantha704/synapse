"use server";

import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { parseStudentCsv } from "@/lib/csv";

export type ImportResult = {
  ok: boolean;
  created: number;
  enrolled: number;
  skipped: string[];
  errors: string[];
};

async function currentDbUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.user.findUnique({ where: { supabaseId: user.id } });
}

export async function importStudentsCsv(csv: string, batchId: string): Promise<ImportResult> {
  const user = await currentDbUser();
  const fail = (error: string): ImportResult => ({ ok: false, created: 0, enrolled: 0, skipped: [], errors: [error] });
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) return fail("Only teachers or admins can import");

  const batch = await prisma.batch.findFirst({
    // ADMIN used to hit this branch unfiltered: any batch id in any tenant passed.
    where: {
      id: batchId,
      ...(user.role === "TEACHER"
        ? { teacherId: user.id }
        : { institutionId: user.institutionId }),
    },
  });
  if (!batch) return fail("Batch not found for this account");

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return fail("SUPABASE_SERVICE_ROLE_KEY is not set on the server");

  const admin = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { rows, skipped } = parseStudentCsv(csv);
  if (rows.length === 0) return { ok: false, created: 0, enrolled: 0, skipped, errors: ["No valid rows found"] };

  let created = 0;
  let enrolled = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      let supabaseId: string | null = null;

      // createUser with a random password locked every imported student out:
      // the account existed, nobody knew the password, and no mail was sent.
      const { data, error } = await admin.auth.admin.inviteUserByEmail(row.email, {
        data: { name: row.name, role: "STUDENT" },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://synapse-10ue.onrender.com"}/auth/callback?next=/student`,
      });

      if (error) {
        if (!/already/i.test(error.message)) throw new Error(error.message);
        const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        supabaseId = existing?.users.find((u) => u.email?.toLowerCase() === row.email)?.id ?? null;
        if (!supabaseId) throw new Error("user exists in auth but could not be found");
      } else {
        supabaseId = data.user?.id ?? null;
        created += 1;
      }
      if (!supabaseId) throw new Error("no auth id returned");

      const existingUser = await prisma.user.findUnique({ where: { supabaseId } });
      if (existingUser && existingUser.institutionId !== batch.institutionId) {
        throw new Error("already belongs to another institution");
      }

      const dbUser = await prisma.user.upsert({
        where: { supabaseId },
        create: {
          supabaseId,
          email: row.email,
          name: row.name,
          role: "STUDENT",
          institutionId: batch.institutionId,
        },
        update: { name: row.name },
      });

      await prisma.batchStudent.upsert({
        where: { batchId_studentId: { batchId: batch.id, studentId: dbUser.id } },
        create: { batchId: batch.id, studentId: dbUser.id },
        update: {},
      });
      enrolled += 1;
    } catch (err) {
      errors.push(`${row.email}: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  revalidatePath("/teacher/students");
  revalidatePath("/student/learning-path");
  return { ok: errors.length === 0, created, enrolled, skipped, errors };
}
