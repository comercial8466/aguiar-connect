import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink("Olá! Vim pelo site da AguiarT.I e preciso de suporte técnico.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a AguiarT.I pelo WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(0.72_0.19_150)] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:h-16 md:w-16"
    >
      <MessageCircle className="!h-7 !w-7" aria-hidden="true" />
    </a>
  );
}
