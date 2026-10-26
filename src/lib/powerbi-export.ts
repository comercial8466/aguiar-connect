export const EXPORT_STATUS: Record<string, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  aguardando_cliente: "Aguardando cliente",
  resolvido: "Resolvido",
  fechado: "Fechado",
};
export const EXPORT_PRIORITY: Record<string, string> = { baixa: "Baixa", media: "Média", alta: "Alta", critica: "Crítica" };

export function hoursBetween(a: string | null, b: string | null) {
  if (!a || !b) return null;
  return Math.round(((new Date(b).getTime() - new Date(a).getTime()) / 3_600_000) * 100) / 100;
}

export function exportSlaStatus(due: string | null, resolved: string | null, now = Date.now()) {
  if (!due) return "Sem SLA";
  const ref = resolved ? new Date(resolved).getTime() : now;
  if (ref > new Date(due).getTime()) return "Fora do prazo";
  return resolved ? "Cumprido" : "No prazo";
}

export function csvCell(v: unknown) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export type ExportTicket = {
  id: string;
  title: string;
  category: string;
  company: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  sla_due_at: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  satisfaction_rating: number | null;
};

export function toExportRow(t: ExportTicket, now = Date.now()) {
  return {
    id: t.id,
    titulo: t.title,
    categoria: t.category,
    empresa: t.company ?? "Sem empresa",
    status: EXPORT_STATUS[t.status] ?? t.status,
    prioridade: EXPORT_PRIORITY[t.priority] ?? t.priority,
    atribuido: t.assigned_to ? "Sim" : "Não",
    aberto_em: t.created_at,
    atualizado_em: t.updated_at,
    prazo_sla: t.sla_due_at,
    primeira_resposta_em: t.first_response_at,
    resolvido_em: t.resolved_at,
    horas_ate_resposta: hoursBetween(t.created_at, t.first_response_at),
    horas_ate_resolucao: hoursBetween(t.created_at, t.resolved_at),
    situacao_sla: exportSlaStatus(t.sla_due_at, t.resolved_at, now),
    avaliacao: t.satisfaction_rating,
  };
}
