import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Redefinir senha | AguiarT.I" },
      { name: "description", content: "Crie uma nova senha para acessar o portal AguiarT.I." },
      { property: "og:title", content: "Redefinir senha | AguiarT.I" },
      { property: "og:description", content: "Crie uma nova senha para o portal de suporte AguiarT.I." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError("Mínimo de 8 caracteres, com letras e números.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }
    setError("");
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError("Link inválido ou expirado. Peça um novo em 'Esqueci minha senha'.");
      return;
    }
    toast.success("Senha alterada! Você já está no portal.");
    void navigate({ to: "/painel", replace: true });
  };

  return (
    <>
      <PageHero title="Redefinir senha" subtitle="Crie uma nova senha para acessar o portal." />
      <div className="mx-auto max-w-md px-4 py-16">
        <form onSubmit={submit} noValidate className="space-y-4 rounded-2xl border border-border p-6 shadow-card">
          <div className="space-y-2">
            <Label htmlFor="nova-senha">Nova senha</Label>
            <Input id="nova-senha" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nova-senha2">Confirmar nova senha</Label>
            <Input id="nova-senha2" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {error && <p role="alert" className="text-xs font-medium text-destructive">{error}</p>}
          <Button type="submit" variant="hero" className="w-full" disabled={busy}>
            {busy ? "Salvando…" : "Salvar nova senha"}
          </Button>
        </form>
      </div>
    </>
  );
}
