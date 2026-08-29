import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar no Portal — Acesso do Cliente | AguiarT.I" },
      {
        name: "description",
        content:
          "Acesse o portal AguiarT.I com e-mail e senha ou conta Google para acompanhar chamados, SLA e indicadores.",
      },
      { property: "og:title", content: "Entrar no Portal | AguiarT.I" },
      {
        property: "og:description",
        content: "Login seguro do portal de suporte AguiarT.I com e-mail/senha ou Google.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search['next'] === "string" && search['next'].startsWith("/") ? search['next'] : "",
  }),
  component: AuthPage,
});

const SAFE_TARGETS = ["/painel", "/chamados", "/seguranca-conta"] as const;

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const target = (SAFE_TARGETS as readonly string[]).includes(next) ? next : "/painel";
  const { session, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");

  useEffect(() => {
    if (!loading && session) {
      void navigate({ to: target as "/painel", replace: true });
    }
  }, [loading, session, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível entrar", { description: error.message });
      return;
    }
    void navigate({ to: target as "/painel", replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName, company },
      },
    });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível criar a conta", { description: error.message });
      return;
    }
    if (!data.session) {
      toast.success("Confirme seu e-mail", {
        description: "Enviamos um link de confirmação para concluir o cadastro.",
      });
      return;
    }
    void navigate({ to: target as "/painel", replace: true });
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth?next=${encodeURIComponent(target)}`,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Falha no login com Google", { description: String(result.error) });
      return;
    }
    if (result.redirected) return;
    void navigate({ to: target as "/painel", replace: true });
  };

  return (
    <>
      <PageHero
        title="Portal do Cliente"
        subtitle="Entre com e-mail e senha ou com sua conta Google para acompanhar seus chamados."
      />
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-border p-6 shadow-card">
          <Button variant="heroOutline" className="w-full" onClick={handleGoogle} disabled={busy}>
            Continuar com Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou use seu e-mail
            <span className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="entrar">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="entrar">Entrar</TabsTrigger>
              <TabsTrigger value="criar">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="entrar">
              <form className="mt-4 space-y-4" onSubmit={handleSignIn}>
                <div className="space-y-2">
                  <Label htmlFor="email-in">E-mail</Label>
                  <Input
                    id="email-in"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha-in">Senha</Label>
                  <Input
                    id="senha-in"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="criar">
              <form className="mt-4 space-y-4" onSubmit={handleSignUp}>
                <div className="space-y-2">
                  <Label htmlFor="nome-up">Nome completo</Label>
                  <Input
                    id="nome-up"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa-up">Empresa (opcional)</Label>
                  <Input id="empresa-up" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-up">E-mail</Label>
                  <Input
                    id="email-up"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha-up">Senha</Label>
                  <Input
                    id="senha-up"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                  Criar conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-xs text-muted-foreground">
            Novas contas entram como <strong>Cliente</strong>. Papéis de Empresa, Técnico e
            Gestor/Admin são atribuídos pela equipe AguiarT.I.
          </p>
        </div>
      </div>
    </>
  );
}
