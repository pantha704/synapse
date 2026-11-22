import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

/**
 * Reached when Supabase authenticated the visitor but no row in public.users
 * matches, so there is no institution, batch or role to show them. Previously
 * this surfaced as a 404, which reads as "the app is broken" instead of
 * "your account is not linked yet".
 */
export default async function NoAccessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-[hsl(220,15%,10%)] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 space-y-5">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Signed in</p>
          <h1 className="text-xl font-semibold">This account isn&apos;t linked to a class yet</h1>
        </div>

        <p className="text-sm text-white/70 leading-relaxed">
          You&apos;re authenticated as <span className="text-white font-medium">{user.email}</span>, but no
          teacher, student or admin record points at it. That usually means the account was
          created before the class was set up.
        </p>

        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4 text-sm text-white/70 space-y-1">
          <p className="text-white/90 font-medium">What to do</p>
          <p>Ask your teacher for the batch join code, or sign out and use a provisioned account.</p>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-500 hover:to-indigo-500 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
