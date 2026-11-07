import { useId, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { whatsappLink } from "@/lib/site";

export function ContactForm() {
  const id = useId();

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!name || !message) return;
    const text = [
      `Olá! Meu nome é ${name}.`,
      company ? `Empresa: ${company}.` : "",
      message,
    ].filter(Boolean).join("\n");
    window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={sendMessage} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={`${id}-name`} className="text-sm font-medium">Nome</label>
          <Input id={`${id}-name`} name="name" autoComplete="name" required maxLength={100} className="h-11 bg-background" />
        </div>
        <div className="space-y-2">
          <label htmlFor={`${id}-company`} className="text-sm font-medium">Empresa <span className="text-muted-foreground">(opcional)</span></label>
          <Input id={`${id}-company`} name="company" autoComplete="organization" maxLength={160} className="h-11 bg-background" />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor={`${id}-message`} className="text-sm font-medium">Como podemos ajudar?</label>
        <Textarea id={`${id}-message`} name="message" required maxLength={2000} rows={4} className="bg-background" />
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        <WhatsAppIcon aria-hidden="true" /> Enviar pelo WhatsApp
      </Button>
    </form>
  );
}