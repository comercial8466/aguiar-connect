import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/seguranca")({
  head: () => ({
    meta: [
      { title: "Verificação de Segurança | AguiarT.I" },
      {
        name: "description",
        content:
          "Rode a verificação automatizada de segurança do backend antes de publicar: proteção por linha, acesso anônimo e 2FA de gestores.",
      },
      { property: "og:title", content: "Verificação de Segurança | AguiarT.I" },
      {
        property: "og:description",
        content: "Checagem de políticas de acesso e 2FA antes de cada publicação.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Seguranca,
});

type Finding = { severity: string; check_name: string; detail: string };

function Seguranca() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [running, setRunning] = useState(false);
  const [ranAt, setRanAt] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    const { data, error } = await supabase.rpc("security_audit");
    setRunning(false);
    if (error) {
      toast.error("Falha ao executar a verificação", { description: error.message });
      return;
    }
    setFindings((data ?? []) as Finding[]);
    setRanAt(new Date().toLocaleString("pt-BR"));
  };

  useEffect(() => {
    if (isAdmin) void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-2xl font-bold text-primary">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Somente Gestores/Admins podem executar a verificação de segurança.
        </p>
      </div>
    );
  }

  const criticals = (findings ?? []).filter((f) => f.severity === "critical");
  const warnings = (findings ?? []).filter((f) => f.severity !== "critical");
  const blocked = criticals.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-primary">Verificação de segurança</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Execute esta checagem antes de publicar. Enquanto houver itens críticos, a publicação deve
        ser bloqueada.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="hero" onClick={() => void run()} disabled={running}>
          {running ? "Verificando…" : "Executar verificação"}
        </Button>
        {ranAt && <span className="text-xs text-muted-foreground">Última execução: {ranAt}</span>}
      </div>

      {findings && (
        <div
          className={`mt-8 flex items-start gap-3 rounded-xl border p-5 ${
            blocked ? "border-destructive/50 bg-destructive/5" : "border-border"
          }`}
        >
          {blocked ? (
            <ShieldAlert className="mt-0.5 h-6 w-6 text-destructive" aria-hidden="true" />
          ) : (
            <ShieldCheck className="mt-0.5 h-6 w-6 text-accent" aria-hidden="true" />
          )}
          <div>
            <p className="font-semibold">
              {blocked
                ? `Publicação bloqueada — ${criticals.length} item(ns) crítico(s)`
                : "Nenhum item crítico: publicação liberada"}
            </p>
            <p className="text-sm text-muted-foreground">
              {warnings.length} aviso(s) para revisão.
            </p>
          </div>
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {(findings ?? []).map((f, i) => (
          <li
            key={`${f.check_name}-${i}`}
            className="flex items-start gap-3 rounded-lg border border-border p-4"
          >
            {f.severity === "critical" ? (
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
            ) : (
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
            <div>
              <p className="text-sm font-medium">{f.check_name}</p>
              <p className="text-sm text-muted-foreground">{f.detail}</p>
            </div>
          </li>
        ))}
        {findings?.length === 0 && (
          <li className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
            Nenhum achado. Backend em conformidade com as regras verificadas.
          </li>
        )}
      </ul>
    </div>
  );
}
