import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Extract role from user metadata (set during signup)
  const role = (user.user_metadata?.role as string) ?? "STUDENT";
  const name = (user.user_metadata?.name as string) ?? user.email ?? "User";

  return (
    <DashboardShell
      user={{ id: user.id, email: user.email!, name, role }}
    >
      {children}
    </DashboardShell>
  );
}
