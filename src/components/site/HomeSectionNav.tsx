import { useEffect, useState } from "react";

const sections = [
  { id: "servicos", label: "Serviços" },
  { id: "portal", label: "Portal" },
  { id: "diferenciais", label: "Diferenciais" },
  { id: "recursos", label: "Recursos" },
  { id: "fale-conosco", label: "Contato" },
];

export function HomeSectionNav() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = sections.map(({ id }) => document.getElementById(id)).filter((element): element is HTMLElement => Boolean(element));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: "-120px 0px -45% 0px" });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Seções da página inicial" className="sticky top-16 z-30 border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-2 px-6 sm:gap-x-6">
        {sections.map(({ id, label }) => (
          <a key={id} href={`#${id}`} onClick={() => setActive(id)} aria-current={active === id ? "location" : undefined}
            className={`inline-flex min-h-11 items-center border-b-2 px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-primary"}`}>
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}