import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/tickets";

export const Route = createFileRoute("/_authenticated/admin/auditoria")({
  head: () => ({
    meta: [
      { title: "Logs de Auditoria | AguiarT.I" },
      {
        name: "description",
        content:
          "Rastreie quem acessou ou alterou chamados, papéis de usuários e prazos de SLA no portal AguiarT.I.",
      },
      { property: "og:title", content: "Logs de Auditoria | AguiarT.I" },
      { property: "og:description", content: "Trilha de auditoria de chamados, papéis e SLA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Auditoria,
});

type LogRow = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: unknown;
  new_data: unknown;
  created_at: string;
};

const ENTITIES = ["todos", "tickets", "user_roles", "ticket_attachments"] as const;

function Auditoria() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [entity, setEntity] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (entity !== "todos") q = q.eq("entity_type", entity);
    const { data, error } = await q;
    if (error) toast.error("Falha ao carregar auditoria", { description: error.message });
    setLogs((data ?? []) as LogRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) void load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, entity]);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-2xl font-bold text-primary">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Somente Gestores/Admins podem consultar os logs de auditoria.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-primary">Logs de auditoria</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Registro imutável de criação e alteração de chamados, prazos de SLA, papéis de usuários e
        anexos.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Select value={entity} onValueChange={setEntity}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENTITIES.map((e) => (
              <SelectItem key={e} value={e}>
                {e === "todos"
                  ? "Todos os registros"
                  : e === "tickets"
                    ? "Chamados e SLA"
                    : e === "user_roles"
                      ? "Papéis de usuários"
                      : "Anexos"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => void load()}>
          Atualizar
        </Button>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Carregando…</p>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-xl border border-border">
          {logs.map((log) => (
            <li key={log.id} className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{log.action}</Badge>
                <span className="text-sm font-medium">{log.entity_type}</span>
                <span className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</span>
                <span className="text-xs text-muted-foreground">
                  autor: {log.actor_id ?? "sistema"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => setOpenId(openId === log.id ? null : log.id)}
                >
                  {openId === log.id ? "Ocultar" : "Ver dados"}
                </Button>
              </div>
              {openId === log.id && (
                <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-muted p-3 text-xs">
                  {JSON.stringify({ antes: log.old_data, depois: log.new_data }, null, 2)}
                </pre>
              )}
            </li>
          ))}
          {logs.length === 0 && (
            <li className="p-4 text-sm text-muted-foreground">Nenhum registro encontrado.</li>
          )}
        </ul>
      )}
    </div>
  );
}
