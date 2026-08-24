import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Prose } from "@/components/site/PageHero";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso | AguiarT.I" },
      {
        name: "description",
        content:
          "Termos de uso do site e do portal de suporte da AguiarT.I: escopo do atendimento, SLA, responsabilidades e cancelamento.",
      },
      { property: "og:title", content: "Termos de Uso | AguiarT.I" },
      { property: "og:description", content: "Regras de uso do site e do portal de chamados da AguiarT.I." },
    ],
  }),
  component: Termos,
});

function Termos() {
  return (
    <>
      <PageHero title="Termos de Uso" />
      <Prose>
        <h2>1. Objeto</h2>
        <p>
          Estes termos regulam o uso do site institucional e do portal de suporte da AguiarT.I,
          incluindo a abertura e o acompanhamento de chamados técnicos.
        </p>
        <h2>2. Escopo do atendimento</h2>
        <p>
          O atendimento remoto abrange diagnóstico e resolução de problemas em sistemas, equipamentos
          e infraestrutura previstos em contrato. Serviços fora do escopo são orçados à parte.
        </p>
        <h2>3. SLA</h2>
        <p>
          Os prazos de primeira resposta e resolução seguem o plano contratado e a prioridade do
          chamado. A contagem considera a janela de cobertura do plano.
        </p>
        <h2>4. Responsabilidades do cliente</h2>
        <ul>
          <li>Fornecer informações corretas e acesso necessário ao atendimento</li>
          <li>Manter licenças de software e backups conforme orientado</li>
          <li>Autorizar as sessões de acesso remoto</li>
        </ul>
        <h2>5. Limitação de responsabilidade</h2>
        <p>
          A AguiarT.I não se responsabiliza por indisponibilidades causadas por terceiros, falhas de
          energia, links de internet ou alterações realizadas sem acompanhamento técnico.
        </p>
        <h2>6. Alterações</h2>
        <p>
          Estes termos podem ser atualizados. A versão vigente estará sempre publicada nesta página.
        </p>
      </Prose>
    </>
  );
}
