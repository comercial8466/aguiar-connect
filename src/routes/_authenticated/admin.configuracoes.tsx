import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_LABELS, useAuth, type AppRole } from "@/hooks/useAuth";
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
import { PRIORITY_LABELS, type TicketPriority } from "@/lib/tickets";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações do Portal — Usuários, SLA e Papéis | AguiarT.I" },
      {
        name: "description",
        content:
          "Painel administrativo AguiarT.I: listagem de usuários, SLA por tipo de chamado e configuração de papéis de acesso.",
      },
      { property: "og:title", content: "Configurações do Portal | AguiarT.I" },
      {
        property: "og:description",
        content: "Usuários, SLA por tipo de chamado e papéis no portal AguiarT.I.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminConfiguracoes,
});

const ROLES: AppRole[] = ["cliente", "empresa", "tecnico", "admin"];
const PRIORITIES: TicketPriority[] = ["baixa", "media", "alta", "critica"];

type UserRow = {
  id: string;
  full_name: string | null;
  company: string | null;
  roles: AppRole[];
  tickets: number;
};

type SlaRow = {
  id: string;
  category: string;
  default_priority: TicketPriority;
  response_hours: number;
  resolution_hours: number;
};

function AdminConfiguracoes() {
  const { hasRole, user } = useAuth();
  const isAdmin = hasRole("admin");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [slas, setSlas] = useState<SlaRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [p, r, t, s] = await Promise.all([
      supabase.from("profiles").select("id, full_name, company"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("tickets").select("user_id"),
      supabase
        .from("category_sla")
        .select("id, category, default_priority, response_hours, resolution_hours")
        .order("category"),
    ]);
    if (p.error) toast.error("Falha ao carregar usuários", { description: p.error.message });

    const roleMap = new Map<string, AppRole[]>();
    for (const item of r.data ?? []) {
      roleMap.set(item.user_id, [...(roleMap.get(item.user_id) ?? []), item.role as AppRole]);
    }
    const ticketMap = new Map<string, number>();
    for (const item of t.data ?? []) {
      ticketMap.set(item.user_id, (ticketMap.get(item.user_id) ?? 0) + 1);
    }
    setUsers(
      (p.data ?? []).map((row) => ({
        id: row.id,
        full_name: row.full_name,
        company: row.company,
        roles: roleMap.get(row.id) ?? [],
        tickets: ticketMap.get(row.id) ?? 0,
      })),
    );
    setSlas((s.data ?? []) as SlaRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) void load();
    else setLoading(false);
  }, [isAdmin]);

  const setRole = async (userId: string, role: AppRole) => {
    const del = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (del.error) {
      toast.error("Falha ao atualizar papel", { description: del.error.message });
      return;
    }
    const ins = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (ins.error) {
      toast.error("Falha ao atribuir papel", { description: ins.error.message });
      return;
    }
    toast.success(`Papel atualizado para ${ROLE_LABELS[role]}`);
    void load();
  };

  const patchSla = (id: string, patch: Partial<SlaRow>) =>
    setSlas((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const saveSla = async (row: SlaRow) => {
    const { error } = await supabase
      .from("category_sla")
      .update({
        default_priority: row.default_priority,
        response_hours: Number(row.response_hours),
        resolution_hours: Number(row.resolution_hours),
      })
      .eq("id", row.id);
    if (error) {
      toast.error("Não foi possível salvar o SLA", { description: error.message });
      return;
    }
    toast.success(`SLA de ${row.category} atualizado`);
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-2xl font-bold text-primary">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Somente Gestores/Admins acessam as configurações do portal.
        </p>
      </div>
    );
  }

  const filtered = users.filter((u) =>
    `${u.full_name ?? ""} ${u.company ?? ""}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Configurações do portal</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Usuários, papéis de acesso e SLA por tipo de chamado.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/gestor">Indicadores</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/auditoria">Auditoria</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Carregando…</p>
      ) : (
        <>
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-primary">
              SLA por tipo de chamado
            </h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-secondary/10 text-left">
                  <tr>
                    <th className="p-3">Tipo de chamado</th>
                    <th className="p-3">Prioridade padrão</th>
                    <th className="p-3">Resposta (h)</th>
                    <th className="p-3">Solução (h)</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {slas.map((row) => (
                    <tr key={row.id} className="border-t border-border">
                      <td className="p-3 font-medium">{row.category}</td>
                      <td className="p-3">
                        <Select
                          value={row.default_priority}
                          onValueChange={(v) =>
                            patchSla(row.id, { default_priority: v as TicketPriority })
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITIES.map((p) => (
                              <SelectItem key={p} value={p}>
                                {PRIORITY_LABELS[p]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min={1}
                          className="w-24"
                          value={String(row.response_hours)}
                          onChange={(e) =>
                            patchSla(row.id, { response_hours: Number(e.target.value) })
                          }
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min={1}
                          className="w-24"
                          value={String(row.resolution_hours)}
                          onChange={(e) =>
                            patchSla(row.id, { resolution_hours: Number(e.target.value) })
                          }
                        />
                      </td>
                      <td className="p-3">
                        <Button size="sm" variant="hero" onClick={() => void saveSla(row)}>
                          Salvar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold text-primary">Usuários e papéis</h2>
            <Input
              className="mt-4 max-w-sm"
              placeholder="Buscar por nome ou empresa"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
              {filtered.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {row.full_name ?? "Sem nome"}
                      {row.id === user?.id && (
                        <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.company ?? "Sem empresa"} · {row.tickets} chamado(s)
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {row.roles.length === 0 ? (
                        <Badge variant="outline">Sem papel</Badge>
                      ) : (
                        row.roles.map((r) => (
                          <Badge key={r} variant="secondary">
                            {ROLE_LABELS[r]}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                  <Select
                    value={row.roles[0] ?? ""}
                    onValueChange={(v) => void setRole(row.id, v as AppRole)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Definir papel" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
