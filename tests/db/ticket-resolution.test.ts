// Runs against the real database inside a transaction that is always rolled back.
// Skipped automatically when no database connection (PGHOST) is available.
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

// Needs a database role allowed to UPDATE tickets (e.g. CI with a privileged PG* connection).
function canUpdateTickets() {
  if (!process.env.PGHOST) return false;
  try {
    return execFileSync("psql", ["-Atc", "select has_table_privilege('public.tickets','UPDATE')"], { encoding: "utf8" }).trim() === "t";
  } catch {
    return false;
  }
}
const hasDb = canUpdateTickets();

/** Runs SQL as a staff user inside BEGIN ... ROLLBACK and returns the last row's JSON value. */
function runAsStaff(body: string): any {
  const sql = `
\\set ON_ERROR_STOP 1
BEGIN;
SELECT set_config('request.jwt.claims',
  json_build_object('sub', (SELECT user_id FROM user_roles WHERE role IN ('tecnico','admin') LIMIT 1), 'role','authenticated')::text, true) \\g /dev/null
CREATE TEMP TABLE t_ids ON COMMIT DROP AS
  WITH ins AS (
    INSERT INTO tickets(user_id, title, description, category, priority, created_at)
    SELECT user_id, 'regression', 'regression', 'Outros', 'media', now() - interval '3 hours'
    FROM user_roles WHERE role IN ('tecnico','admin') LIMIT 1 RETURNING id)
  SELECT id FROM ins;
${body}
ROLLBACK;
`;
  const out = execFileSync("psql", ["-At", "-q"], { input: sql, encoding: "utf8" });
  const lines = out.trim().split("\n").filter((l) => l.startsWith("{") || l.startsWith("["));
  return JSON.parse(lines[lines.length - 1]);
}

function expectFails(body: string, message: RegExp) {
  expect(() => runAsStaff(body)).toThrow(message);
}

const ID = "(SELECT id FROM t_ids)";
const row = `SELECT row_to_json(t) FROM (SELECT status, resolved_at FROM tickets WHERE id = ${ID}) t;`;

describe.skipIf(!hasDb)("ticket resolution lifecycle (database)", () => {
  it("resolving sets the resolution date automatically", () => {
    const r = runAsStaff(`UPDATE tickets SET status='resolvido' WHERE id=${ID}; ${row}`);
    expect(r.status).toBe("resolvido");
    expect(r.resolved_at).not.toBeNull();
  });

  it("resolved -> closed keeps the original resolution date", () => {
    const r = runAsStaff(`
      UPDATE tickets SET status='resolvido', resolved_at = now() - interval '2 hours' WHERE id=${ID};
      CREATE TEMP TABLE first ON COMMIT DROP AS SELECT resolved_at FROM tickets WHERE id=${ID};
      UPDATE tickets SET status='fechado' WHERE id=${ID};
      SELECT json_build_object('same', (SELECT resolved_at FROM tickets WHERE id=${ID}) = (SELECT resolved_at FROM first));`);
    expect(r.same).toBe(true);
  });

  it("a direct update cannot overwrite the historical resolution date of a closed ticket", () => {
    const r = runAsStaff(`
      UPDATE tickets SET status='resolvido', resolved_at = now() - interval '2 hours' WHERE id=${ID};
      CREATE TEMP TABLE first ON COMMIT DROP AS SELECT resolved_at FROM tickets WHERE id=${ID};
      UPDATE tickets SET resolved_at = now() WHERE id=${ID};
      UPDATE tickets SET status='fechado', resolved_at = now() - interval '1 hour' WHERE id=${ID};
      SELECT json_build_object('same', (SELECT resolved_at FROM tickets WHERE id=${ID}) = (SELECT resolved_at FROM first));`);
    expect(r.same).toBe(true);
  });

  it("reopening clears the resolution date", () => {
    const r = runAsStaff(`
      UPDATE tickets SET status='fechado' WHERE id=${ID};
      UPDATE tickets SET status='em_andamento' WHERE id=${ID}; ${row}`);
    expect(r.status).toBe("em_andamento");
    expect(r.resolved_at).toBeNull();
  });

  it("an open ticket ignores a resolution date set directly", () => {
    const r = runAsStaff(`UPDATE tickets SET resolved_at = now() WHERE id=${ID}; ${row}`);
    expect(r.resolved_at).toBeNull();
  });

  it("re-resolving after reopening records a new resolution date", () => {
    const r = runAsStaff(`
      UPDATE tickets SET status='resolvido', resolved_at = now() - interval '2 hours' WHERE id=${ID};
      UPDATE tickets SET status='aberto' WHERE id=${ID};
      UPDATE tickets SET status='resolvido' WHERE id=${ID};
      SELECT json_build_object('recent', (SELECT resolved_at FROM tickets WHERE id=${ID}) > now() - interval '1 minute');`);
    expect(r.recent).toBe(true);
  });

  it("a resolution date earlier than the opening date is rejected", () => {
    expectFails(`UPDATE tickets SET status='resolvido', resolved_at = now() - interval '10 days' WHERE id=${ID};`, /tickets_resolved_after_created/);
  });

  it("status changes without a staff session are blocked", () => {
    expectFails(`
      SELECT set_config('request.jwt.claims', '{}', true) \\g /dev/null
      UPDATE tickets SET status='resolvido' WHERE id=${ID};`, /Somente técnicos e gestores/);
  });
});
