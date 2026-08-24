import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Perguntas Frequentes — Suporte e SLA | AguiarT.I" },
      {
        name: "description",
        content:
          "Dúvidas sobre SLA, atendimento remoto, abertura de chamados e notificações por WhatsApp da AguiarT.I.",
      },
      { property: "og:title", content: "FAQ | AguiarT.I" },
      { property: "og:description", content: "Respostas sobre prazos, planos e como abrir um chamado." },
    ],
  }),
  component: Faq,
});

const perguntas = [
  {
    q: "Como abro um chamado?",
    a: "Pelo formulário 'Abrir Chamado' no site ou diretamente pelo WhatsApp. Você recebe o número do chamado e o prazo de resposta conforme o seu plano.",
  },
  {
    q: "O que é SLA e como ele funciona?",
    a: "SLA é o prazo acordado para primeira resposta e resolução. Ele varia por plano e prioridade — por exemplo, 2h de resposta e 48h de resolução no plano Empresarial.",
  },
  {
    q: "Atendem pessoa física?",
    a: "Sim. Atendemos usuários finais, além de pequenas, médias e grandes empresas com contas corporativas e múltiplos usuários.",
  },
  {
    q: "Recebo notificações no WhatsApp?",
    a: "Sim, mediante consentimento. Enviamos confirmação de abertura, atribuição de técnico, mudanças de status, alertas de SLA e pesquisa de satisfação.",
  },
  {
    q: "O acesso remoto é seguro?",
    a: "Utilizamos ferramentas com sessão autorizada pelo usuário, criptografia e registro do atendimento no histórico do chamado.",
  },
];

function Faq() {
  return (
    <>
      <PageHero title="Perguntas frequentes" subtitle="Prazos, planos, segurança e uso do portal." />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Accordion type="single" collapsible className="w-full">
          {perguntas.map((p, i) => (
            <AccordionItem key={p.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{p.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{p.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
