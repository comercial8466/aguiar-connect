import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Prose } from "@/components/site/PageHero";
import { SITE_EMAIL } from "@/lib/site";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade (LGPD) | AguiarT.I" },
      {
        name: "description",
        content:
          "Como a AguiarT.I coleta, usa, armazena e protege dados pessoais de clientes e usuários, conforme a LGPD.",
      },
      { property: "og:title", content: "Política de Privacidade | AguiarT.I" },
      { property: "og:description", content: "Tratamento de dados, consentimento WhatsApp e direitos do titular." },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <>
      <PageHero title="Política de Privacidade (LGPD)" />
      <Prose>
        <h2>1. Dados coletados</h2>
        <p>
          Coletamos nome, e-mail, telefone/WhatsApp, empresa e informações técnicas necessárias ao
          atendimento (descrição do problema, anexos, registros de acesso remoto e conversas).
        </p>
        <h2>2. Finalidade</h2>
        <p>
          Os dados são utilizados para prestar suporte técnico, registrar chamados, cumprir SLA,
          emitir relatórios e enviar comunicações relacionadas ao atendimento.
        </p>
        <h2>3. Comunicações por WhatsApp</h2>
        <p>
          O envio de notificações transacionais por WhatsApp (abertura, atribuição, mudança de status,
          alerta de SLA e pesquisa de satisfação) depende do seu consentimento, que pode ser revogado
          a qualquer momento respondendo à mensagem ou solicitando pelo e-mail {SITE_EMAIL}.
        </p>
        <h2>4. Armazenamento e retenção</h2>
        <p>
          Registros de chamados e conversas são mantidos pelo período definido em contrato (padrão de
          6 meses) ou pelo prazo exigido por lei, em ambiente com controle de acesso e criptografia.
        </p>
        <h2>5. Compartilhamento</h2>
        <p>
          Não vendemos dados. Podemos compartilhar informações com provedores necessários à operação
          (hospedagem, e-mail e provedor de mensageria WhatsApp), sempre sob obrigação de sigilo.
        </p>
        <h2>6. Direitos do titular</h2>
        <ul>
          <li>Confirmação da existência de tratamento e acesso aos dados</li>
          <li>Correção de dados incompletos ou desatualizados</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
          <li>Revogação do consentimento</li>
        </ul>
        <h2>7. Contato do encarregado</h2>
        <p>Solicitações relacionadas à LGPD devem ser enviadas para {SITE_EMAIL}.</p>
      </Prose>
    </>
  );
}
