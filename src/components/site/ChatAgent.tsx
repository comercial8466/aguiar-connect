import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Send, X } from "lucide-react";
import { chatWithAgent } from "@/lib/chat.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { whatsappLink } from "@/lib/site";

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME: Msg = {
  role: "assistant",
  content:
    "Olá! Sou a Aguiar IA, assistente da AguiarT.I. Posso explicar nossos serviços de automação comercial, os combos de horas técnicas e ajudar você a criar sua conta no Portal do Cliente. Como posso ajudar?",
};

const SUGGESTIONS = [
  "Quais são os combos de horas técnicas?",
  "Meu PDV parou de emitir NFC-e",
  "Como abro um chamado no portal?",
];

export function ChatAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const send = useServerFn(chatWithAgent);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const ask = async (text: string) => {
    const clean = text.trim().slice(0, 2000);
    if (!clean || busy) return;
    const next = [...messages, { role: "user" as const, content: clean }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await send({ data: { messages: next.slice(-12) } });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Tive um problema de conexão. Chame um atendente pelo WhatsApp +55 51 99666-8646.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir agente de atendimento com IA"
          className="fixed bottom-24 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:bottom-28 md:h-16 md:w-16"
        >
          <Bot className="h-6 w-6 md:h-7 md:w-7" aria-hidden="true" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[min(560px,80vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <header className="flex items-center justify-between gap-2 bg-primary px-4 py-3 text-primary-foreground">
            <span className="flex items-center gap-2 font-display text-sm font-semibold">
              <Bot className="h-4 w-4" aria-hidden="true" /> Aguiar IA · atendimento
            </span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar atendimento">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-primary/10 text-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.content}
              </div>
            ))}
            {busy && <p className="text-xs text-muted-foreground">Aguiar IA está digitando…</p>}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void ask(s)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border px-4 py-2">
            <div className="flex flex-wrap gap-2 text-xs">
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="font-medium text-primary hover:underline"
              >
                Criar conta no portal
              </Link>
              <a
                href={whatsappLink("Olá! Conversei com a Aguiar IA e quero falar com um atendente.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                <WhatsAppIcon className="!h-3.5 !w-3.5" aria-hidden="true" /> Falar com atendente
              </a>
            </div>
          </div>

          <form
            className="flex items-center gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escreva sua dúvida…"
              maxLength={2000}
              aria-label="Mensagem para o agente de atendimento"
            />
            <Button type="submit" size="icon" variant="hero" disabled={busy} aria-label="Enviar mensagem">
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
