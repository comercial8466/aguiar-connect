import { createFileRoute } from "@tanstack/react-router";
import { Check, Clock } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { PortalCta } from "@/components/site/PortalCta";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { whatsappLink, WHATSAPP_DISPLAY } from "@/lib/site";
import { COMBOS, HORA_TECNICA, comboPrice, formatBRL } from "@/lib/planos";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Combos de Atendimento e Hora Técnica | AguiarT.I" },
      {
        name: "description",
        content:
          "Combos de suporte técnico da AguiarT.I com valores reais por hora técnica (a partir de R$ 105/h), SLA definido e atendimento direto por WhatsApp.",
      },
      { property: "og:title", content: "Combos de Atendimento | AguiarT.I" },
      {
        property: "og:description",
        content: "Pacotes de horas técnicas com desconto progressivo e SLA de 24h a 2h.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Planos,
});

function Planos() {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <>
      <PageHero
        title="Combos de atendimento"
        subtitle={`Valores reais baseados na hora técnica de ${formatBRL(HORA_TECNICA)}. Escolha o combo e fale direto com um atendente.`}
      />

      <div ref={ref} className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
          {COMBOS.map((combo) => {
            const { bruto, total, hora } = comboPrice(combo);
            const msg = `Olá! Quero contratar o ${combo.nome} (${combo.horas}h técnicas por ${formatBRL(total)}/mês).`;
            return (
              <article
                key={combo.slug}
                data-reveal
                className={`flex flex-col rounded-2xl border p-6 shadow-card ${
                  combo.destaque ? "border-primary ring-1 ring-primary/30" : "border-border"
                }`}
              >
                {combo.destaque && <Badge className="mb-3 w-fit">Mais contratado</Badge>}
                <h2 className="font-display text-xl font-bold text-primary">{combo.nome}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{combo.publico}</p>

                <p className="mt-5 text-3xl font-extrabold">
                  {formatBRL(total)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {combo.horas > 1 ? "/mês" : " / hora"}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {combo.horas}h técnicas · {formatBRL(hora)}/hora
                  {combo.desconto > 0 && (
                    <>
                      {" "}
                      · <span className="line-through">{formatBRL(bruto)}</span>{" "}
                      <span className="font-medium text-accent">
                        economia de {Math.round(combo.desconto * 100)}%
                      </span>
                    </>
                  )}
                </p>

                <p className="mt-4 flex items-center gap-2 text-xs font-medium">
                  <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                  {combo.sla}
                </p>

                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {combo.inclui.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Button variant="whatsapp" className="mt-6" asChild>
                  <a href={whatsappLink(msg)} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon aria-hidden="true" /> Escolher e falar com atendente
                  </a>
                </Button>
                <PortalCta variant="outline" className="mt-2">
                  Abrir chamado no portal
                </PortalCta>
              </article>
            );
          })}
        </div>

        <section
          data-reveal
          className="mt-14 rounded-2xl border border-border bg-secondary/60 p-8 text-center"
        >
          <h2 className="font-display text-xl font-bold text-primary">Como funciona a hora técnica</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            A hora técnica avulsa custa {formatBRL(HORA_TECNICA)} e é debitada em frações de 30
            minutos. Nos combos mensais o saldo não utilizado acumula por 30 dias, e chamados
            críticos entram no topo da fila conforme o SLA do plano. Após escolher o combo, um
            atendente confirma o escopo pelo WhatsApp {WHATSAPP_DISPLAY}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="whatsapp" size="lg" asChild>
              <a
                href={whatsappLink("Olá! Quero ajuda para escolher o combo ideal de horas técnicas.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon aria-hidden="true" /> Falar com atendente
              </a>
            </Button>
            <PortalCta variant="heroOutline" size="lg">
              Criar conta no portal
            </PortalCta>
          </div>
        </section>
      </div>
    </>
  );
}
