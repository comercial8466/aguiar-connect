import { useState } from "react";
import { Bot } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { AguiarAgentModal } from "@/components/site/AguiarAgentModal";

const labelBase =
  "pointer-events-none whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold shadow-md backdrop-blur";

// Área de toque invisível: mantém o botão visualmente menor no celular
// sem reduzir a área tocável (44px visíveis + 6px de respiro por lado).
const touchArea = "after:absolute after:-inset-1.5 after:content-['']";

export function WhatsAppFloat() {
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  // Entra direto no portal: se já houver sessão vai para /chamados,
  // caso contrário abre o cadastro rápido e volta para /chamados.
  const entrarPeloWhats = () => {
    if (session) void navigate({ to: "/chamados" });
    else void navigate({ to: "/auth", search: { next: "/chamados", via: "whatsapp" } });
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4 pb-[env(safe-area-inset-bottom)]">
        {/* Botão do Agente Virtual Inteligente */}
        <div className="flex items-center gap-2.5">
          <span className={`${labelBase} bg-primary text-primary-foreground`}>Assistente IA</span>
          <button
            type="button"
            onClick={() => setIsAgentOpen(true)}
            aria-label="Abrir Assistente Virtual AguiarT.I para triagem e suporte inteligente"
            className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-accent-foreground ring-2 ring-accent shadow-xl transition-all duration-300 hover:scale-110 hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-14 md:w-14 ${touchArea}`}
          >
            <Bot className="h-5 w-5 text-white md:h-7 md:w-7" aria-hidden="true" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2 md:h-2.5 md:w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent md:h-2.5 md:w-2.5"></span>
            </span>
          </button>
        </div>

        {/* Entrar no portal pelo WhatsApp */}
        <div className="flex items-center gap-2.5">
          <span className={`${labelBase} bg-[oklch(0.72_0.19_150)] text-white`}>Entrar no portal</span>
          <button
            type="button"
            onClick={entrarPeloWhats}
            aria-label="Entrar no portal do cliente pelo WhatsApp e acompanhar meus chamados"
            className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[oklch(0.72_0.19_150)] text-white ring-2 ring-primary shadow-xl transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:h-14 md:w-14 ${touchArea}`}
          >
            <WhatsAppIcon className="!h-5 !w-5 md:!h-7 md:!w-7" aria-hidden="true" />
          </button>
        </div>

        {/* Botão WhatsApp Direto */}
        <div className="flex items-center gap-2.5">
          <span className={`${labelBase} bg-zinc-900 text-white`}>Fale no WhatsApp</span>
          <a
            href={whatsappLink("Olá! Vim pelo site da AguiarT.I e preciso de suporte técnico.")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Falar com a AguiarT.I pelo WhatsApp"
            className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[oklch(0.72_0.19_150)] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:h-14 md:w-14 ${touchArea}`}
          >
            <WhatsAppIcon className="!h-5 !w-5 md:!h-7 md:!w-7" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Modal do Agente Virtual */}
      <AguiarAgentModal isOpen={isAgentOpen} onClose={() => setIsAgentOpen(false)} />
    </>
  );
}
