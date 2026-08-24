import { createFileRoute, Link } from "@tanstack/react-router";
import { Headset, Network, Store } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/servicos/")({
  head: () => ({
    meta: [
      { title: "Serviços — Automação Comercial e Suporte | AguiarT.I" },
      {
        name: "description",
        content:
          "Conheça os serviços da AguiarT.I: automação comercial (PDV, ERP, fiscal), suporte técnico remoto e consultoria em infraestrutura.",
      },
      { property: "og:title", content: "Serviços da AguiarT.I" },
      {
        property: "og:description",
        content: "Automação comercial, suporte remoto com SLA e consultoria em infraestrutura de TI.",
      },
    ],
  }),
  component: ServicosIndex,
});

const items = [
  {
    icon: Store,
    title: "Automação Comercial",
    desc: "Implantação e manutenção de PDV, impressoras fiscais, balanças, SAT/NFC-e e integração com ERP.",
    to: "/servicos/automacao-comercial" as const,
  },
  {
    icon: Headset,
    title: "Suporte Técnico Remoto",
    desc: "Mesa de suporte N1/N2/N3 com abertura de chamados, SLA por contrato e atendimento remoto seguro.",
    to: "/servicos/suporte-remoto" as const,
  },
  {
    icon: Network,
    title: "Consultoria e Treinamento",
    desc: "Diagnóstico de infraestrutura, redes, servidores, backup, monitoramento e capacitação de equipes.",
    to: "/servicos/consultoria" as const,
  },
];

function ServicosIndex() {
  return (
    <>
      <PageHero
        title="Nossos serviços"
        subtitle="Soluções de tecnologia para o balcão, o escritório e o data center."
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
        {items.map((s) => (
          <article key={s.title} className="rounded-xl border border-border p-6 shadow-card">
            <s.icon className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            <Button variant="link" className="mt-4 px-0" asChild>
              <Link to={s.to}>Saiba mais</Link>
            </Button>
          </article>
        ))}
      </div>
    </>
  );
}
