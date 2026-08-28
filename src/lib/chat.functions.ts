import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const inputSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
});

const SYSTEM_PROMPT = `Você é a Aguiar IA, agente de atendimento virtual da AguiarT.I — empresa de automação comercial e suporte técnico remoto em Porto Alegre/RS.

Regras:
- Responda sempre em português do Brasil, com tom cordial, direto e profissional. Máximo 5 frases por resposta.
- Serviços: automação comercial (PDV, ERP, emissão fiscal NFC-e/SAT/NF-e), suporte técnico remoto, redes, backups e consultoria de TI.
- Combos por hora técnica (hora avulsa R$ 140): Essencial 5h/mês, Avançado 12h/mês, Gestão TI 25h/mês, com descontos progressivos e SLA de 24h, 8h, 4h e 2h conforme o plano.
- Sempre que o usuário demonstrar interesse, oriente-o a criar conta no Portal do Cliente (link /auth) para abrir chamados, enviar anexos e acompanhar o SLA.
- Para fechar contrato ou falar com um atendente humano, indique o WhatsApp +55 51 99666-8646.
- Nunca invente preços, prazos ou dados de clientes. Se não souber, encaminhe ao atendente humano.`;

export const chatWithAgent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { reply: "O agente está temporariamente indisponível. Fale conosco pelo WhatsApp +55 51 99666-8646." };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
      }),
    });

    if (response.status === 429) {
      return { reply: "Estamos com muitas conversas agora. Tente novamente em instantes ou chame no WhatsApp +55 51 99666-8646." };
    }
    if (!response.ok) {
      return { reply: "Não consegui responder agora. Fale com um atendente pelo WhatsApp +55 51 99666-8646." };
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = json.choices?.[0]?.message?.content?.trim();
    return {
      reply:
        reply ??
        "Não consegui responder agora. Fale com um atendente pelo WhatsApp +55 51 99666-8646.",
    };
  });
