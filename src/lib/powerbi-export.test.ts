import { describe, expect, it } from "vitest";
import { csvCell, exportSlaStatus, hoursBetween, toExportRow, type ExportTicket } from "./powerbi-export";

const NOW = new Date("2026-10-26T12:00:00Z").getTime();
const base: ExportTicket = {
  id: "1", title: "PDV parado", category: "Outros", company: null, status: "aberto", priority: "critica",
  assigned_to: null, sla_due_at: "2026-10-26T14:00:00Z", first_response_at: null, resolved_at: null,
  created_at: "2026-10-26T10:00:00Z", updated_at: "2026-10-26T10:00:00Z", satisfaction_rating: null,
};

describe("exported SLA status", () => {
  it("resolved before the deadline is Cumprido", () => {
    expect(exportSlaStatus("2026-10-26T14:00:00Z", "2026-10-26T13:00:00Z", NOW)).toBe("Cumprido");
  });
  it("resolved after the deadline is Fora do prazo", () => {
    expect(exportSlaStatus("2026-10-26T14:00:00Z", "2026-10-26T15:00:00Z", NOW)).toBe("Fora do prazo");
  });
  it("open ticket within deadline is No prazo, never Cumprido", () => {
    expect(exportSlaStatus("2026-10-26T14:00:00Z", null, NOW)).toBe("No prazo");
  });
  it("open ticket past the deadline is Fora do prazo", () => {
    expect(exportSlaStatus("2026-10-26T11:00:00Z", null, NOW)).toBe("Fora do prazo");
  });
  it("no deadline is Sem SLA", () => {
    expect(exportSlaStatus(null, null, NOW)).toBe("Sem SLA");
  });
});

describe("exported row", () => {
  it("reopened ticket (no resolution date) has blank resolution hours", () => {
    const r = toExportRow({ ...base, status: "em_andamento" }, NOW);
    expect(r.horas_ate_resolucao).toBeNull();
    expect(r.situacao_sla).toBe("No prazo");
  });
  it("missing first response gives blank response hours", () => {
    expect(toExportRow(base, NOW).horas_ate_resposta).toBeNull();
  });
  it("computes hours to resolution with 2 decimals", () => {
    const r = toExportRow({ ...base, status: "resolvido", resolved_at: "2026-10-26T11:30:00Z" }, NOW);
    expect(r.horas_ate_resolucao).toBe(1.5);
    expect(r.situacao_sla).toBe("Cumprido");
    expect(r.status).toBe("Resolvido");
  });
  it("unrated ticket exports blank rating and missing company as Sem empresa", () => {
    const r = toExportRow(base, NOW);
    expect(r.avaliacao).toBeNull();
    expect(r.empresa).toBe("Sem empresa");
  });
  it("hoursBetween returns null when a date is missing", () => {
    expect(hoursBetween("2026-10-26T10:00:00Z", null)).toBeNull();
  });
  it("csv escapes semicolons and quotes", () => {
    expect(csvCell('a;"b"')).toBe('"a;""b"""');
  });
});
