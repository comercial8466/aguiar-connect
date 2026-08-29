import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { PortalCta } from "@/components/site/PortalCta";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-aguiarti.png";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/site";
import { useAuth } from "@/hooks/useAuth";

const nav = [
  { to: "/servicos", label: "Serviços" },
  { to: "/planos", label: "Planos" },
  { to: "/portal", label: "Portal do Cliente" },
  { to: "/sobre", label: "Sobre" },
  { to: "/faq", label: "FAQ" },
  { to: "/contato", label: "Contato" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    void navigate({ to: "/auth", search: {}, replace: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <img src={logo} alt="Logo AguiarT.I" width={40} height={40} className="h-9 w-9" />
          <span className="font-display text-lg font-bold text-primary">
            Aguiar<span className="text-graphite">T.I</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-6 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {WHATSAPP_DISPLAY}
          </a>
          {session ? (
            <>
              <Button variant="outline" size="default" asChild>
                <Link to="/painel">Meu painel</Link>
              </Button>
              <Button variant="ghost" size="default" onClick={handleSignOut}>
                Sair
              </Button>
            </>
          ) : (
            <Button variant="outline" size="default" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
          )}
          <PortalCta variant="hero" size="default">Abrir Chamado Agora</PortalCta>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav aria-label="Principal mobile" className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {item.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link
                  to="/painel"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  Meu painel
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-md px-2 py-2.5 text-left text-sm font-medium text-foreground hover:bg-secondary"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/auth" search={{}}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Entrar
              </Link>
            )}
            <PortalCta variant="hero" className="mt-2" onNavigate={() => setOpen(false)}>
              Abrir Chamado Agora
            </PortalCta>
          </nav>
        </div>
      )}
    </header>
  );
}
