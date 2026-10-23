import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  slaState,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/tickets";

export const Route = createFileRoute("/_authenticated/admin/tempo-real")({
  head: () => ({
    meta: [
      { title: "Chamados em Tempo Real e Power BI | AguiarT.I" },
      {
        name: "description",
        content:
          "Painel ao vivo dos chamados AguiarT.I por status, prioridade, empresa e SLA, com link de dados para o Power BI.",
      },
      { property: "og:title", content: "Chamados em Tempo Real | AguiarT.I" },
      {
        property: "og:description",
        content: "Acompanhe chamados ao vivo e conecte os dados ao Power BI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TempoReal,
});

type T = {
  id: string;
  status: TicketStatus;
  priority: TicketPriority;
  company: string | null;
  sla_due_at: string | null;
  resolved_at: string | null;
  created_at: string;
};
type Token = { id: string; label: string; token: string; active: boolean; last_used_at: string | null };

const COLORS = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-secondary)",
  "var(--color-muted-foreground)",
  "var(--color-destructive)",
];

function TempoReal() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const [rows, setRows] = useState<T[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [live, setLive] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select("id, status, priority, company, sla_due_at, resolved_at, created_at")
      .limit(5000);
    if (error) toast.error("Falha ao carregar chamados", { description: error.message });
    setRows((data ?? []) as T[]);
    setUpdatedAt(new Date());
  };
  const loadTokens = async () => {
    const { data } = await supabase
      .from("powerbi_feed_tokens")
      .select("id, label, token, active, last_used_at")
      .order("created_at", { ascending: false });
    setTokens((data ?? []) as Token[]);
  };

  useEffect(() => {
    if (!isAdmin) return;
    void load();
    void loadTokens();
    const ch = supabase
      .channel(`tempo-real-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, () => void load())
      .subscribe((s) => setLive(s === "SUBSCRIBED"));
    return () => {
      void supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const stats = useMemo(() => {
    const open = rows.filter((r) => !r.resolved_at && r.status !== "fechado");
    const late = open.filter((r) => slaState(r.sla_due_at, null).tone === "danger").length;
    const risk = open.filter((r) => slaState(r.sla_due_at, null).tone === "warning").length;
    const resolved = rows.filter((r) => r.resolved_at);
    const ok = resolved.filter((r) => slaState(r.sla_due_at, r.resolved_at).tone !== "danger").length;
    const byStatus = (Object.keys(STATUS_LABELS) as TicketStatus[]).map((s) => ({
      name: STATUS_LABELS[s],
      value: rows.filter((r) => r.status === s).length,
    }));
    const byPriority = (Object.keys(PRIORITY_LABELS) as TicketPriority[]).map((p) => ({
      name: PRIORITY_LABELS[p],
      abertos: open.filter((r) => r.priority === p).length,
    }));
    const companies = new Map<string, number>();
    for (const r of open) {
      const k = r.company?.trim() || "Sem empresa";
      companies.set(k, (companies.get(k) ?? 0) + 1);
    }
    const byCompany = [...companies.entries()]
      .map(([name, abertos]) => ({ name, abertos }))
      .sort((a, b) => b.abertos - a.abertos)
      .slice(0, 8);
    return {
      open: open.length,
      late,
      risk,
      slaPct: resolved.length ? Math.round((ok / resolved.length) * 100) : null,
      byStatus,
      byPriority,
      byCompany,
    };
  }, [rows]);

  const createToken = async () => {
    const { error } = await supabase.from("powerbi_feed_tokens").insert({ label: "Power BI" });
    if (error) return toast.error("Não foi possível criar o link", { description: error.message });
    toast.success("Link do Power BI criado");
    void loadTokens();
  };
  const disableToken = async (id: string) => {
    await supabase.from("powerbi_feed_tokens").update({ active: false }).eq("id", id);
    void loadTokens();
  };
  const feedUrl = (token: string) =>
    `${typeof window !== "undefined" ? window.location.origin : ""}/api/public/powerbi/chamados?token=${token}`;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-2xl font-bold text-primary">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">Somente Gestores acessam este painel.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Chamados em tempo real</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className={`inline-block size-2 rounded-full ${live ? "bg-accent" : "bg-muted-foreground"}`}
              aria-hidden
            />
            {live ? "Ao vivo" : "Conectando…"}
            {updatedAt && ` · atualizado às ${updatedAt.toLocaleTimeString("pt-BR")}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/chamados">Chamados e WhatsApp</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/gestor">KPIs de SLA</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Chamados abertos", value: stats.open },
          { label: "Fora do prazo", value: stats.late },
          { label: "Em risco (< 1h)", value: stats.risk },
          { label: "SLA cumprido", value: stats.slaPct === null ? "—" : `${stats.slaPct}%` },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{k.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-primary">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border p-5">
          <h2 className="font-display font-semibold text-primary">Por status</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={stats.byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {stats.byStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1 text-sm">
            {stats.byStatus.map((s, i) => (
              <li key={s.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {s.name}
                </span>
                <span className="font-medium">{s.value}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-border p-5">
          <h2 className="font-display font-semibold text-primary">Abertos por prioridade</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={stats.byPriority}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="abertos" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-xl border border-border p-5">
          <h2 className="font-display font-semibold text-primary">Abertos por empresa</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={stats.byCompany} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" allowDecimals={false} fontSize={12} />
                <YAxis type="category" dataKey="name" width={110} fontSize={11} />
                <Tooltip />
                <Bar dataKey="abertos" fill="var(--color-accent)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="mt-10 rounded-xl border border-border p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-primary">Conectar ao Power BI</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              No Power BI Desktop: <strong>Obter dados → Web</strong>, cole o link abaixo e escolha
              "Anônimo". Publique o relatório e ative a atualização agendada. Para CSV, acrescente
              <code className="mx-1 rounded bg-muted px-1">&format=csv</code>. Não compartilhe o link: quem
              tiver ele lê os chamados.
            </p>
          </div>
          <Button onClick={() => void createToken()}>Gerar link</Button>
        </div>
        <ul className="mt-6 space-y-3">
          {tokens.length === 0 && <li className="text-sm text-muted-foreground">Nenhum link criado ainda.</li>}
          {tokens.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
              <Badge variant={t.active ? "default" : "secondary"}>{t.active ? "Ativo" : "Desativado"}</Badge>
              <code className="min-w-0 flex-1 truncate text-xs">{feedUrl(t.token)}</code>
              <span className="text-xs text-muted-foreground">
                {t.last_used_at ? `Última leitura ${new Date(t.last_used_at).toLocaleString("pt-BR")}` : "Nunca lido"}
              </span>
              {t.active && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      void navigator.clipboard.writeText(feedUrl(t.token));
                      toast.success("Link copiado");
                    }}
                  >
                    Copiar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void disableToken(t.id)}>
                    Desativar
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
