import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a AguiarT.I — Time e Missão" },
      {
        name: "description",
        content:
          "Conheça a AguiarT.I: especialistas em automação comercial e suporte técnico remoto para pequenas, médias e grandes empresas.",
      },
      { property: "og:title", content: "Sobre a AguiarT.I" },
      {
        property: "og:description",
        content: "Time técnico dedicado a manter a operação dos nossos clientes rodando sem interrupções.",
      },
    ],
  }),
  component: Sobre,
});

const time = [
  { nome: "Coordenação técnica", papel: "Gestão de SLA, escalonamento e qualidade do atendimento." },
  { nome: "Especialistas N2/N3", papel: "ERP, fiscal, redes e servidores." },
  { nome: "Mesa de suporte N1", papel: "Triagem, atendimento remoto e acompanhamento de chamados." },
];

function Sobre() {
  return (
    <>
      <PageHero
        title="Sobre a AguiarT.I"
        subtitle="Tecnologia aplicada ao dia a dia do comércio e das empresas que não podem parar."
      />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-muted-foreground">
          A AguiarT.I atua com automação comercial e suporte técnico remoto, atendendo desde usuários
          domésticos até redes com múltiplas lojas. Nossa proposta é simples: resolver rápido, com
          prazo claro e histórico registrado.
        </p>
        <h2 className="mt-10 text-xl font-bold">Nosso time</h2>
        <div className="mt-4 space-y-4">
          {time.map((t) => (
            <div key={t.nome} className="rounded-xl border border-border p-5">
              <h3 className="font-semibold">{t.nome}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.papel}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
