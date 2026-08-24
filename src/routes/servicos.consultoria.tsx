import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/servicos/consultoria")({
  head: () => ({
    meta: [
      { title: "Consultoria, Infraestrutura e Treinamento | AguiarT.I" },
      {
        name: "description",
        content:
          "Consultoria em redes, servidores, backup e monitoramento, além de treinamento de equipes para uso de PDV e ERP.",
      },
      { property: "og:title", content: "Consultoria e Treinamento | AguiarT.I" },
      {
        property: "og:description",
        content: "Infraestrutura estável, backup confiável e equipes treinadas para operar sem travar.",
      },
    ],
  }),
  component: Page,
});

const itens = [
  "Diagnóstico de infraestrutura e plano de melhoria",
  "Projeto e manutenção de redes cabeadas e Wi-Fi",
  "Servidores, virtualização e políticas de backup",
  "Monitoramento proativo e alertas",
  "Treinamento presencial ou remoto para equipes de loja e retaguarda",
  "Documentação técnica e plano de continuidade",
];

function Page() {
  return (
    <>
      <PageHero
        title="Consultoria e Treinamento"
        subtitle="Redes, servidores, backup, monitoramento e capacitação para a sua equipe."
      />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ul className="space-y-3">
          {itens.map((i) => (
            <li key={i} className="flex gap-3 text-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>{i}</span>
            </li>
          ))}
        </ul>
        <Button variant="hero" size="lg" className="mt-10" asChild>
          <Link to="/contato">Falar com um consultor</Link>
        </Button>
      </div>
    </>
  );
}
