import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /dashboard é um atalho protegido para a área de chamados.
 * O gate do layout `_authenticated` já bloqueia acessos não autenticados
 * e envia o visitante para /auth?next=/dashboard.
 */
export const Route = createFileRoute("/_authenticated/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/chamados", replace: true });
  },
  component: () => null,
});
