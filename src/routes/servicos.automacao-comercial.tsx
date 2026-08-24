import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/servicos/automacao-comercial")({
  head: () => ({
    meta: [
      { title: "Automação Comercial: PDV, ERP e Fiscal | AguiarT.I" },
      {
        name: "description",
        content:
          "Implantação de PDV, impressoras fiscais, balanças, SAT/NFC-e e integração com ERP para varejo e atacado.",
      },
      { property: "og:title", content: "Automação Comercial | AguiarT.I" },
      {
        property: "og:description",
        content: "PDV, ERP, emissão fiscal e integrações que mantêm sua loja vendendo.",
      },
    ],
  }),
  component: Page,
});

const escopo = [
  "Instalação e configuração de PDV (frente de caixa) e periféricos",
  "Impressoras não fiscais, SAT, NFC-e e NF-e",
  "Balanças, leitores de código de barras e gavetas",
  "Integração de ERP com e-commerce e marketplaces",
  "Migração de dados e treinamento da equipe de loja",
  "Manutenção preventiva e plantão em datas críticas",
];

function Page() {
  return (
    <>
      <PageHero
        title="Automação Comercial"
        subtitle="PDV, impressoras fiscais, balanças e integração de sistemas de vendas com o seu ERP."
      />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-muted-foreground">
          Cuidamos de toda a operação de frente de caixa e retaguarda: da homologação fiscal à
          integração com o ERP, garantindo que o seu ponto de venda não pare.
        </p>
        <h2 className="mt-10 text-xl font-bold">O que está incluso</h2>
        <ul className="mt-4 space-y-3">
          {escopo.map((i) => (
            <li key={i} className="flex gap-3 text-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>{i}</span>
            </li>
          ))}
        </ul>
        <Button variant="hero" size="lg" className="mt-10" asChild>
          <Link to="/abrir-chamado">Solicitar atendimento</Link>
        </Button>
      </div>
    </>
  );
}
