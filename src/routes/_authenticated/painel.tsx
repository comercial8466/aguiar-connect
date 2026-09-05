import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, Building2, LifeBuoy, ShieldCheck, Ticket } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_LABELS, useAuth, type AppRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel do Portal — Chamados e SLA | AguiarT.I" },
      {
        name: "description",
        content:
          "Área autenticada do portal AguiarT.I com acesso por perfil: cliente, empresa, técnico e gestor.",
      },
      { property: "og:title", content: "Painel do Portal | AguiarT.I" },
      {
        property: "og:description",
        content: "Acesso por perfil ao portal de suporte AguiarT.I.",
      },
    ],
  }),
  component: Painel,
});

const ALL_ROLES: AppRole[] = ["cliente", "empresa", "tecnico", "admin"];

type ProfileRow = { id: string; full_name: string | null; company: string | null };

function Painel() {
  const { user, roles, hasRole, hasAnyRole, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    void navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Painel do portal</h1>
          <p className="mt-2 text-sm text-muted-foreground">{user?.email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {roles.length === 0 ? (
              <Badge variant="secondary">Sem papel atribuído</Badge>
            ) : (
              roles.map((r) => <Badge key={r}>{ROLE_LABELS[r]}</Badge>)
            )}
          </div>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          Sair
        </Button>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-border p-6 shadow-card">
          <Ticket className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-3 font-semibold">Meus chamados</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Abra um chamado e acompanhe o atendimento dentro do SLA contratado.
          </p>
          <Button variant="hero" className="mt-4" asChild>
            <Link to="/abrir-chamado">Abrir chamado</Link>
          </Button>
        </section>

        {hasAnyRole(["empresa", "admin"]) && (
          <section className="rounded-xl border border-border p-6 shadow-card">
            <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-semibold">Área da empresa</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Cadastro de usuários da empresa e SLA contratado.
            </p>
            <Button variant="hero" className="mt-4" asChild>
              <Link to="/empresa">Abrir área da empresa</Link>
            </Button>
          </section>
        )}

        {hasAnyRole(["tecnico", "admin"]) && (
          <section className="rounded-xl border border-border p-6 shadow-card">
            <LifeBuoy className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-semibold">Fila de atendimento</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Chamados atribuídos, prazos de resposta e histórico técnico.
            </p>
            <Button variant="hero" className="mt-4" asChild>
              <Link to="/tecnico">Abrir área do técnico</Link>
            </Button>
          </section>
        )}

        {hasRole("admin") && (
          <section className="rounded-xl border border-border p-6 shadow-card">
            <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-semibold">Indicadores de gestão</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              TMA, TMR, % de SLA cumprido, satisfação e volume de tickets por período.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="hero" asChild>
                <Link to="/admin/gestor">Painel do gestor</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/configuracoes">Configurações do portal</Link>
              </Button>
            </div>
          </section>
        )}
      </div>


      {!hasRole("admin") && (
        <p className="mt-10 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Precisa de acesso de Empresa, Técnico ou Gestor? Solicite à equipe AguiarT.I.
        </p>
      )}
    </div>
  );
}

function AdminUsers() {
  const [rows, setRows] = useState<Array<ProfileRow & { roles: AppRole[] }>>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: userRoles }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, company"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setRows(
      (profiles ?? []).map((p) => ({
        ...p,
        roles: (userRoles ?? [])
          .filter((r) => r.user_id === p.id)
          .map((r) => r.role as AppRole),
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const setRole = async (userId: string, role: AppRole, current: AppRole[]) => {
    const { error: delError } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (delError) {
      toast.error("Não foi possível atualizar o papel", { description: delError.message });
      return;
    }
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) {
      toast.error("Não foi possível atualizar o papel", { description: error.message });
      if (current[0]) await supabase.from("user_roles").insert({ user_id: userId, role: current[0] });
      return;
    }
    toast.success(`Papel atualizado para ${ROLE_LABELS[role]}`);
    void load();
  };

  return (
    <section className="mt-12 rounded-xl border border-border p-6 shadow-card">
      <h2 className="font-semibold">Gestão de papéis</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Defina o papel de cada usuário do portal.
      </p>
      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Carregando usuários…</p>
      ) : (
        <ul className="mt-6 divide-y divide-border">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium">{row.full_name ?? "Sem nome"}</p>
                <p className="text-xs text-muted-foreground">{row.company ?? "—"}</p>
              </div>
              <Select
                value={row.roles[0] ?? ""}
                onValueChange={(value) => setRole(row.id, value as AppRole, row.roles)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecionar papel" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
