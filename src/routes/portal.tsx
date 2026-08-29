import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Clock, FileUp, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { PortalCta } from "@/components/site/PortalCta";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Portal do Cliente — Chamados e SLA | AguiarT.I" },
      {
        name: "description",
        content:
          "Portal AguiarT.I: abertura de chamados, histórico, chat com técnico e dashboard de SLA para clientes e equipes.",
      },
      { property: "og:title", content: "Portal do Cliente | AguiarT.I" },
      {
        property: "og:description",
        content: "Acompanhe chamados, prazos de SLA e indicadores de atendimento em tempo real.",
      },
    ],
  }),
  component: Portal,
});

const recursos = [
  { icon: FileUp, t: "Abertura de chamados", d: "Categoria, urgência, descrição e anexos em poucos cliques." },
  { icon: Clock, t: "SLA em tempo real", d: "Tempo restante para resposta e resolução, com escalonamento automático." },
  { icon: MessageSquare, t: "Chat com o técnico", d: "Conversas registradas no histórico do chamado." },
  { icon: BarChart3, t: "Dashboard de KPIs", d: "TMA, TMR, % de SLA cumprido, volume de tickets e CSAT." },
  { icon: Users, t: "Contas corporativas", d: "Múltiplos usuários por empresa, com perfis e permissões." },
  { icon: ShieldCheck, t: "Perfis e permissões", d: "Cliente final, empresa, técnico e gestor/admin." },
];

function Portal() {
  return (
    <>
      <PageHero
        title="Portal do Cliente"
        subtitle="Abertura de chamados, histórico, chat com técnico e dashboard de atendimento com SLA."
      />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {recursos.map((r) => (
            <div key={r.t} className="rounded-xl border border-border p-6 shadow-card">
              <r.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="mt-3 font-semibold">{r.t}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{r.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-secondary/60 p-8 text-center">
          <h2 className="text-xl font-bold text-primary">Acesse sua conta</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Entre com e-mail e senha ou com sua conta Google. O acesso é por perfil: Cliente,
            Empresa, Técnico e Gestor/Admin — cada um vê apenas as áreas do seu papel.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <PortalCta variant="hero" size="lg">Entrar no portal</PortalCta>
            <PortalCta variant="heroOutline" size="lg">Abrir chamado agora</PortalCta>
          </div>
        </div>
      </div>
    </>
  );
}
