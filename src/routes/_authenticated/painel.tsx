import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Building2,
  KeyRound,
  LifeBuoy,
  ScrollText,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import { ROLE_LABELS, useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


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
            Abra um chamado, envie anexos e acompanhe o atendimento dentro do SLA contratado.
          </p>
          <Button variant="hero" className="mt-4" asChild>
            <Link to="/chamados">Ir para os chamados</Link>
          </Button>
        </section>

        <section className="rounded-xl border border-border p-6 shadow-card">
          <KeyRound className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-3 font-semibold">Segurança da conta</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ative a autenticação em duas etapas (obrigatória para Técnicos e Gestores).
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/seguranca-conta">Configurar 2FA</Link>
          </Button>
        </section>

        {hasAnyRole(["empresa", "admin"]) && (
          <section className="rounded-xl border border-border p-6 shadow-card">
            <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-semibold">Área da empresa</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Visão consolidada dos chamados da sua empresa e dos usuários vinculados.
            </p>
          </section>
        )}

        {hasAnyRole(["tecnico", "admin"]) && (
          <section className="rounded-xl border border-border p-6 shadow-card">
            <LifeBuoy className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-semibold">Fila de atendimento</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Chamados de todos os clientes, prazos de resposta e notas internas.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/chamados">Abrir fila</Link>
            </Button>
          </section>
        )}

        {hasRole("admin") && (
          <>
            <section className="rounded-xl border border-border p-6 shadow-card">
              <Users className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="mt-3 font-semibold">Usuários e papéis</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Promova ou rebaixe contas entre Cliente, Empresa, Técnico e Gestor/Admin.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/admin/usuarios">Gerenciar usuários</Link>
              </Button>
            </section>

            <section className="rounded-xl border border-border p-6 shadow-card">
              <ScrollText className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="mt-3 font-semibold">Logs de auditoria</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Quem acessou ou alterou chamados, papéis e prazos de SLA.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/admin/auditoria">Ver auditoria</Link>
              </Button>
            </section>

            <section className="rounded-xl border border-border p-6 shadow-card">
              <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="mt-3 font-semibold">Verificação de segurança</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Rode a checagem automatizada antes de publicar; itens críticos bloqueiam o deploy.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/admin/seguranca">Executar verificação</Link>
              </Button>
            </section>
          </>
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

