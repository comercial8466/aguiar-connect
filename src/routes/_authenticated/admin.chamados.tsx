import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { WHATSAPP_NUMBER } from "@/lib/site";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  formatDateTime,
  slaState,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/tickets";

export const Route = createFileRoute("/_authenticated/admin/chamados")({
  head: () => ({
    meta: [
      { title: "Chamados e SLA — Portal do Gestor | AguiarT.I" },
      {
        name: "description",
        content:
          "Acompanhe todos os chamados do suporte AguiarT.I com status, prazo de SLA e a conversa registrada no WhatsApp de cada cliente.",
      },
      { property: "og:title", content: "Chamados e SLA | AguiarT.I" },
      {
        property: "og:description",
        content: "Status, prazo de SLA e conversa de WhatsApp de cada chamado em uma tela.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GestorChamados,
});

type TicketRow = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  company: string | null;
  status: TicketStatus;
  priority: TicketPriority;
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

type ProfileRow = { id: string; full_name: string | null; company: string | null; phone: string | null };

const WA_PREFIX = "[WhatsApp] ";

const TONE_CLASS: Record<string, string> = {
  ok: "border-transparent bg-accent/15 text-accent-foreground",
  warning: "border-transparent bg-amber-500/15 text-amber-700",
  danger: "border-transparent bg-destructive/15 text-destructive",
  muted: "border-transparent bg-muted text-muted-foreground",
};

function toWhatsAppNumber(raw: string | null | undefined) {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function GestorChamados() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("todos");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tickets")
      .select(
        "id, user_id, title, category, company, status, priority, sla_due_at, first_response_at, resolved_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) toast.error("Falha ao carregar chamados", { description: error.message });
    const rows = (data ?? []) as TicketRow[];
    setTickets(rows);

    const ids = [...new Set(rows.map((r) => r.user_id))];
    if (ids.length > 0) {
      const p = await supabase.from("profiles").select("id, full_name, company, phone").in("id", ids);
      const map: Record<string, ProfileRow> = {};
      for (const row of (p.data ?? []) as ProfileRow[]) map[row.id] = row;
      setProfiles(map);
    }
    setSelectedId((prev) => prev ?? rows[0]?.id ?? null);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) void load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    void supabase
      .from("ticket_comments")
      .select("id, ticket_id, body, internal, author_id, created_at")
      .eq("ticket_id", selectedId)
      .order("created_at")
      .then(({ data }) => {
        if (active) setComments((data ?? []) as CommentRow[]);
      });
    const channel = supabase
      .channel(`gestor-thread-${selectedId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ticket_comments", filter: `ticket_id=eq.${selectedId}` },
        async () => {
          const { data } = await supabase
            .from("ticket_comments")
            .select("id, ticket_id, body, internal, author_id, created_at")
            .eq("ticket_id", selectedId)
            .order("created_at");
          setComments((data ?? []) as CommentRow[]);
        },
      )
      .subscribe();
    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [selectedId]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tickets.filter((t) => {
      if (status !== "todos" && t.status !== status) return false;
      if (!term) return true;
      const client = profiles[t.user_id]?.full_name ?? "";
      return `${t.title} ${t.company ?? ""} ${client} ${t.category}`.toLowerCase().includes(term);
    });
  }, [tickets, status, search, profiles]);

  const selected = useMemo(
    () => tickets.find((t) => t.id === selectedId) ?? null,
    [tickets, selectedId],
  );

  const overdue = tickets.filter(
    (t) => slaState(t.sla_due_at, t.resolved_at).tone === "danger" && !t.resolved_at,
  ).length;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-2xl font-bold text-primary">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Somente Gestores acessam esta tela de acompanhamento.
        </p>
      </div>
    );
  }

  const client = selected ? profiles[selected.user_id] : undefined;
  const waNumber = toWhatsAppNumber(client?.phone) ?? WHATSAPP_NUMBER;
  const waLink = selected
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        `Olá! Aqui é a AguiarT.I sobre o chamado "${selected.title}".`,
      )}`
    : `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Chamados e SLA</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Todos os chamados com status, prazo de SLA e a conversa registrada no WhatsApp.
            {overdue > 0 && ` ${overdue} fora do prazo agora.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/gestor">KPIs de SLA</Link>
          </Button>
          <Button variant="outline" onClick={() => void load()}>
            Atualizar
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título, cliente ou empresa"
          aria-label="Buscar chamados"
          className="max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-56" aria-label="Filtrar por status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {(Object.keys(STATUS_LABELS) as TicketStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Carregando chamados…</p>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Chamado</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Prioridade</th>
                  <th className="px-4 py-3">SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-muted-foreground">
                      Nenhum chamado encontrado.
                    </td>
                  </tr>
                )}
                {filtered.map((t) => {
                  const sla = slaState(t.sla_due_at, t.resolved_at);
                  return (
                    <tr
                      key={t.id}
                      className={t.id === selectedId ? "bg-secondary/10" : undefined}
                      onClick={() => setSelectedId(t.id)}
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedId(t.id)}
                          className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="block font-medium text-primary">{t.title}</span>
                          <span className="block text-xs text-muted-foreground">
                            {profiles[t.user_id]?.full_name ?? "Cliente"} ·{" "}
                            {t.company?.trim() || "Sem empresa"} · {formatDateTime(t.created_at)}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{STATUS_LABELS[t.status]}</Badge>
                      </td>
                      <td className="px-4 py-3">{PRIORITY_LABELS[t.priority]}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${TONE_CLASS[sla.tone]}`}
                        >
                          {sla.label}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          Prazo: {formatDateTime(t.sla_due_at)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <aside className="rounded-xl border border-border p-5 shadow-card">
            {!selected ? (
              <p className="text-sm text-muted-foreground">Selecione um chamado para ver a conversa.</p>
            ) : (
              <>
                <h2 className="font-display text-lg font-semibold text-primary">{selected.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {client?.full_name ?? "Cliente"} · {client?.phone?.trim() || "Sem telefone cadastrado"}
                </p>
                <Button className="mt-4 w-full" asChild>
                  <a href={waLink} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon className="size-4" />
                    Abrir conversa no WhatsApp
                  </a>
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  {toWhatsAppNumber(client?.phone)
                    ? "Abre o WhatsApp do cliente."
                    : "Sem telefone do cliente: abre o WhatsApp oficial da AguiarT.I."}
                </p>

                <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Conversa registrada
                </h3>
                <ul className="mt-3 max-h-[50vh] space-y-3 overflow-y-auto pr-1">
                  {comments.length === 0 && (
                    <li className="text-sm text-muted-foreground">Nenhuma mensagem registrada ainda.</li>
                  )}
                  {comments.map((c) => {
                    const viaWa = c.body.startsWith(WA_PREFIX);
                    return (
                      <li key={c.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span>{formatDateTime(c.created_at)}</span>
                          {viaWa && (
                            <span className="inline-flex items-center gap-1 text-accent-foreground">
                              <WhatsAppIcon className="size-3" /> WhatsApp
                            </span>
                          )}
                          {c.internal && <span>Nota interna</span>}
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                          {viaWa ? c.body.slice(WA_PREFIX.length) : c.body}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
