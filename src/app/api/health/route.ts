import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Liveness + database reachability. Used by the host health check. */
export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`select 1`;
    return NextResponse.json({ ok: true, db: "up", ms: Date.now() - started });
  } catch (error) {
    return NextResponse.json(
      { ok: false, db: "down", ms: Date.now() - started, error: (error as Error).message.slice(0, 120) },
      { status: 503 }
    );
  }
}
