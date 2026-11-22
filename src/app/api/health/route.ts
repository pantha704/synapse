import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Liveness + database reachability. Public by design (a host probe cannot log in),
 * so it reports status only — the driver message stays in the server log.
 */
export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`select 1`;
    return NextResponse.json({ ok: true, db: "up", ms: Date.now() - started });
  } catch (error) {
    console.error("[health] database unreachable:", (error as Error).message);
    return NextResponse.json({ ok: false, db: "down", ms: Date.now() - started }, { status: 503 });
  }
}
