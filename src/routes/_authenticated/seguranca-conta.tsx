import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/seguranca-conta")({
  head: () => ({
    meta: [
      { title: "Autenticação em Duas Etapas (2FA) | AguiarT.I" },
      {
        name: "description",
        content:
          "Ative a verificação em duas etapas por aplicativo autenticador na sua conta do portal AguiarT.I.",
      },
      { property: "og:title", content: "Autenticação em Duas Etapas | AguiarT.I" },
      { property: "og:description", content: "Proteja sua conta do portal com 2FA por app autenticador." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContaSeguranca,
});

type Factor = { id: string; status: string; friendly_name?: string | undefined };

function ContaSeguranca() {
  const { hasAnyRole } = useAuth();
  const required = hasAnyRole(["tecnico", "admin"]);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrolling, setEnrolling] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      toast.error("Falha ao carregar fatores", { description: error.message });
      return;
    }
    setFactors((data?.totp ?? []) as Factor[]);
  };

  useEffect(() => {
    void load();
  }, []);

  const startEnroll = async () => {
    setBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `AguiarT.I ${new Date().toLocaleDateString("pt-BR")}`,
    });
    setBusy(false);
    if (error || !data) {
      toast.error("Não foi possível iniciar o cadastro do 2FA", { description: error?.message });
      return;
    }
    setEnrolling({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrolling) return;
    setBusy(true);
    const challenge = await supabase.auth.mfa.challenge({ factorId: enrolling.id });
    if (challenge.error || !challenge.data) {
      setBusy(false);
      toast.error("Falha no desafio 2FA", { description: challenge.error?.message });
      return;
    }
    const verify = await supabase.auth.mfa.verify({
      factorId: enrolling.id,
      challengeId: challenge.data.id,
      code: code.trim(),
    });
    setBusy(false);
    if (verify.error) {
      toast.error("Código inválido", { description: verify.error.message });
      return;
    }
    toast.success("2FA ativado com sucesso");
    setEnrolling(null);
    setCode("");
    void load();
  };

  const remove = async (factorId: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      toast.error("Não foi possível remover o fator", { description: error.message });
      return;
    }
    toast.success("Fator removido");
    void load();
  };

  const verified = factors.filter((f) => f.status === "verified");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-primary">Autenticação em duas etapas</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Use um aplicativo autenticador (Google Authenticator, Authy, 1Password) para proteger sua
        conta.{" "}
        {required
          ? "Como Técnico ou Gestor/Admin, o 2FA é obrigatório na sua conta."
          : "Recomendado para todas as contas do portal."}
      </p>

      {required && verified.length === 0 && (
        <p className="mt-4 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm">
          Sua conta tem acesso privilegiado e ainda está sem 2FA. Ative agora.
        </p>
      )}

      <section className="mt-8 rounded-xl border border-border p-6 shadow-card">
        <h2 className="font-semibold">Fatores cadastrados</h2>
        <ul className="mt-3 space-y-2">
          {factors.length === 0 && (
            <li className="text-sm text-muted-foreground">Nenhum fator cadastrado.</li>
          )}
          {factors.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <span className="flex items-center gap-2 text-sm">
                {f.friendly_name ?? "Aplicativo autenticador"}
                <Badge variant={f.status === "verified" ? "default" : "secondary"}>
                  {f.status === "verified" ? "Ativo" : "Pendente"}
                </Badge>
              </span>
              <Button variant="outline" size="sm" onClick={() => void remove(f.id)}>
                Remover
              </Button>
            </li>
          ))}
        </ul>

        {!enrolling ? (
          <Button variant="hero" className="mt-5" onClick={() => void startEnroll()} disabled={busy}>
            Adicionar aplicativo autenticador
          </Button>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={confirm}>
            <img
              src={enrolling.qr}
              alt="QR Code para configurar a autenticação em duas etapas"
              className="h-48 w-48 rounded-lg border border-border bg-white p-2"
            />
            <p className="text-xs text-muted-foreground">
              Não consegue ler o QR? Use a chave: <code className="font-mono">{enrolling.secret}</code>
            </p>
            <div className="space-y-2">
              <Label htmlFor="mfa-code">Código de 6 dígitos</Label>
              <Input
                id="mfa-code"
                inputMode="numeric"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="hero" disabled={busy}>
                Confirmar e ativar
              </Button>
              <Button type="button" variant="outline" onClick={() => setEnrolling(null)}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
