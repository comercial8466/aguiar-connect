import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export const Route = createFileRoute("/_authenticated/chamados/$ticketId")({
  head: () => ({
    meta: [
      { title: "Detalhe do Chamado — Portal | AguiarT.I" },
      {
        name: "description",
        content:
          "Histórico do atendimento, anexos seguros e controle de SLA do chamado no portal AguiarT.I.",
      },
      { property: "og:title", content: "Detalhe do Chamado | AguiarT.I" },
      { property: "og:description", content: "Histórico, anexos e SLA do atendimento." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TicketDetail,
});

type Ticket = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  sla_due_at: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  created_at: string;
};

type Comment = {
  id: string;
  body: string;
  internal: boolean;
  author_id: string;
  created_at: string;
};

type Attachment = {
  id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  created_at: string;
};

function TicketDetail() {
  const { ticketId } = Route.useParams();
  const { user, hasAnyRole } = useAuth();
  const staff = hasAnyRole(["tecnico", "admin"]);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const [t, c, a] = await Promise.all([
      supabase.from("tickets").select("*").eq("id", ticketId).maybeSingle(),
      supabase
        .from("ticket_comments")
        .select("id, body, internal, author_id, created_at")
        .eq("ticket_id", ticketId)
        .order("created_at"),
      supabase
        .from("ticket_attachments")
        .select("id, file_name, mime_type, size_bytes, storage_path, created_at")
        .eq("ticket_id", ticketId)
        .order("created_at"),
    ]);
    setTicket((t.data as Ticket | null) ?? null);
    setComments((c.data ?? []) as Comment[]);
    setAttachments((a.data ?? []) as Attachment[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || body.trim().length < 2) return;
    setBusy(true);
    const { error } = await supabase.from("ticket_comments").insert({
      ticket_id: ticketId,
      author_id: user.id,
      body: body.trim().slice(0, 5000),
      internal: staff ? internal : false,
    });
    if (!error && staff && ticket && !ticket.first_response_at) {
      await supabase
        .from("tickets")
        .update({ first_response_at: new Date().toISOString() })
        .eq("id", ticketId);
    }
    setBusy(false);
    if (error) {
      toast.error("Não foi possível enviar a mensagem", { description: error.message });
      return;
    }
    setBody("");
    void load();
  };

  type TicketPatch = Partial<{
    status: TicketStatus;
    priority: TicketPriority;
    assigned_to: string | null;
    sla_due_at: string | null;
    resolved_at: string | null;
    first_response_at: string | null;
  }>;

  const updateTicket = async (patch: TicketPatch) => {
    const { error } = await supabase.from("tickets").update(patch).eq("id", ticketId);
    if (error) {
      toast.error("Não foi possível atualizar o chamado", { description: error.message });
      return;
    }
    toast.success("Chamado atualizado");
    void load();
  };

  const uploadFile = async (file: File) => {
    if (!user) return;
    const err = validateAttachment(file);
    if (err) {
      toast.error("Anexo inválido", { description: err });
      return;
    }
    const path = `${ticketId}/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
    const up = await supabase.storage
      .from("ticket-attachments")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) {
      toast.error("Falha no envio do anexo", { description: up.error.message });
      return;
    }
    const { error } = await supabase.from("ticket_attachments").insert({
      ticket_id: ticketId,
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
    void load();
  };

  const openAttachment = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("ticket-attachments")
      .createSignedUrl(path, 60);
    if (error || !data) {
      toast.error("Não foi possível abrir o anexo", { description: error?.message });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-sm text-muted-foreground">Carregando…</div>;
  }

  if (!ticket) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-sm text-muted-foreground">Chamado não encontrado ou sem permissão de acesso.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/chamados">Voltar</Link>
        </Button>
      </div>
    );
  }

  const sla = slaState(ticket.sla_due_at, ticket.resolved_at);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <Link to="/chamados" className="text-sm text-muted-foreground hover:underline">
        ← Voltar para os chamados
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-primary">{ticket.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{STATUS_LABELS[ticket.status]}</Badge>
        <Badge>{PRIORITY_LABELS[ticket.priority]}</Badge>
        <span className={sla.tone === "danger" ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
          {sla.label} · prazo {formatDateTime(ticket.sla_due_at)}
        </span>
      </div>

      <p className="mt-6 whitespace-pre-line rounded-xl border border-border p-4 text-sm">
        {ticket.description}
      </p>

      {staff && (
        <section className="mt-8 grid gap-4 rounded-xl border border-border p-6 shadow-card sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={ticket.status}
              onValueChange={(v) =>
                updateTicket({
                  status: v,
                  resolved_at:
                    v === "resolvido" || v === "fechado" ? new Date().toISOString() : null,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABELS) as TicketStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Prioridade</Label>
            <Select value={ticket.priority} onValueChange={(v) => updateTicket({ priority: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PRIORITY_LABELS) as TicketPriority[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sla">Prazo de SLA</Label>
            <Input
              id="sla"
              type="datetime-local"
              defaultValue={ticket.sla_due_at ? ticket.sla_due_at.slice(0, 16) : ""}
              onBlur={(e) =>
                e.target.value
                  ? updateTicket({ sla_due_at: new Date(e.target.value).toISOString() })
                  : undefined
              }
            />
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-semibold">Anexos</h2>
        <ul className="mt-3 space-y-2">
          {attachments.length === 0 && (
            <li className="text-sm text-muted-foreground">Nenhum anexo enviado.</li>
          )}
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <span className="flex min-w-0 items-center gap-2 text-sm">
                <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="truncate">{a.file_name}</span>
                <span className="text-xs text-muted-foreground">{formatBytes(a.size_bytes)}</span>
              </span>
              <Button variant="outline" size="sm" onClick={() => openAttachment(a.storage_path)}>
                Baixar
              </Button>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-2">
          <Label htmlFor="new-file">Enviar anexo (até 10 MB)</Label>
          <Input
            id="new-file"
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.csv,.zip"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadFile(f);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold">Histórico do atendimento</h2>
        <ul className="mt-4 space-y-3">
          {comments.length === 0 && (
            <li className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</li>
          )}
          {comments.map((c) => (
            <li
              key={c.id}
              className={`rounded-lg border p-4 text-sm ${
                c.internal ? "border-dashed border-primary/40 bg-muted/40" : "border-border"
              }`}
            >
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatDateTime(c.created_at)}</span>
                {c.internal && <Badge variant="secondary">Nota interna</Badge>}
              </div>
              <p className="whitespace-pre-line">{c.body}</p>
            </li>
          ))}
        </ul>

        <form className="mt-6 space-y-3" onSubmit={addComment}>
          <Label htmlFor="msg">Nova mensagem</Label>
          <Textarea
            id="msg"
            rows={4}
            maxLength={5000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
          {staff && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={internal} onCheckedChange={(v) => setInternal(v === true)} />
              Nota interna (não visível ao cliente)
            </label>
          )}
          <Button type="submit" variant="hero" disabled={busy}>
            Enviar
          </Button>
        </form>
      </section>
    </div>
  );
}
