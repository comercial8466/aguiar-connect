export type TicketStatus =
  | "aberto"
  | "em_andamento"
  | "aguardando_cliente"
  | "resolvido"
  | "fechado";

export type TicketPriority = "baixa" | "media" | "alta" | "critica";

export const STATUS_LABELS: Record<TicketStatus, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  aguardando_cliente: "Aguardando cliente",
  resolvido: "Resolvido",
  fechado: "Fechado",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

export const SLA_HOURS: Record<TicketPriority, number> = {
  critica: 2,
  alta: 4,
  media: 8,
  baixa: 24,
};

export const TICKET_CATEGORIES = [
  "PDV / Frente de caixa",
  "ERP / Retaguarda",
  "Fiscal (NFC-e, SAT, NF-e)",
  "Rede e internet",
  "Computador / Impressora",
  "Outros",
] as const;

export const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/zip",
] as const;

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export function validateAttachment(file: File): string | null {
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return `Tipo de arquivo não permitido: ${file.type || "desconhecido"}. Aceitamos imagens, PDF, TXT, CSV e ZIP.`;
  }
  if (file.size <= 0 || file.size > MAX_ATTACHMENT_BYTES) {
    return "O arquivo deve ter até 10 MB.";
  }
  return null;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function slaState(dueAt: string | null, resolvedAt: string | null) {
  if (!dueAt) return { label: "Sem SLA", tone: "muted" as const };
  const due = new Date(dueAt).getTime();
  const ref = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
  if (ref > due) return { label: "SLA estourado", tone: "danger" as const };
  const hoursLeft = (due - ref) / 3_600_000;
  if (hoursLeft < 1) return { label: "SLA em risco", tone: "warning" as const };
  return { label: `SLA em ${hoursLeft.toFixed(0)}h`, tone: "ok" as const };
}

export function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
