import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bot,
  Sparkles,
  Send,
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  MessageSquareText,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AGENT_TOPICS,
  analyzeProblem,
  buildWhatsAppAgentMessage,
  type TroubleshootingTopic,
  type TriageResult,
} from "@/lib/agent-knowledge";
import { whatsappLink } from "@/lib/site";
import { PRIORITY_LABELS, STATUS_LABELS, type TicketPriority } from "@/lib/tickets";

interface Message {
  id: string;
  sender: "agent" | "user";
  text: string;
  triage?: TriageResult;
  actions?: ("abrir_chamado" | "whatsapp" | "topicos" | "resolvido")[];
  timestamp: string;
}

interface AguiarAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AguiarAgentModal({ isOpen, onClose }: AguiarAgentModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [ticketForm, setTicketForm] = useState<{
    show: boolean;
    nome: string;
    empresa: string;
    categoria: string;
    prioridade: TicketPriority;
    descricao: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initChat = () => {
    setMessages([
      {
        id: "msg-welcome-1",
        sender: "agent",
        text: "Olá! Sou o **Assistente Virtual da AguiarT.I** 🤖.\n\nPosso te ajudar com diagnósticos rápidos de **Automação Comercial**, problemas no **PDV**, **NFC-e/SAT**, **Impressoras**, **Rede** ou realizar a triagem e abertura do seu chamado com cálculo de SLA.",
        actions: ["topicos"],
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setTicketForm(null);
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initChat();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, ticketForm]);

  if (!isOpen) return null;

  const handleSendMessage = (userText: string) => {
    if (!userText.trim()) return;

    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const triage = analyzeProblem(userText);
      const agentReply: Message = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: `${triage.summary}\n\nAqui estão algumas verificações rápidas recomendadas antes de abrir o chamado:`,
        triage,
        actions: ["resolvido", "abrir_chamado", "whatsapp"],
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, agentReply]);
      setIsTyping(false);
    }, 600);
  };

  const handleSelectTopic = (topic: TroubleshootingTopic) => {
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: `Preciso de ajuda com: ${topic.title}`,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const triage: TriageResult = {
        category: topic.category,
        suggestedPriority: topic.defaultPriority,
        slaHours: topic.defaultPriority === "critica" ? 2 : topic.defaultPriority === "alta" ? 4 : 8,
        matchedTopic: topic,
        troubleshootingSteps: topic.quickChecks,
        summary: `Entendido! Para problemas com **${topic.title}**, siga estes procedimentos imediatos:`,
      };

      const agentReply: Message = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: `${triage.summary}`,
        triage,
        actions: ["resolvido", "abrir_chamado", "whatsapp"],
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, agentReply]);
      setIsTyping(false);
    }, 500);
  };

  const handleStartTicket = (triage?: TriageResult, lastUserMsg?: string) => {
    setTicketForm({
      show: true,
      nome: "",
      empresa: "",
      categoria: triage?.category || "PDV / Frente de caixa",
      prioridade: triage?.suggestedPriority || "media",
      descricao: lastUserMsg || triage?.matchedTopic?.title || "",
    });
  };

  const handleResolveProblem = () => {
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [
      ...prev,
      {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: "🎉 **Excelente! Fico muito feliz em ter ajudado.**\n\nCaso volte a precisar de suporte ou queira contratar novos serviços de automação comercial e gestão de TI, estamos sempre à disposição!",
        actions: ["topicos"],
        timestamp: time,
      },
    ]);
  };

  const handleSendViaWhatsApp = (data: {
    nome: string;
    empresa: string;
    categoria: string;
    prioridade: string;
    descricao: string;
  }) => {
    const formattedMsg = buildWhatsAppAgentMessage(data);
    window.open(whatsappLink(formattedMsg), "_blank", "noopener,noreferrer");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-title"
      className="fixed inset-0 z-50 flex items-end justify-end p-2 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="flex h-[92vh] max-h-[640px] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-primary px-5 py-3.5 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold shadow-sm">
              <Bot className="h-5 w-5" aria-hidden="true" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="agent-title" className="font-display text-base font-bold text-white leading-none">
                  Assistente AguiarT.I
                </h2>
                <Badge variant="secondary" className="bg-white/15 text-[10px] text-white border-none py-0 px-1.5 font-normal">
                  IA Triagem
                </Badge>
              </div>
              <p className="text-xs text-primary-foreground/80 mt-0.5">
                Suporte Remoto & Automação Comercial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-white/10 hover:text-white"
              title="Reiniciar conversa"
              onClick={initChat}
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Reiniciar conversa</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-white/10 hover:text-white"
              onClick={onClose}
              title="Fechar assistente"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20 text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 shadow-xs ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-xs"
                    : "bg-background border border-border text-foreground rounded-bl-xs"
                }`}
              >
                {/* Text Formatting */}
                <div className="whitespace-pre-line leading-relaxed">
                  {msg.text.split("\n").map((line, idx) => {
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return <strong key={idx} className="block mt-1">{line.replaceAll("**", "")}</strong>;
                    }
                    return (
                      <span key={idx}>
                        {line}
                        <br />
                      </span>
                    );
                  })}
                </div>

                {/* Triage / Diagnostic Steps */}
                {msg.triage && (
                  <div className="mt-3.5 space-y-3 pt-3 border-t border-border/80">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="outline" className="font-semibold bg-muted/60">
                        📁 {msg.triage.category}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={
                          msg.triage.suggestedPriority === "critica"
                            ? "bg-destructive/15 text-destructive font-semibold"
                            : msg.triage.suggestedPriority === "alta"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                            : "bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold"
                        }
                      >
                        ⚡ Prioridade: {PRIORITY_LABELS[msg.triage.suggestedPriority]}
                      </Badge>
                      <span className="flex items-center gap-1 text-muted-foreground font-medium">
                        <Clock className="h-3.5 w-3.5" /> SLA estimado: ~{msg.triage.slaHours}h
                      </span>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-2 border border-border/50">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
                        Passos de verificação sugeridos:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                        {msg.triage.troubleshootingSteps.map((step, sIdx) => (
                          <li key={sIdx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Action Buttons within Message */}
                {msg.actions && (
                  <div className="mt-3 flex flex-wrap gap-2 pt-2">
                    {msg.actions.includes("resolvido") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-green-500/40 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                        onClick={handleResolveProblem}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-500" />
                        Resolvido!
                      </Button>
                    )}

                    {msg.actions.includes("abrir_chamado") && (
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => handleStartTicket(msg.triage, msg.text)}
                      >
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                        Abrir Chamado
                      </Button>
                    )}

                    {msg.actions.includes("whatsapp") && (
                      <Button
                        size="sm"
                        variant="whatsapp"
                        className="h-7 text-xs"
                        onClick={() => {
                          const formatted = buildWhatsAppAgentMessage({
                            categoria: msg.triage?.category || "Suporte Geral",
                            prioridade: msg.triage?.suggestedPriority || "media",
                            descricao: msg.triage?.matchedTopic?.title || "Solicitação de suporte via Agente Virtual",
                          });
                          window.open(whatsappLink(formatted), "_blank", "noopener,noreferrer");
                        }}
                      >
                        <MessageSquareText className="h-3.5 w-3.5 mr-1" />
                        WhatsApp Técnico
                      </Button>
                    )}
                  </div>
                )}

                {/* Topic quick selection */}
                {msg.actions?.includes("topicos") && (
                  <div className="mt-3 grid grid-cols-1 gap-1.5 pt-2 sm:grid-cols-2">
                    {AGENT_TOPICS.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => handleSelectTopic(topic)}
                        className="flex items-center justify-between rounded-lg border border-border/80 bg-background/80 px-2.5 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <span className="truncate">{topic.title}</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="mt-1 px-1 text-[10px] text-muted-foreground">{msg.timestamp}</span>
            </div>
          ))}

          {/* Live Ticket Builder Panel inside Chat */}
          {ticketForm && (
            <div className="rounded-xl border border-primary/30 bg-card p-4 shadow-md space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-xs text-foreground uppercase tracking-wide">
                    Formulário Rápido de Chamado
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  SLA {ticketForm.prioridade.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-muted-foreground font-medium">Seu Nome *</label>
                    <Input
                      className="h-8 text-xs mt-1"
                      placeholder="Ex.: João Silva"
                      value={ticketForm.nome}
                      onChange={(e) => setTicketForm({ ...ticketForm, nome: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground font-medium">Empresa</label>
                    <Input
                      className="h-8 text-xs mt-1"
                      placeholder="Ex.: Mercado Central"
                      value={ticketForm.empresa}
                      onChange={(e) => setTicketForm({ ...ticketForm, empresa: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground font-medium">Descrição do Problema *</label>
                  <Input
                    className="h-8 text-xs mt-1"
                    placeholder="Descreva o que está ocorrendo..."
                    value={ticketForm.descricao}
                    onChange={(e) => setTicketForm({ ...ticketForm, descricao: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => setTicketForm(null)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="whatsapp"
                  className="h-7 text-xs"
                  disabled={!ticketForm.nome.trim() || !ticketForm.descricao.trim()}
                  onClick={() => handleSendViaWhatsApp(ticketForm)}
                >
                  Enviar via WhatsApp <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
                <Button
                  size="sm"
                  variant="hero"
                  className="h-7 text-xs"
                  asChild
                >
                  <Link
                    to="/abrir-chamado"
                    onClick={onClose}
                  >
                    Abrir no Portal <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground italic pl-2">
              <Bot className="h-3.5 w-3.5 animate-bounce text-primary" />
              AguiarT.I está analisando o problema...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer / Input Box */}
        <div className="border-t border-border bg-card p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex items-center gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Descreva seu problema (ex: PDV travado, erro NFC-e, impressora)..."
              className="flex-1 text-xs h-9 bg-background focus-visible:ring-primary"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isTyping}
              className="h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
              title="Enviar mensagem"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span>💡 Dica: Seja específico para triagem precisa de SLA.</span>
            <Link to="/portal" onClick={onClose} className="underline hover:text-primary">
              Portal do Cliente
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
