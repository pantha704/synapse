import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role = (user.user_metadata?.role as string) ?? "STUDENT";

  if (role === "ADMIN") redirect("/admin");
  if (role === "TEACHER") redirect("/teacher");
  redirect("/student");
}
