import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Inbox, MessageSquare, Timer } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  formatDateTime,
  slaState,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/tickets";

export const Route = createFileRoute("/_authenticated/tecnico")({
  head: () => ({
    meta: [
      { title: "Área do Técnico — Chamados Atribuídos e SLA | AguiarT.I" },
      {
        name: "description",
        content:
          "Fila de atendimento do técnico AguiarT.I: chamados atribuídos, histórico de interações e SLA por cliente.",
      },
      { property: "og:title", content: "Área do Técnico | AguiarT.I" },
      {
        property: "og:description",
        content: "Chamados atribuídos, histórico e SLA por cliente no portal AguiarT.I.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AreaTecnico,
});

type TicketRow = {
  id: string;
  title: string;
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
  created_at: string;
};

type Contract = {
  company: string;
  plan_name: string;
  critica_hours: number;
  alta_hours: number;
  media_hours: number;
  baixa_hours: number;
};

const OPEN_STATUSES: TicketStatus[] = ["aberto", "em_andamento", "aguardando_cliente"];

function AreaTecnico() {
  const { user, hasAnyRole } = useAuth();
  const staff = hasAnyRole(["tecnico", "admin"]);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [t, c] = await Promise.all([
      supabase
        .from("tickets")
        .select(
          "id, title, category, company, status, priority, assigned_to, sla_due_at, first_response_at, resolved_at, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(300),
      supabase
        .from("company_sla_contracts")
        .select("company, plan_name, critica_hours, alta_hours, media_hours, baixa_hours"),
    ]);
    if (t.error) toast.error("Falha ao carregar chamados", { description: t.error.message });
    const rows = (t.data ?? []) as TicketRow[];
    setTickets(rows);
    setContracts((c.data ?? []) as Contract[]);

    const mine = rows.filter((r) => r.assigned_to === user?.id).map((r) => r.id);
    if (mine.length > 0) {
      const cm = await supabase
        .from("ticket_comments")
        .select("id, ticket_id, body, internal, created_at")
        .in("ticket_id", mine.slice(0, 50))
        .order("created_at", { ascending: false })
        .limit(30);
      setComments((cm.data ?? []) as CommentRow[]);
    } else {
      setComments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (staff && user?.id) void load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff, user?.id]);

  const assigned = useMemo(
    () => tickets.filter((t) => t.assigned_to === user?.id),
    [tickets, user?.id],
  );
  const queue = useMemo(
    () => tickets.filter((t) => !t.assigned_to && OPEN_STATUSES.includes(t.status)),
    [tickets],
  );

  const byClient = useMemo(() => {
    const map = new Map<string, TicketRow[]>();
    for (const t of assigned) {
      const key = t.company?.trim() || "Cliente sem empresa informada";
      map.set(key, [...(map.get(key) ?? []), t]);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [assigned]);

  const takeTicket = async (id: string) => {
    const { error } = await supabase.from("tickets").update({ assigned_to: user?.id }).eq("id", id);
    if (error) {
      toast.error("Não foi possível assumir o chamado", { description: error.message });
      return;
    }
    toast.success("Chamado atribuído a você");
    void load();
  };

  if (!staff) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-2xl font-bold text-primary">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Somente Técnicos e Gestores acessam a fila de atendimento.
        </p>
      </div>
    );
  }

  const openAssigned = assigned.filter((t) => OPEN_STATUSES.includes(t.status));
  const breached = openAssigned.filter(
    (t) => slaState(t.sla_due_at, t.resolved_at).tone === "danger",
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Área do técnico</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Chamados atribuídos a você, histórico de interações e SLA por cliente.
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()}>
          Atualizar
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat icon={Inbox} label="Atribuídos em aberto" value={openAssigned.length} />
        <Stat icon={AlertTriangle} label="SLA estourado" value={breached.length} />
        <Stat icon={Timer} label="Na fila sem responsável" value={queue.length} />
      </div>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Carregando fila…</p>
      ) : (
        <>
          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold text-primary">Meus chamados</h2>
            {assigned.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhum chamado atribuído a você no momento.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
                {assigned.map((t) => (
                  <TicketLine key={t.id} ticket={t} />
                ))}
              </ul>
            )}
          </section>

          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold text-primary">
              Fila sem responsável
            </h2>
            {queue.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Fila vazia. Bom trabalho!</p>
            ) : (
              <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
                {queue.map((t) => (
                  <TicketLine
                    key={t.id}
                    ticket={t}
                    action={
                      <Button size="sm" variant="hero" onClick={() => void takeTicket(t.id)}>
                        Assumir
                      </Button>
                    }
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold text-primary">SLA por cliente</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Prazos contratados e cumprimento dos chamados sob sua responsabilidade.
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-secondary/10 text-left">
                  <tr>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Plano</th>
                    <th className="p-3">Chamados</th>
                    <th className="p-3">Em aberto</th>
                    <th className="p-3">SLA cumprido</th>
                    <th className="p-3">Prazos (crít./alta/média/baixa)</th>
                  </tr>
                </thead>
                <tbody>
                  {byClient.length === 0 && (
                    <tr>
                      <td className="p-3 text-muted-foreground" colSpan={6}>
                        Sem clientes atribuídos.
                      </td>
                    </tr>
                  )}
                  {byClient.map(([company, list]) => {
                    const contract = contracts.find((c) => c.company === company);
                    const closed = list.filter((t) => t.resolved_at);
                    const onTime = closed.filter(
                      (t) =>
                        t.sla_due_at &&
                        new Date(t.resolved_at as string) <= new Date(t.sla_due_at),
                    );
                    const pct = closed.length
                      ? Math.round((onTime.length / closed.length) * 100)
                      : null;
                    return (
                      <tr key={company} className="border-t border-border">
                        <td className="p-3 font-medium">{company}</td>
                        <td className="p-3">{contract?.plan_name ?? "Sem contrato"}</td>
                        <td className="p-3">{list.length}</td>
                        <td className="p-3">
                          {list.filter((t) => OPEN_STATUSES.includes(t.status)).length}
                        </td>
                        <td className="p-3">
                          {pct === null ? (
                            "—"
                          ) : (
                            <Badge variant={pct >= 90 ? "secondary" : "destructive"}>{pct}%</Badge>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {contract
                            ? `${contract.critica_hours}h / ${contract.alta_hours}h / ${contract.media_hours}h / ${contract.baixa_hours}h`
                            : "2h / 4h / 8h / 24h (padrão)"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold text-primary">
              Histórico de interações
            </h2>
            {comments.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Ainda não há interações registradas nos seus chamados.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {comments.map((c) => {
                  const ticket = tickets.find((t) => t.id === c.ticket_id);
                  return (
                    <li key={c.id} className="rounded-xl border border-border p-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                        <Link
                          to="/chamados/$ticketId"
                          params={{ ticketId: c.ticket_id }}
                          className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {ticket?.title ?? "Chamado"}
                        </Link>
                        <span>{formatDateTime(c.created_at)}</span>
                        {c.internal && <Badge variant="secondary">Nota interna</Badge>}
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm">{c.body}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Inbox;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border p-5 shadow-card">
      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      <p className="mt-3 text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function TicketLine({ ticket, action }: { ticket: TicketRow; action?: React.ReactNode }) {
  const sla = slaState(ticket.sla_due_at, ticket.resolved_at);
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <Link
          to="/chamados/$ticketId"
          params={{ ticketId: ticket.id }}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {ticket.title}
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">
          {ticket.company?.trim() || "Sem empresa"} · {ticket.category} ·{" "}
          {formatDateTime(ticket.created_at)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{PRIORITY_LABELS[ticket.priority]}</Badge>
        <Badge variant="outline">{STATUS_LABELS[ticket.status]}</Badge>
        <Badge variant={sla.tone === "danger" ? "destructive" : "secondary"}>{sla.label}</Badge>
        {action}
      </div>
    </li>
  );
}
