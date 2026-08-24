import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Headset,
  ListChecks,
  MessageCircle,
  Monitor,
  Network,
  ShieldCheck,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/hero-dashboard.jpg";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AguiarT.I — Tecnologia que impulsiona o seu negócio" },
      {
        name: "description",
        content:
          "Especialistas em automação comercial (PDV, ERP, fiscal) e suporte técnico remoto com SLA garantido e portal de chamados com dashboard.",
      },
      { property: "og:title", content: "AguiarT.I — Automação Comercial e Suporte Remoto" },
      {
        property: "og:description",
        content:
          "Abra chamados, acompanhe SLA em tempo real e fale com nossos técnicos pelo WhatsApp.",
      },
    ],
  }),
  component: Home,
});

const servicos = [
  {
    icon: Store,
    title: "Automação Comercial",
    desc: "PDV, impressoras fiscais, balanças, ERP e integração de sistemas de vendas.",
    to: "/servicos/automacao-comercial" as const,
  },
  {
    icon: Headset,
    title: "Suporte Técnico Remoto",
    desc: "Atendimento ágil para usuários e empresas, diagnóstico remoto e suporte por ticket.",
    to: "/servicos/suporte-remoto" as const,
  },
  {
    icon: Network,
    title: "Consultoria e Infraestrutura",
    desc: "Redes, servidores, backup, monitoramento e treinamento de equipes.",
    to: "/servicos/consultoria" as const,
  },
];

const diferenciais = [
  { icon: Clock, title: "SLA garantido", desc: "Resposta inicial em até 2h e resolução em até 48h conforme contrato." },
  { icon: Monitor, title: "100% remoto", desc: "Atendimento seguro por acesso remoto, sem deslocamento e sem espera." },
  { icon: ShieldCheck, title: "Segurança e LGPD", desc: "Dados criptografados, registro de atendimentos e consentimento explícito." },
  { icon: BarChart3, title: "Gestão por indicadores", desc: "TMA, TMR, % de SLA cumprido e CSAT visíveis para o seu time." },
];

const depoimentos = [
  {
    nome: "Mercado São Jorge",
    texto: "Migramos o PDV e a emissão fiscal sem parar as vendas. Suporte responde em minutos.",
  },
  {
    nome: "Rede Bella Farma",
    texto: "O dashboard de chamados deu previsibilidade: sabemos exatamente o status de cada loja.",
  },
  {
    nome: "Distribuidora Aguiar Sul",
    texto: "Integração do ERP com o e-commerce reduziu erros de estoque praticamente a zero.",
  },
];

function Home() {
  return (
    <>
      <section className="bg-hero-gradient text-primary-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-3 py-1 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              Atendimento 24/7 · SLA garantido
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl">
              AguiarT.I: tecnologia que impulsiona o seu negócio
            </h1>
            <p className="mt-5 max-w-xl text-lg text-primary-foreground/80">
              Especialistas em Automação Comercial e Suporte Técnico Remoto, com abertura de chamados
              e gestão de atendimento por dashboard.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="hero" size="xl" asChild>
                <Link to="/abrir-chamado">Abrir Chamado Agora</Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <a href={whatsappLink("Olá! Gostaria de falar com a AguiarT.I.")} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden="true" /> Fale pelo WhatsApp
                </a>
              </Button>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/70">
              WhatsApp direto: {WHATSAPP_DISPLAY}
            </p>
          </div>

          <img
            src={heroImage}
            alt="Dashboard de chamados da AguiarT.I com gráficos de SLA e terminal de PDV"
            width={1280}
            height={960}
            className="w-full rounded-2xl shadow-card"
          />
        </div>

        <div className="border-t border-primary-foreground/15">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-5 text-sm text-primary-foreground/70">
            <span>+300 clientes atendidos</span>
            <span aria-hidden="true">·</span>
            <span>98% de SLA cumprido</span>
            <span aria-hidden="true">·</span>
            <span>Suporte N1, N2 e N3</span>
            <span aria-hidden="true">·</span>
            <span>Certificação em ERPs e PDVs homologados</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20" aria-labelledby="servicos">
        <h2 id="servicos" className="text-3xl font-bold text-primary">
          Nossos serviços
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Do balcão ao servidor: cuidamos de toda a operação técnica do seu negócio.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {servicos.map((s) => (
            <Card key={s.title} className="shadow-card transition-transform hover:-translate-y-1">
              <CardHeader>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary">
                  <s.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <CardTitle className="mt-3 text-xl">{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                <Button variant="link" className="mt-4 px-0" asChild>
                  <Link to={s.to}>Saiba mais</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60 py-20" aria-labelledby="portal">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2">
          <div>
            <h2 id="portal" className="text-3xl font-bold text-primary">
              Portal do Cliente — acompanhe seus atendimentos em tempo real
            </h2>
            <p className="mt-4 text-muted-foreground">
              Abertura de chamados com categoria, urgência e anexos, histórico completo, chat com o
              técnico e dashboard com SLA, prioridade e nível de atendimento (N1/N2/N3).
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Criação e atualização de chamados com anexos",
                "SLA por tipo de contrato e cálculo de tempo restante",
                "Gráficos de desempenho e exportação de relatórios",
                "Notificações por e-mail e WhatsApp",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button variant="default" size="lg" className="mt-8" asChild>
              <Link to="/portal">Acessar Portal</Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: ListChecks, t: "Visão geral", d: "Chamados abertos, em atendimento e resolvidos." },
              { icon: BarChart3, t: "Gráficos de SLA", d: "Em risco, violado e cumprido por período." },
              { icon: Clock, t: "Tempo de resposta", d: "TMA e TMR por técnico e por cliente." },
              { icon: Headset, t: "Lista de chamados", d: "Filtros por status, prioridade e técnico." },
            ].map((c) => (
              <div key={c.t} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <c.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">{c.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20" aria-labelledby="diferenciais">
        <h2 id="diferenciais" className="text-3xl font-bold text-primary">
          Por que a AguiarT.I
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {diferenciais.map((d) => (
            <div key={d.title} className="rounded-xl border border-border p-6">
              <d.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="mt-3 font-semibold">{d.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60 py-20" aria-labelledby="depoimentos">
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="depoimentos" className="text-3xl font-bold text-primary">
            Quem confia na gente
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {depoimentos.map((d) => (
              <figure key={d.nome} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <blockquote className="text-sm text-foreground">“{d.texto}”</blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-primary">{d.nome}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="rounded-2xl bg-hero-gradient px-6 py-14 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold">Precisa de suporte agora?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
            Abra um chamado em menos de 1 minuto ou fale direto com um técnico pelo WhatsApp.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="hero" size="xl" asChild>
              <Link to="/abrir-chamado">Abrir Chamado Agora</Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" /> {WHATSAPP_DISPLAY}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
