export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="bg-hero-gradient text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-primary-foreground/80">{subtitle}</p>}
      </div>
    </section>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-16 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc">
      {children}
    </div>
  );
}
