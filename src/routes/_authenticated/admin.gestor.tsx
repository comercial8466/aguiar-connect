import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, BarChart3, Clock, Smile, Timer, Ticket as TicketIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  type TicketPriority,
  type TicketStatus,
} from "@/lib/tickets";

export const Route = createFileRoute("/_authenticated/admin/gestor")({
  head: () => ({
    meta: [
      { title: "Painel do Gestor — KPIs de SLA e Satisfação | AguiarT.I" },
      {
        name: "description",
        content:
          "Indicadores de gestão do suporte AguiarT.I: cumprimento de SLA, tempo médio de resposta, tempo de resolução e satisfação dos clientes.",
      },
      { property: "og:title", content: "Painel do Gestor | AguiarT.I" },
      {
        property: "og:description",
        content: "KPIs de SLA, tempo médio de resposta e satisfação do suporte AguiarT.I.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PainelGestor,
});

type Row = {
  id: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  created_at: string;
  first_response_at: string | null;
  resolved_at: string | null;
  sla_due_at: string | null;
  satisfaction_rating: number | null;
};

const PERIODS = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "365", label: "Últimos 12 meses" },
] as const;

function hoursBetween(a: string, b: string) {
  return (new Date(b).getTime() - new Date(a).getTime()) / 3_600_000;
}

function formatHours(value: number | null) {
  if (value === null) return "—";
  if (value < 1) return `${Math.round(value * 60)} min`;
  return `${value.toFixed(1)} h`;
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function PainelGestor() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const [period, setPeriod] = useState<string>("30");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      const since = new Date(Date.now() - Number(period) * 86_400_000).toISOString();
      const { data, error } = await supabase
        .from("tickets")
        .select(
          "id, title, status, priority, category, created_at, first_response_at, resolved_at, sla_due_at, satisfaction_rating",
        )
        .gte("created_at", since)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) toast.error("Falha ao carregar indicadores", { description: error.message });
      setRows((data ?? []) as Row[]);
      setLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, [isAdmin, period]);

  const kpis = useMemo(() => {
    const total = rows.length;
    const resolved = rows.filter((r) => r.resolved_at);
    const open = rows.filter((r) => r.status !== "resolvido" && r.status !== "fechado");

    const responseHours = rows
      .filter((r) => r.first_response_at)
      .map((r) => hoursBetween(r.created_at, r.first_response_at as string));
    const resolutionHours = resolved.map((r) => hoursBetween(r.created_at, r.resolved_at as string));

    const withSla = rows.filter((r) => r.sla_due_at);
    const slaMet = withSla.filter((r) => {
      const ref = r.resolved_at ? new Date(r.resolved_at) : new Date();
      return ref.getTime() <= new Date(r.sla_due_at as string).getTime();
    });
    const breached = withSla.length - slaMet.length;

    const ratings = rows
      .map((r) => r.satisfaction_rating)
      .filter((r): r is number => typeof r === "number");
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: ratings.filter((r) => r === star).length,
    }));

    return {
      total,
      open: open.length,
      resolved: resolved.length,
      breached,
      slaRate: withSla.length ? (slaMet.length / withSla.length) * 100 : null,
      avgResponse: average(responseHours),
      avgResolution: average(resolutionHours),
      csat: average(ratings),
      ratingsCount: ratings.length,
      distribution,
      pendingResponse: rows.filter((r) => !r.first_response_at && r.status === "aberto").length,
    };
  }, [rows]);

  const byPriority = useMemo(() => {
    const priorities: TicketPriority[] = ["critica", "alta", "media", "baixa"];
    return priorities.map((priority) => {
      const list = rows.filter((r) => r.priority === priority);
      const withSla = list.filter((r) => r.sla_due_at);
      const met = withSla.filter((r) => {
        const ref = r.resolved_at ? new Date(r.resolved_at) : new Date();
        return ref.getTime() <= new Date(r.sla_due_at as string).getTime();
      });
      return {
        priority,
        total: list.length,
        slaRate: withSla.length ? (met.length / withSla.length) * 100 : null,
        avgResponse: average(
          list
            .filter((r) => r.first_response_at)
            .map((r) => hoursBetween(r.created_at, r.first_response_at as string)),
        ),
      };
    });
  }, [rows]);

  const worstTickets = useMemo(
    () =>
      rows
        .filter((r) => {
          if (!r.sla_due_at) return false;
          const ref = r.resolved_at ? new Date(r.resolved_at) : new Date();
          return ref.getTime() > new Date(r.sla_due_at).getTime();
        })
        .slice(0, 8),
    [rows],
  );

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-primary">Acesso restrito</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Esta área é exclusiva para o perfil Gestor/Admin do portal AguiarT.I.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link to="/painel">Voltar ao painel</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Painel do gestor</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Indicadores de SLA, tempo de atendimento e satisfação dos clientes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-52" aria-label="Selecionar período dos indicadores">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" asChild>
            <Link to="/admin/usuarios">Usuários</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Carregando indicadores…</p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              icon={<BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />}
              label="SLA cumprido"
              value={kpis.slaRate === null ? "—" : `${kpis.slaRate.toFixed(0)}%`}
              hint={`${kpis.breached} chamado(s) fora do prazo`}
            />
            <KpiCard
              icon={<Clock className="h-5 w-5 text-primary" aria-hidden="true" />}
              label="Tempo médio de resposta"
              value={formatHours(kpis.avgResponse)}
              hint={`${kpis.pendingResponse} aguardando 1ª resposta`}
            />
            <KpiCard
              icon={<Timer className="h-5 w-5 text-primary" aria-hidden="true" />}
              label="Tempo médio de resolução"
              value={formatHours(kpis.avgResolution)}
              hint={`${kpis.resolved} resolvidos no período`}
            />
            <KpiCard
              icon={<Smile className="h-5 w-5 text-primary" aria-hidden="true" />}
              label="Satisfação (CSAT)"
              value={kpis.csat === null ? "—" : `${kpis.csat.toFixed(1)} / 5`}
              hint={`${kpis.ratingsCount} avaliação(ões) recebidas`}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <KpiCard
              icon={<TicketIcon className="h-5 w-5 text-primary" aria-hidden="true" />}
              label="Chamados no período"
              value={String(kpis.total)}
              hint={`${kpis.open} em aberto`}
            />
            <KpiCard
              icon={<AlertTriangle className="h-5 w-5 text-primary" aria-hidden="true" />}
              label="SLA estourado"
              value={String(kpis.breached)}
              hint="Prazo excedido ou vencido"
            />
            <KpiCard
              icon={<Smile className="h-5 w-5 text-primary" aria-hidden="true" />}
              label="Taxa de avaliação"
              value={kpis.resolved ? `${((kpis.ratingsCount / kpis.resolved) * 100).toFixed(0)}%` : "—"}
              hint="Resolvidos que receberam nota"
            />
          </div>

          <section className="mt-10 rounded-xl border border-border p-6 shadow-card">
            <h2 className="font-display text-xl font-semibold text-primary">Desempenho por prioridade</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2">Prioridade</th>
                    <th className="py-2">Chamados</th>
                    <th className="py-2">SLA cumprido</th>
                    <th className="py-2">Resposta média</th>
                  </tr>
                </thead>
                <tbody>
                  {byPriority.map((row) => (
                    <tr key={row.priority} className="border-t border-border">
                      <td className="py-3">
                        <Badge variant="secondary">{PRIORITY_LABELS[row.priority]}</Badge>
                      </td>
                      <td className="py-3">{row.total}</td>
                      <td className="py-3">
                        {row.slaRate === null ? "—" : `${row.slaRate.toFixed(0)}%`}
                      </td>
                      <td className="py-3">{formatHours(row.avgResponse)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border p-6 shadow-card">
              <h2 className="font-display text-xl font-semibold text-primary">
                Distribuição da satisfação
              </h2>
              {kpis.ratingsCount === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Nenhuma avaliação registrada no período. Os clientes avaliam o atendimento na página
                  do chamado após a resolução.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {kpis.distribution.map((item) => {
                    const pct = (item.count / kpis.ratingsCount) * 100;
                    return (
                      <li key={item.star} className="flex items-center gap-3 text-sm">
                        <span className="w-14 text-muted-foreground">{item.star} ★</span>
                        <div className="h-2 flex-1 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-16 text-right text-muted-foreground">
                          {item.count} ({pct.toFixed(0)}%)
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-border p-6 shadow-card">
              <h2 className="font-display text-xl font-semibold text-primary">
                Chamados fora do SLA
              </h2>
              {worstTickets.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Nenhum chamado fora do prazo no período. Excelente!
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {worstTickets.map((t) => (
                    <li key={t.id} className="border-t border-border pt-3 first:border-0 first:pt-0">
                      <Link
                        to="/chamados/$ticketId"
                        params={{ ticketId: t.id }}
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {t.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {PRIORITY_LABELS[t.priority]} · {STATUS_LABELS[t.status]} · {t.category}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border p-5 shadow-card">
      {icon}
      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
