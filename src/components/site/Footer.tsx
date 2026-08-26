import { Link } from "@tanstack/react-router";
import { Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo-aguiarti.png";
import { SITE_CITY, SITE_EMAIL, WHATSAPP_DISPLAY, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="Logo AguiarT.I"
              width={36}
              height={36}
              loading="lazy"
              className="h-9 w-9 rounded bg-primary-foreground p-0.5"
            />
            <span className="font-display text-lg font-bold">AguiarT.I</span>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/75">
            Automação comercial e suporte técnico remoto com SLA garantido e acompanhamento por
            dashboard.
          </p>
        </div>

        <nav aria-label="Serviços">
          <h2 className="text-sm font-semibold">Serviços</h2>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
            <li>
              <Link to="/servicos/automacao-comercial" className="hover:text-accent">
                Automação Comercial
              </Link>
            </li>
            <li>
              <Link to="/servicos/suporte-remoto" className="hover:text-accent">
                Suporte Técnico Remoto
              </Link>
            </li>
            <li>
              <Link to="/servicos/consultoria" className="hover:text-accent">
                Consultoria e Treinamento
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Institucional">
          <h2 className="text-sm font-semibold">Institucional</h2>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
            <li>
              <Link to="/sobre" className="hover:text-accent">
                Sobre e Time
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-accent">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/privacidade" className="hover:text-accent">
                Política de Privacidade (LGPD)
              </Link>
            </li>
            <li>
              <Link to="/termos" className="hover:text-accent">
                Termos de Uso
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold">Contato</h2>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-accent"
              >
                <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
                {WHATSAPP_DISPLAY}
              </a>
            </li>
            <li className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" aria-hidden="true" />
              {SITE_EMAIL}
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {SITE_CITY}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15 py-5 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} AguiarT.I — Automação Comercial e Suporte Técnico Remoto.
      </div>
    </footer>
  );
}
