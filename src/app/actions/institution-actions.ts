"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

async function currentDbUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.user.findUnique({ where: { supabaseId: user.id } });
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function createInstitution(input: { name: string; slug: string }) {
  const user = await currentDbUser();
  if (!user) return { ok: false as const, error: "Not signed in" };
  // platform operators only; an institution admin stays inside their tenant
  if (!user.isSuperAdmin) return { ok: false as const, error: "Only a platform operator can create institutions" };

  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase();
  if (name.length < 3) return { ok: false as const, error: "Name needs at least 3 characters" };
  if (!SLUG_RE.test(slug)) return { ok: false as const, error: "Slug must be lowercase words joined by hyphens" };

  const exists = await prisma.institution.findUnique({ where: { slug } });
  if (exists) return { ok: false as const, error: "That slug is already taken" };

  const institution = await prisma.institution.create({ data: { name, slug } });
  revalidatePath("/admin/institutions");
  return { ok: true as const, id: institution.id };
}
