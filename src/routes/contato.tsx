import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { SITE_CITY, SITE_EMAIL, WHATSAPP_DISPLAY, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { ContactForm } from "@/components/site/ContactForm";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Fale com a AguiarT.I" },
      {
        name: "description",
        content:
          "Fale com a AguiarT.I por WhatsApp (+55 51 99666-8646) ou e-mail para suporte técnico e automação comercial.",
      },
      { property: "og:title", content: "Contato | AguiarT.I" },
      { property: "og:description", content: "WhatsApp, e-mail e atendimento remoto em todo o Brasil." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contato,
});

function Contato() {
  return (
    <>
      <PageHero title="Contato" subtitle="Resposta rápida por WhatsApp e atendimento remoto em todo o Brasil." />
      <section className="bg-background py-12">
      <div className="mx-auto grid max-w-5xl gap-6 px-6 md:grid-cols-3">
        <div className="rounded-lg border border-border p-6">
          <WhatsAppIcon className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-3 font-semibold">WhatsApp</h2>
          <p className="mt-1 text-sm text-muted-foreground">{WHATSAPP_DISPLAY}</p>
          <Button variant="whatsapp" className="mt-4 w-full" asChild>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              Iniciar conversa
            </a>
          </Button>
        </div>
        <div className="rounded-lg border border-border p-6">
          <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-3 font-semibold">E-mail</h2>
          <a href={`mailto:${SITE_EMAIL}`} className="mt-1 inline-flex min-h-11 items-center break-all text-sm text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{SITE_EMAIL}</a>
        </div>
        <div className="rounded-lg border border-border p-6">
          <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-3 font-semibold">Atendimento</h2>
          <p className="mt-1 text-sm text-muted-foreground">{SITE_CITY} — remoto em todo o país.</p>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-2xl px-6">
        <h2 className="mb-6 text-2xl font-bold text-primary">Envie sua mensagem</h2>
        <ContactForm />
      </div>
      </section>
    </>
  );
}
