import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/servicos/suporte-remoto")({
  head: () => ({
    meta: [
      { title: "Suporte Técnico Remoto com SLA | AguiarT.I" },
      {
        name: "description",
        content:
          "Mesa de suporte N1, N2 e N3 com abertura de chamados, SLA por contrato, chat com técnico e acesso remoto seguro.",
      },
      { property: "og:title", content: "Suporte Técnico Remoto | AguiarT.I" },
      {
        property: "og:description",
        content: "Atendimento remoto com SLA definido, dashboard de chamados e notificações no WhatsApp.",
      },
    ],
  }),
  component: Page,
});

const slas = [
  { plano: "Essencial", resposta: "4 horas úteis", resolucao: "72 horas úteis", cobertura: "Seg a Sex, 8h-18h" },
  { plano: "Empresarial", resposta: "2 horas úteis", resolucao: "48 horas úteis", cobertura: "Seg a Sáb, 8h-20h" },
  { plano: "Crítico 24/7", resposta: "30 minutos", resolucao: "12 horas", cobertura: "24 horas, todos os dias" },
];

function Page() {
  return (
    <>
      <PageHero
        title="Suporte Técnico Remoto"
        subtitle="Diagnóstico e resolução à distância para usuários finais e empresas, com SLA acordado em contrato."
      />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-xl font-bold">Níveis de atendimento</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          N1: triagem e problemas recorrentes. N2: análise técnica aprofundada. N3: especialistas em
          ERP, fiscal e infraestrutura.
        </p>

        <h2 className="mt-10 text-xl font-bold">Tabela de SLA</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Comparativo de SLA por plano de suporte</caption>
            <thead className="bg-secondary text-secondary-foreground">
              <tr>
                <th scope="col" className="p-3 font-semibold">Plano</th>
                <th scope="col" className="p-3 font-semibold">Resposta inicial</th>
                <th scope="col" className="p-3 font-semibold">Resolução</th>
                <th scope="col" className="p-3 font-semibold">Cobertura</th>
              </tr>
            </thead>
            <tbody>
              {slas.map((s) => (
                <tr key={s.plano} className="border-t border-border">
                  <th scope="row" className="p-3 font-medium text-primary">{s.plano}</th>
                  <td className="p-3">{s.resposta}</td>
                  <td className="p-3">{s.resolucao}</td>
                  <td className="p-3">{s.cobertura}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button variant="hero" size="lg" className="mt-10" asChild>
          <Link to="/abrir-chamado">Abrir chamado</Link>
        </Button>
      </div>
    </>
  );
}
