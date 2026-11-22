import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[hsl(220,20%,6%)] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[hsl(220,15%,10%)]/80 p-8 text-center space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">404</p>
        <h1 className="text-xl font-semibold tracking-tight">This page doesn&apos;t exist</h1>
        <p className="text-sm text-white/65 leading-relaxed">
          The link may be out of date, or the subject, batch or student it pointed at has been
          removed. Nothing is broken on your account.
        </p>
        <Button
          render={<Link href="/" />}
          nativeButton={false}
          className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
        >
          Back to your dashboard
        </Button>
      </div>
    </main>
  );
}
