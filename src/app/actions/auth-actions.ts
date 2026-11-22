"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const SELF_SERVICE_ROLES: Role[] = ["STUDENT", "TEACHER"];

/**
 * Create the public.users row for a freshly signed-up auth account.
 *
 * This used to trust its arguments: `syncUserAction(supabaseId, email, name, role)`
 * took the identity *and the role* from the caller, was exported as a server
 * action, and had no auth check at all — so anyone could POST role="ADMIN" for
 * someone else's id and be routed to /admin by the new DB-row routing.
 *
 * Now the identity comes from the session, the role is limited to the two roles a
 * person may choose for themselves, and an existing row is returned untouched.
 */
export async function syncUserAction(joinCode?: string) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) throw new Error("UNAUTHENTICATED");

  const existing = await prisma.user.findUnique({ where: { supabaseId: authUser.id } });
  if (existing) return existing;

  // a self-service signup can never mint an ADMIN or platform operator
  const requested = (authUser.user_metadata?.role as string | undefined)?.toUpperCase();
  const role: Role = SELF_SERVICE_ROLES.includes(requested as Role) ? (requested as Role) : "STUDENT";

  // join code decides the tenant; otherwise the account is unprovisioned and
  // /no-access asks an operator to place it
  let institutionId: string | null = null;
  let batchId: string | null = null;

  if (role === "STUDENT" && joinCode) {
    const batch = await prisma.batch.findUnique({
      where: { joinCode: joinCode.toUpperCase() },
      select: { id: true, institutionId: true },
    });
    if (batch) {
      institutionId = batch.institutionId;
      batchId = batch.id;
    }
  }

  if (!institutionId && role === "TEACHER") {
    // teachers still land somewhere usable for the demo, but never as an operator
    institutionId = (await prisma.institution.findFirst({ select: { id: true } }))?.id ?? null;
  }

  if (!institutionId) {
    throw new Error("NO_INSTITUTION");
  }

  const user = await prisma.user.create({
    data: {
      supabaseId: authUser.id,
      email: authUser.email,
      name: (authUser.user_metadata?.full_name as string | undefined) ?? authUser.email.split("@")[0],
      role,
      institutionId,
    },
  });

  if (batchId) {
    await prisma.batchStudent.create({ data: { batchId, studentId: user.id } });
  }

  return user;
}
