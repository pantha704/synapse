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
  let totalSubjects = 0;

  beforeAll(async () => {
    client = new Client({ connectionString: url });
    await client.connect();

    // only institutions that actually own a subject can prove anything: with an
    // empty tenant on one side, `a + b <= total` passes even if the policy leaks
    const { rows } = await client.query<{ supabase_id: string; institution_id: string }>(
      `select u.supabase_id, u.institution_id
         from users u
        where u.role = 'TEACHER'
          and exists (select 1 from subjects s where s.institution_id = u.institution_id)
        order by u.institution_id`
    );
    const byInstitution = new Map<string, string>();
    for (const r of rows) if (!byInstitution.has(r.institution_id)) byInstitution.set(r.institution_id, r.supabase_id);
    const ids = [...byInstitution.keys()];
    teacherA = ids[0] ? byInstitution.get(ids[0])! : "";
    teacherB = ids[1] ? byInstitution.get(ids[1])! : "";

    const total = await client.query<{ n: number }>("select count(*)::int as n from subjects");
    totalSubjects = total.rows[0].n;
  }, 20000);

  afterAll(async () => {
    await client?.end();
  });

  /** Runs `fn` inside a transaction as `role`, then always rolls back. */
  async function as(role: "authenticated" | "anon", sub: string | null, fn: () => Promise<void>) {
    await client.query("begin");
    try {
      if (sub) {
        await client.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify({ sub })]);
      }
      await client.query(`set local role ${role}`);
      await fn();
    } finally {
      await client.query("rollback");
    }
  }

  async function visibleSubjects(sub: string) {
    let count = 0;
    await as("authenticated", sub, async () => {
      const { rows } = await client.query<{ n: number }>("select count(*)::int as n from subjects");
      count = rows[0].n;
    });
    return count;
  }

  it("two teachers, each owning subjects, in different institutions", () => {
    expect(teacherA).not.toBe("");
    expect(teacherB).not.toBe("");
    expect(teacherA).not.toBe(teacherB);
  });

  it("each sees only its own institution's subjects, and together they see all of them", async () => {
    const a = await visibleSubjects(teacherA);
    const b = await visibleSubjects(teacherB);
    expect(a).toBeGreaterThan(0);
    expect(b).toBeGreaterThan(0);
    expect(a + b).toBe(totalSubjects);
  });

  it("returns nothing for a caller with no valid subject", async () => {
    expect(await visibleSubjects("00000000-0000-0000-0000-000000000000")).toBe(0);
  });

  it("enables RLS on every public table", async () => {
    // a table with RLS off is readable by anyone holding the anon key, which is
    // shipped to the browser — this caught announcements, announcement_reads,
    // assignments and assignment_submissions, all added after the RLS script
    const { rows } = await client.query<{ relname: string }>(
      `select c.relname
         from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
        order by c.relname`
    );
    expect(rows.map((r) => r.relname)).toEqual([]);
  });

  // Policies are not the boundary: a table-level grant makes a policy irrelevant.
  // These three writes were reachable through the shipped anon key's sibling —
  // the authenticated role every signed-in user gets.
  it("denies curriculum writes from the authenticated role", async () => {
    await expect(
      as("authenticated", teacherA, async () => {
        await client.query("update subjects set name = name");
      })
    ).rejects.toThrow(/permission denied/i);
  });

  it("denies self-enrolment into a batch from the authenticated role", async () => {
    await expect(
      as("authenticated", teacherA, async () => {
        await client.query(
          "insert into batch_students (batch_id, student_id) values ((select id from batches limit 1), 'probe')"
        );
      })
    ).rejects.toThrow(/permission denied/i);
  });

  it("denies every table read to anon", async () => {
    await expect(
      as("anon", null, async () => {
        await client.query("select 1 from subjects");
      })
    ).rejects.toThrow(/permission denied/i);
  });
});
