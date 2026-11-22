import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Role comes from public.users, not from user_metadata. Accounts created before
 * provisioning have no role in metadata, so metadata routing dropped them on a
 * page they had no data for — which surfaced as a 404.
 */
export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const appUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { role: true, isSuperAdmin: true },
  });

  if (!appUser) redirect("/no-access");
  if (appUser.isSuperAdmin) redirect("/admin/institutions");
  if (appUser.role === "ADMIN") redirect("/admin");
  if (appUser.role === "TEACHER") redirect("/teacher");
  redirect("/student");
}
