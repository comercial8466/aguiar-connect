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
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { whatsappLink, WHATSAPP_DISPLAY } from "@/lib/site";
import {
  collectErrors,
  friendlyAuthError,
  signInSchema,
  signUpSchema,
  type FieldErrors,
} from "@/lib/auth-schemas";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar no Portal — Acesso do Cliente | AguiarT.I" },
      {
        name: "description",
        content:
          "Acesse o portal AguiarT.I com e-mail e senha, conta Google ou direto pelo WhatsApp para acompanhar chamados e SLA.",
      },
      { property: "og:title", content: "Entrar no Portal | AguiarT.I" },
      {
        property: "og:description",
        content: "Login seguro do portal de suporte AguiarT.I com e-mail/senha, Google ou WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { next?: string; via?: "whatsapp" } => {
    const out: { next?: string; via?: "whatsapp" } = {};
    if (typeof search['next'] === "string" && search['next'].startsWith("/")) out.next = search['next'];
    if (search['via'] === "whatsapp") out.via = "whatsapp";
    return out;
  },
  component: AuthPage,
});

const SAFE_TARGETS = ["/painel", "/chamados", "/dashboard", "/seguranca-conta"] as const;

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const { next, via } = Route.useSearch();
  const target = next && (SAFE_TARGETS as readonly string[]).includes(next) ? next : "/painel";
  const { session, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState(via === "whatsapp" ? "criar" : "entrar");
  const [errors, setErrors] = useState<FieldErrors>({});

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!loading && session) {
      void navigate({ to: target as "/painel", replace: true });
    }
  }, [loading, session, navigate, target]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível entrar", { description: friendlyAuthError(error.message) });
      setErrors({ form: friendlyAuthError(error.message) });
      return;
    }
    void navigate({ to: target as "/painel", replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({
      fullName,
      company,
      phone,
      email,
      password,
      confirmPassword,
    });
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      toast.error("Revise os campos destacados para concluir o cadastro.");
      return;
    }
    setErrors({});
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(target)}`,
        data: {
          full_name: parsed.data.fullName,
          company: parsed.data.company,
          phone: parsed.data.phone,
        },
      },
    });
    setBusy(false);
    if (error) {
      const msg = friendlyAuthError(error.message);
      toast.error("Não foi possível criar a conta", { description: msg });
      setErrors({ form: msg });
      return;
    }
    if (!data.session) {
      toast.success("Confirme seu e-mail", {
        description: "Enviamos um link de confirmação. Depois de confirmar, você entra direto no portal.",
      });
      return;
    }
    toast.success("Conta criada! Bem-vindo ao portal.");
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
        subtitle="Crie sua conta em menos de 1 minuto e acompanhe seus chamados, status e SLA em tempo real."
      />
      <div className="mx-auto max-w-md px-4 py-16">
        {via === "whatsapp" && (
          <div className="mb-6 rounded-xl border border-accent/50 bg-accent/10 p-4 text-sm">
            <p className="font-semibold text-primary">Você veio pelo WhatsApp 💬</p>
            <p className="mt-1 text-muted-foreground">
              Finalize o cadastro rápido abaixo para abrir e acompanhar seus chamados no portal. Se
              preferir, continue a conversa com nosso atendente pelo {WHATSAPP_DISPLAY}.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-border p-6 shadow-card">
          <Button variant="heroOutline" className="w-full" onClick={handleGoogle} disabled={busy}>
            Continuar com Google
          </Button>

          <Button variant="whatsapp" className="mt-3 w-full" asChild>
            <a
              href={whatsappLink(
                "Olá! Quero criar meu acesso ao portal do cliente da AguiarT.I para abrir chamados.",
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon aria-hidden="true" /> Preciso de ajuda no WhatsApp
            </a>
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou use seu e-mail
            <span className="h-px flex-1 bg-border" />
          </div>

          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v);
              setErrors({});
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="entrar">Entrar</TabsTrigger>
              <TabsTrigger value="criar">Cadastro rápido</TabsTrigger>
            </TabsList>

            <TabsContent value="entrar">
              <form className="mt-4 space-y-4" onSubmit={handleSignIn} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email-in">E-mail</Label>
                  <Input
                    id="email-in"
                    type="email"
                    autoComplete="email"
                    aria-invalid={Boolean(errors['email'])}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <FieldError message={errors['email']} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha-in">Senha</Label>
                  <Input
                    id="senha-in"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors['password'])}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <FieldError message={errors['password']} />
                </div>
                <FieldError message={errors['form']} />
                <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                  {busy ? "Entrando…" : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="criar">
              <form className="mt-4 space-y-4" onSubmit={handleSignUp} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="nome-up">Nome completo *</Label>
                  <Input
                    id="nome-up"
                    autoComplete="name"
                    maxLength={100}
                    aria-invalid={Boolean(errors['fullName'])}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <FieldError message={errors['fullName']} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa-up">Empresa *</Label>
                  <Input
                    id="empresa-up"
                    autoComplete="organization"
                    maxLength={120}
                    placeholder="Nome da empresa ou 'Autônomo'"
                    aria-invalid={Boolean(errors['company'])}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                  <FieldError message={errors['company']} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fone-up">WhatsApp (opcional)</Label>
                  <Input
                    id="fone-up"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={20}
                    placeholder="(51) 99666-8646"
                    aria-invalid={Boolean(errors['phone'])}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <FieldError message={errors['phone']} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-up">E-mail *</Label>
                  <Input
                    id="email-up"
                    type="email"
                    autoComplete="email"
                    maxLength={255}
                    aria-invalid={Boolean(errors['email'])}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <FieldError message={errors['email']} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha-up">Senha *</Label>
                  <Input
                    id="senha-up"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors['password'])}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo de 8 caracteres, com letras e números.
                  </p>
                  <FieldError message={errors['password']} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha2-up">Confirmar senha *</Label>
                  <Input
                    id="senha2-up"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors['confirmPassword'])}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <FieldError message={errors['confirmPassword']} />
                </div>
                <FieldError message={errors['form']} />
                <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                  {busy ? "Criando conta…" : "Criar conta e abrir chamado"}
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
