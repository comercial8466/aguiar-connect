import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Paperclip, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import WhatsAppIcon from "@/components/site/WhatsAppIcon";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  formatBytes,
  formatDateTime,
  slaState,
  validateAttachment,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/tickets";

export const Route = createFileRoute("/_authenticated/atendimento-whatsapp")({
  head: () => ({
    meta: [
      { title: "Atendimento por WhatsApp — Portal do Técnico | AguiarT.I" },
      {
        name: "description",
        content:
          "Responda os chamados pelo WhatsApp sem sair do portal AguiarT.I: histórico de mensagens, anexos e SLA em uma única tela.",
      },
      { property: "og:title", content: "Atendimento por WhatsApp | AguiarT.I" },
      {
        property: "og:description",
        content: "Histórico de mensagens, anexos e resposta pelo WhatsApp em uma única tela.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AtendimentoWhatsApp,
});

type TicketRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  company: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  sla_due_at: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  created_at: string;
};

type CommentRow = {
  id: string;
  ticket_id: string;
  body: string;
  internal: boolean;
  author_id: string;
  created_at: string;
};

type AttachmentRow = {
  id: string;
  ticket_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  created_at: string;
};

type ProfileRow = { id: string; full_name: string | null; company: string | null; phone: string | null };

const OPEN_STATUSES: TicketStatus[] = ["aberto", "em_andamento", "aguardando_cliente"];
const WA_PREFIX = "[WhatsApp] ";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function toWhatsAppNumber(raw: string) {
  const digits = onlyDigits(raw);
  if (digits.length < 10) return null;
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function AtendimentoWhatsApp() {
  const { user, hasAnyRole } = useAuth();
  const staff = hasAnyRole(["tecnico", "admin"]);

  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [attachments, setAttachments] = useState<AttachmentRow[]>([]);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tickets")
      .select(
        "id, user_id, title, description, category, company, status, priority, assigned_to, sla_due_at, first_response_at, resolved_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error("Falha ao carregar chamados", { description: error.message });
    const rows = (data ?? []) as TicketRow[];
    setTickets(rows);

    const userIds = [...new Set(rows.map((r) => r.user_id))].slice(0, 200);
    if (userIds.length > 0) {
      const p = await supabase.from("profiles").select("id, full_name, company, phone").in("id", userIds);
      const map: Record<string, ProfileRow> = {};
      for (const row of (p.data ?? []) as ProfileRow[]) map[row.id] = row;
      setProfiles(map);
    }
    setSelectedId((prev) => prev ?? rows[0]?.id ?? null);
    setLoading(false);
  };

  const loadThread = async (ticketId: string) => {
    setThreadLoading(true);
    const [c, a] = await Promise.all([
      supabase
        .from("ticket_comments")
        .select("id, ticket_id, body, internal, author_id, created_at")
        .eq("ticket_id", ticketId)
        .order("created_at"),
      supabase
        .from("ticket_attachments")
        .select("id, ticket_id, file_name, mime_type, size_bytes, storage_path, created_at")
        .eq("ticket_id", ticketId)
        .order("created_at"),
    ]);
    setComments((c.data ?? []) as CommentRow[]);
    setAttachments((a.data ?? []) as AttachmentRow[]);
    setThreadLoading(false);
  };

  useEffect(() => {
    if (staff && user?.id) void loadTickets();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff, user?.id]);

  const selected = useMemo(
    () => tickets.find((t) => t.id === selectedId) ?? null,
    [tickets, selectedId],
  );

  useEffect(() => {
    if (!selectedId) return;
    void loadThread(selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (!selected) return;
    setPhone(profiles[selected.user_id]?.phone ?? "");
    setMessage("");
  }, [selected?.id, profiles]);

  useEffect(() => {
    if (!selectedId) return;
    const channel = supabase
      .channel(`wa-thread-${selectedId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ticket_comments", filter: `ticket_id=eq.${selectedId}` },
        () => void loadThread(selectedId),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [selectedId]);

  const ordered = useMemo(() => {
    const mine = tickets.filter((t) => t.assigned_to === user?.id);
    const rest = tickets.filter((t) => t.assigned_to !== user?.id && OPEN_STATUSES.includes(t.status));
    return [...mine, ...rest];
  }, [tickets, user?.id]);

  const registerMessage = async (openWhatsApp: boolean) => {
    if (!user || !selected) return;
    const text = message.trim();
    if (text.length < 2) {
      toast.error("Escreva a mensagem antes de enviar.");
      return;
    }
    const number = openWhatsApp ? toWhatsAppNumber(phone) : null;
    if (openWhatsApp && !number) {
      toast.error("Informe um telefone válido com DDD para abrir o WhatsApp.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.from("ticket_comments").insert({
      ticket_id: selected.id,
      author_id: user.id,
      body: `${openWhatsApp ? WA_PREFIX : ""}${text}`.slice(0, 5000),
      internal: false,
    });
    if (!error && !selected.first_response_at) {
      await supabase
        .from("tickets")
        .update({ first_response_at: new Date().toISOString() })
        .eq("id", selected.id);
    }
    setBusy(false);
    if (error) {
      toast.error("Não foi possível registrar a mensagem", { description: error.message });
      return;
    }
    setMessage("");
    void loadThread(selected.id);
    void loadTickets();

    if (openWhatsApp && number) {
      const body = `Olá! Aqui é o suporte AguiarT.I sobre o chamado "${selected.title}".\n\n${text}`;
      window.open(
        `https://wa.me/${number}?text=${encodeURIComponent(body)}`,
        "_blank",
        "noopener,noreferrer",
      );
      toast.success("Mensagem registrada e aberta no WhatsApp");
    } else {
      toast.success("Mensagem registrada no histórico");
    }
  };

  const uploadFile = async (file: File) => {
    if (!user || !selected) return;
    const err = validateAttachment(file);
    if (err) {
      toast.error("Anexo inválido", { description: err });
      return;
    }
    const path = `${selected.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
    const up = await supabase.storage
      .from("ticket-attachments")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) {
      toast.error("Falha no envio do anexo", { description: up.error.message });
      return;
    }
    const { error } = await supabase.from("ticket_attachments").insert({
      ticket_id: selected.id,
      uploaded_by: user.id,
      storage_path: path,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    });
    if (error) {
      toast.error("Falha ao registrar o anexo", { description: error.message });
      return;
    }
    toast.success("Anexo enviado");
    void loadThread(selected.id);
  };

  const openAttachment = async (path: string) => {
    const { data, error } = await supabase.storage.from("ticket-attachments").createSignedUrl(path, 60);
    if (error || !data) {
      toast.error("Não foi possível abrir o anexo", { description: error?.message });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const shareAttachment = async (att: AttachmentRow) => {
    const number = toWhatsAppNumber(phone);
    if (!number) {
      toast.error("Informe um telefone válido com DDD para compartilhar o anexo.");
      return;
    }
    const { data, error } = await supabase.storage
      .from("ticket-attachments")
      .createSignedUrl(att.storage_path, 60 * 60 * 24);
    if (error || !data) {
      toast.error("Não foi possível gerar o link do anexo", { description: error?.message });
      return;
    }
    const body = `Arquivo do chamado "${selected?.title ?? ""}": ${att.file_name}\nLink válido por 24h: ${data.signedUrl}`;
    window.open(
      `https://wa.me/${number}?text=${encodeURIComponent(body)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  if (!staff) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-2xl font-bold text-primary">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Somente Técnicos e Gestores acessam o atendimento por WhatsApp.
        </p>
      </div>
    );
  }

  const client = selected ? profiles[selected.user_id] : undefined;
  const sla = selected ? slaState(selected.sla_due_at, selected.resolved_at) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Atendimento por WhatsApp</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Responda o cliente pelo WhatsApp com o histórico e os anexos do chamado na mesma tela.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/tecnico">Fila do técnico</Link>
          </Button>
          <Button variant="outline" onClick={() => void loadTickets()}>
            Atualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Carregando chamados…</p>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-xl border border-border">
            <p className="border-b border-border p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Chamados ({ordered.length})
            </p>
            <ul className="max-h-[70vh] divide-y divide-border overflow-y-auto">
              {ordered.length === 0 && (
                <li className="p-4 text-sm text-muted-foreground">Nenhum chamado disponível.</li>
              )}
              {ordered.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(t.id)}
                    aria-current={t.id === selectedId}
                    className={`w-full px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      t.id === selectedId ? "bg-secondary/15" : "hover:bg-muted/50"
                    }`}
                  >
                    <span className="block truncate text-sm font-medium text-primary">{t.title}</span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {t.company?.trim() || "Sem empresa"} · {STATUS_LABELS[t.status]} ·{" "}
                      {PRIORITY_LABELS[t.priority]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {!selected ? (
            <p className="text-sm text-muted-foreground">Selecione um chamado à esquerda.</p>
          ) : (
            <section className="space-y-6">
              <header className="rounded-xl border border-border p-6 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-xl font-semibold text-primary">{selected.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {client?.full_name ?? "Cliente"} · {selected.company?.trim() || "Sem empresa"} ·{" "}
                      {selected.category}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{STATUS_LABELS[selected.status]}</Badge>
                    <Badge>{PRIORITY_LABELS[selected.priority]}</Badge>
                    {sla && (
                      <Badge variant={sla.tone === "danger" ? "destructive" : "outline"}>
                        {sla.label}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-line rounded-lg bg-muted/40 p-4 text-sm">
                  {selected.description}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Aberto em {formatDateTime(selected.created_at)} · prazo {formatDateTime(selected.sla_due_at)}
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link to="/chamados/$ticketId" params={{ ticketId: selected.id }}>
                    Abrir chamado completo
                  </Link>
                </Button>
              </header>

              <div className="rounded-xl border border-border p-6 shadow-card">
                <h3 className="font-semibold">Histórico de mensagens</h3>
                {threadLoading ? (
                  <p className="mt-3 text-sm text-muted-foreground">Carregando conversa…</p>
                ) : comments.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">Nenhuma mensagem registrada.</p>
                ) : (
                  <ul className="mt-4 max-h-[45vh] space-y-3 overflow-y-auto pr-1">
                    {comments.map((c) => {
                      const fromStaff = c.author_id !== selected.user_id;
                      const viaWhats = c.body.startsWith(WA_PREFIX);
                      return (
                        <li
                          key={c.id}
                          className={`rounded-lg border p-4 text-sm ${
                            fromStaff ? "border-primary/30 bg-secondary/10" : "border-border"
                          }`}
                        >
                          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>{fromStaff ? "Equipe AguiarT.I" : client?.full_name ?? "Cliente"}</span>
                            <span>{formatDateTime(c.created_at)}</span>
                            {viaWhats && (
                              <Badge variant="outline" className="gap-1">
                                <WhatsAppIcon className="h-3 w-3" aria-hidden="true" /> WhatsApp
                              </Badge>
                            )}
                            {c.internal && <Badge variant="secondary">Nota interna</Badge>}
                          </div>
                          <p className="whitespace-pre-line">
                            {viaWhats ? c.body.slice(WA_PREFIX.length) : c.body}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="rounded-xl border border-border p-6 shadow-card">
                <h3 className="font-semibold">Anexos do chamado</h3>
                <ul className="mt-3 space-y-2">
                  {attachments.length === 0 && (
                    <li className="text-sm text-muted-foreground">Nenhum anexo enviado.</li>
                  )}
                  {attachments.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-sm">
                        <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        <span className="truncate">{a.file_name}</span>
                        <span className="text-xs text-muted-foreground">{formatBytes(a.size_bytes)}</span>
                      </span>
                      <span className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => void openAttachment(a.storage_path)}>
                          Baixar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => void shareAttachment(a)}>
                          Enviar no WhatsApp
                        </Button>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="wa-file">Anexar arquivo (até 10 MB)</Label>
                  <Input
                    id="wa-file"
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.csv,.zip"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void uploadFile(f);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border p-6 shadow-card">
                <h3 className="font-semibold">Responder pelo WhatsApp</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-[220px_1fr]">
                  <div className="space-y-2">
                    <Label htmlFor="wa-phone">WhatsApp do cliente</Label>
                    <Input
                      id="wa-phone"
                      inputMode="tel"
                      placeholder="(51) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {client?.phone ? "Telefone do cadastro do cliente." : "Cliente sem telefone cadastrado."}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wa-message">Mensagem</Label>
                    <Textarea
                      id="wa-message"
                      rows={5}
                      maxLength={5000}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escreva a resposta que será registrada no chamado e aberta no WhatsApp."
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="hero" disabled={busy} onClick={() => void registerMessage(true)}>
                    <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
                    Registrar e enviar no WhatsApp
                  </Button>
                  <Button variant="outline" disabled={busy} onClick={() => void registerMessage(false)}>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    Só registrar no portal
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
