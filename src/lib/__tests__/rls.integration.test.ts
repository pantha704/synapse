import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client } from "pg";

// Runs only where a database is reachable; CI without a database skips it.
// opt-in: CI sets a placeholder DATABASE_URL, so never infer it from that
const url = process.env.RLS_TEST_DATABASE_URL;
const suite = url ? describe : describe.skip;

suite("tenant isolation (live database)", () => {
  let client: Client;
  let teacherA = "";
  let teacherB = "";

  beforeAll(async () => {
    client = new Client({ connectionString: url });
    await client.connect();

    const { rows } = await client.query<{ supabase_id: string; institution_id: string }>(
      `select u.supabase_id, u.institution_id
       from users u
       where u.role = 'TEACHER'
       order by u.institution_id`
    );
    const byInstitution = new Map<string, string>();
    for (const r of rows) if (!byInstitution.has(r.institution_id)) byInstitution.set(r.institution_id, r.supabase_id);
    const ids = [...byInstitution.keys()];
    teacherA = ids[0] ? byInstitution.get(ids[0])! : "";
    teacherB = ids[1] ? byInstitution.get(ids[1])! : "";
  }, 20000);

  afterAll(async () => {
    await client?.end();
  });

  /** Counts rows visible to `sub` when the connection is the plain authenticated role. */
  async function visibleSubjects(sub: string) {
    await client.query("begin");
    try {
      await client.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify({ sub })]);
      await client.query("set local role authenticated");
      const { rows } = await client.query<{ n: number }>("select count(*)::int as n from subjects");
      return rows[0].n;
    } finally {
      await client.query("rollback");
    }
  }

  it("two teachers belong to different institutions", () => {
    expect(teacherA).not.toBe("");
    expect(teacherB).not.toBe("");
    expect(teacherA).not.toBe(teacherB);
  });

  it("sees only its own institution's subjects", async () => {
    const a = await visibleSubjects(teacherA);
    const b = await visibleSubjects(teacherB);
    // total across both institutions is strictly greater than either view,
    // unless one institution genuinely has no subjects
    const { rows } = await client.query<{ n: number }>("select count(*)::int as n from subjects");
    expect(a + b).toBeLessThanOrEqual(rows[0].n);
    expect(a === 0 || b === 0 || a + b === rows[0].n).toBe(true);
  });

  it("returns nothing for a caller with no valid subject", async () => {
    expect(await visibleSubjects("00000000-0000-0000-0000-000000000000")).toBe(0);
  });
});
