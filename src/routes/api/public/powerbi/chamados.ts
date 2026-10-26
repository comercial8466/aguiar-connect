import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { csvCell, toExportRow } from "@/lib/powerbi-export";

const query = z.object({
  token: z.string().regex(/^[a-f0-9]{48}$/),
  format: z.enum(["json", "csv"]).default("json"),
});

export const Route = createFileRoute("/api/public/powerbi/chamados")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const parsed = query.safeParse({
          token: url.searchParams.get("token") ?? "",
          format: url.searchParams.get("format") ?? undefined,
        });
        if (!parsed.success) return new Response("Unauthorized", { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: tok } = await supabaseAdmin
          .from("powerbi_feed_tokens")
          .select("id")
          .eq("token", parsed.data.token)
          .eq("active", true)
          .maybeSingle();
        if (!tok) return new Response("Unauthorized", { status: 401 });
        await supabaseAdmin
          .from("powerbi_feed_tokens")
          .update({ last_used_at: new Date().toISOString() })
          .eq("id", tok.id);

        const { data, error } = await supabaseAdmin
          .from("tickets")
          .select(
            "id, title, category, company, status, priority, assigned_to, sla_due_at, first_response_at, resolved_at, created_at, updated_at, satisfaction_rating",
          )
          .order("created_at", { ascending: false })
          .limit(50000);
        if (error) return new Response("Erro ao ler chamados", { status: 500 });

        const rows = (data ?? []).map((t) => ({
          id: t.id,
          titulo: t.title,
          categoria: t.category,
          empresa: t.company ?? "Sem empresa",
          status: STATUS[t.status] ?? t.status,
          prioridade: PRIORITY[t.priority] ?? t.priority,
          atribuido: t.assigned_to ? "Sim" : "Não",
          aberto_em: t.created_at,
          atualizado_em: t.updated_at,
          prazo_sla: t.sla_due_at,
          primeira_resposta_em: t.first_response_at,
          resolvido_em: t.resolved_at,
          horas_ate_resposta: hours(t.created_at, t.first_response_at),
          horas_ate_resolucao: hours(t.created_at, t.resolved_at),
          situacao_sla: slaStatus(t.sla_due_at, t.resolved_at),
          avaliacao: t.satisfaction_rating,
        }));

        const headers = { "Cache-Control": "no-store" };
        if (parsed.data.format === "csv") {
          const cols = Object.keys(rows[0] ?? { id: "" });
          const body = [cols.join(";"), ...rows.map((r) => cols.map((c) => csvCell((r as Record<string, unknown>)[c])).join(";"))].join("\r\n");
          return new Response("\uFEFF" + body, { headers: { ...headers, "Content-Type": "text/csv; charset=utf-8" } });
        }
        return Response.json(rows, { headers });
      },
    },
  },
});
