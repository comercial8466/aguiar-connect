import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, CheckCircle2, Clock, Download, Headset, ListChecks, Mail, Monitor, Network, ShieldCheck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import heroAsset from "@/assets/hero-dashboard-central.png.asset.json";
const heroImage = heroAsset.url;
import { SITE_EMAIL, WHATSAPP_DISPLAY, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { ContactForm } from "@/components/site/ContactForm";
import { HomeSectionNav } from "@/components/site/HomeSectionNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AguiarT.I — Automação Comercial, PDV e Suporte Remoto" },
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  { icon: BarChart3, title: "Gestão por indicadores", desc: "Acompanhe prazos, tempo de resposta e satisfação dos clientes." },
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
      <section className="bg-hero-background text-hero-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-16 lg:px-10">
          <div className="min-w-0 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-hero-foreground/25 px-3 py-1.5 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              Atendimento 24/7 · SLA garantido
            </span>
            <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-bold leading-tight md:text-4xl">
              AguiarT.I: Tecnologia que Impulsiona o seu negócio
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-hero-muted">
              Automação comercial, PDV e ERP para sua empresa. Suporte técnico remoto com chamados e acompanhamento pelo portal.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button variant="hero" size="lg" className="px-5" asChild>
                <Link to="/abrir-chamado">Abrir chamado</Link>
              </Button>
              <Button variant="heroOutline" size="lg" className="px-5" asChild>
                <a href={whatsappLink("Olá! Gostaria de falar com a AguiarT.I.")} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon aria-hidden="true" /> Falar no WhatsApp
                </a>
              </Button>
            </div>
            <p className="mt-4 text-sm text-hero-muted">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">{WHATSAPP_DISPLAY}</a>
            </p>
          </div>

          <img
            src={heroImage}
            alt="Dashboard de chamados da AguiarT.I com gráficos de SLA e terminal de PDV"
            width={1920}
            height={1088}
            fetchPriority="high"
            className="aspect-[16/9] w-full min-w-0 rounded-lg object-cover shadow-glow"
          />
        </div>

        <div className="border-t border-hero-foreground/15">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-6 py-5 text-center text-sm text-hero-muted">
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
      <HomeSectionNav />

      <section id="servicos" className="home-section bg-home-surface py-12 md:py-16" aria-labelledby="servicos-title">
        <div className="mx-auto max-w-6xl px-6">
        <h2 id="servicos-title" className="text-2xl font-bold text-primary md:text-3xl">
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
        </div>
      </section>

      <section id="portal" className="home-section border-y border-border bg-background py-12 md:py-16" aria-labelledby="portal-title">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2">
          <div>
            <h2 id="portal-title" className="text-2xl font-bold text-primary md:text-3xl">
              Seus chamados, em um só lugar
            </h2>
            <p className="mt-4 text-muted-foreground">
              Descreva o problema, envie anexos e converse com o técnico. Veja o status de cada atendimento e os prazos do seu contrato.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Criação e atualização de chamados com anexos",
                "Prazos de atendimento e tempo restante",
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
              { icon: BarChart3, t: "Prazos de atendimento", d: "Chamados no prazo, em risco ou atrasados." },
              { icon: Clock, t: "Tempo de resposta", d: "Tempo médio para responder e resolver." },
              { icon: Headset, t: "Lista de chamados", d: "Filtros por status, prioridade e técnico." },
            ].map((c) => (
              <div key={c.t} className="rounded-lg border border-border bg-card p-5 shadow-card">
                <c.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">{c.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="diferenciais" className="home-section bg-home-surface py-12 md:py-16" aria-labelledby="diferenciais-title">
        <div className="mx-auto max-w-6xl px-6">
        <h2 id="diferenciais-title" className="text-2xl font-bold text-primary md:text-3xl">
          Por que a AguiarT.I
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {diferenciais.map((d) => (
            <div key={d.title} className="rounded-lg border border-border bg-card p-6">
              <d.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="mt-3 font-semibold">{d.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d.desc}</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      <section className="border-y border-border bg-background py-12 md:py-16" aria-labelledby="depoimentos">
        <div className="mx-auto max-w-6xl px-6">
          <h2 id="depoimentos" className="text-2xl font-bold text-primary md:text-3xl">
            Quem confia na gente
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {depoimentos.map((d) => (
              <figure key={d.nome} className="rounded-lg border border-border bg-card p-6 shadow-card">
                <blockquote className="text-sm text-foreground">“{d.texto}”</blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-primary">{d.nome}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="recursos" className="home-section bg-home-surface py-12 md:py-16" aria-labelledby="recursos-title">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-6 sm:flex-row sm:items-center">
          <div>
            <h2 id="recursos-title" className="text-2xl font-bold text-primary md:text-3xl">Antes de solicitar suporte</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">Um checklist com as informações úteis para o diagnóstico do seu equipamento ou sistema.</p>
          </div>
          <Button variant="outline" size="lg" className="shrink-0 px-5" asChild>
            <a href="/recursos/checklist-suporte-aguiarti.txt" download><Download aria-hidden="true" /> Baixar checklist</a>
          </Button>
        </div>
      </section>

      <section id="fale-conosco" className="home-section border-t border-border bg-background py-12 md:py-16" aria-labelledby="contato-title">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2">
          <div>
            <h2 id="contato-title" className="text-2xl font-bold text-primary md:text-3xl">Fale com a AguiarT.I</h2>
            <p className="mt-3 max-w-lg text-muted-foreground">Precisa de suporte ou quer conversar sobre automação comercial? Conte o que sua empresa precisa.</p>
            <div className="mt-6 flex flex-col items-start gap-3">
              <Button variant="link" className="h-auto min-h-11 max-w-full whitespace-normal px-0 text-left" asChild>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer"><WhatsAppIcon aria-hidden="true" /> {WHATSAPP_DISPLAY}</a>
              </Button>
              <Button variant="link" className="h-auto min-h-11 max-w-full whitespace-normal break-all px-0 text-left" asChild>
                <a href={`mailto:${SITE_EMAIL}`}><Mail aria-hidden="true" /> {SITE_EMAIL}</a>
              </Button>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
