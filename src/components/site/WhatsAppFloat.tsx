import { useState } from "react";
import { Bot } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { AguiarAgentModal } from "@/components/site/AguiarAgentModal";

export function WhatsAppFloat() {
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const navigate = useNavigate();

  // Entra direto no portal: se já houver sessão vai para /chamados,
  // caso contrário abre o cadastro rápido e volta para /chamados.
  const entrarPeloWhats = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) void navigate({ to: "/chamados" });
    else void navigate({ to: "/auth", search: { next: "/chamados", via: "whatsapp" } });
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {/* Botão do Agente Virtual Inteligente */}
        <div className="group relative flex items-center">
          <span className="pointer-events-none absolute right-16 hidden whitespace-nowrap rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-md transition-opacity duration-200 group-hover:block md:inline-block">
            Assistente Virtual IA 🤖
          </span>
          <button
            type="button"
            onClick={() => setIsAgentOpen(true)}
            aria-label="Abrir Assistente Virtual AguiarT.I para triagem e suporte inteligente"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-accent-foreground ring-2 ring-accent shadow-xl transition-all duration-300 hover:scale-110 hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-14 md:w-14"
          >
            <Bot className="h-6 w-6 text-white md:h-7 md:w-7" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex h-4 w-4 rounded-full bg-accent text-[9px] font-bold text-accent-foreground items-center justify-center">
                AI
              </span>
            </span>
          </button>
        </div>

        {/* Entrar no portal pelo WhatsApp */}
        <div className="group relative flex items-center">
          <span className="pointer-events-none absolute right-16 hidden whitespace-nowrap rounded-md bg-[oklch(0.72_0.19_150)] px-2.5 py-1 text-xs font-semibold text-white shadow-md transition-opacity duration-200 group-hover:block md:inline-block">
            Entrar no portal pelo WhatsApp
          </span>
          <button
            type="button"
            onClick={() => void entrarPeloWhats()}
            aria-label="Entrar no portal do cliente pelo WhatsApp e acompanhar meus chamados"
            className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-[oklch(0.72_0.19_150)] text-white ring-2 ring-primary shadow-xl transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:h-14 md:w-14"
          >
            <WhatsAppIcon className="!h-6 !w-6 md:!h-7 md:!w-7" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
              Portal
            </span>
          </button>
        </div>

        {/* Botão WhatsApp Direto */}
        <div className="group relative flex items-center">
          <span className="pointer-events-none absolute right-16 hidden whitespace-nowrap rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white shadow-md transition-opacity duration-200 group-hover:block md:inline-block">
            Fale no WhatsApp 💬
          </span>
          <a
            href={whatsappLink("Olá! Vim pelo site da AguiarT.I e preciso de suporte técnico.")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Falar com a AguiarT.I pelo WhatsApp"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[oklch(0.72_0.19_150)] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:h-14 md:w-14"
          >
            <WhatsAppIcon className="!h-6 !w-6 md:!h-7 md:!w-7" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Modal do Agente Virtual */}
      <AguiarAgentModal isOpen={isAgentOpen} onClose={() => setIsAgentOpen(false)} />
    </>
  );
}
