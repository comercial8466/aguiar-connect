import { useEffect, useRef } from "react";

/**
 * Revela elementos com [data-reveal] dentro do container conforme o scroll,
 * usando GSAP + ScrollTrigger (carregado apenas no browser).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const targets = Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]"));
      const ctx = gsap.context(() => {
        targets.forEach((target) => {
          gsap.from(target, {
            opacity: 0,
            y: 32,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: target, start: "top 88%", once: true },
          });
        });
      }, el);

      cleanup = () => {
        ctx.revert();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return ref;
}
