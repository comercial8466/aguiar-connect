import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  children: React.ReactNode;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
  onNavigate?: () => void;
};

/**
 * CTA do Portal do Cliente: leva direto aos chamados quando há sessão ativa,
 * ou para login/cadastro rápido (retornando aos chamados depois) quando não há.
 */
export function PortalCta({ children, variant = "hero", size, className, onNavigate }: Props) {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  const go = () => {
    onNavigate?.();
    if (session) void navigate({ to: "/chamados" });
    else void navigate({ to: "/auth", search: { next: "/chamados" } });
  };

  const props = {
    variant,
    className,
    onClick: go,
    disabled: loading,
    ...(size ? { size } : {}),
  };

  return <Button {...props}>{children}</Button>;
}
