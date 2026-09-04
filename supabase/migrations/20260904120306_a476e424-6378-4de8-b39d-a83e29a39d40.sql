-- Helper: empresa do usuário logado
CREATE OR REPLACE FUNCTION private.user_company(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company FROM public.profiles WHERE id = _user_id
$$;

-- Contratos de SLA por empresa
CREATE TABLE public.company_sla_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL UNIQUE,
  plan_name text NOT NULL DEFAULT 'Padrão',
  critica_hours integer NOT NULL DEFAULT 2,
  alta_hours integer NOT NULL DEFAULT 4,
  media_hours integer NOT NULL DEFAULT 8,
  baixa_hours integer NOT NULL DEFAULT 24,
  contract_start date,
  contract_end date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_sla_contracts TO authenticated;
GRANT ALL ON public.company_sla_contracts TO service_role;
ALTER TABLE public.company_sla_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage contracts" ON public.company_sla_contracts
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff read contracts" ON public.company_sla_contracts
  FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

CREATE POLICY "Company reads own contract" ON public.company_sla_contracts
  FOR SELECT TO authenticated
  USING (company IS NOT DISTINCT FROM private.user_company(auth.uid()));

CREATE TRIGGER update_company_sla_contracts_updated_at
  BEFORE UPDATE ON public.company_sla_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Convites de usuários da empresa
CREATE TABLE public.company_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  email text NOT NULL,
  full_name text,
  role app_role NOT NULL DEFAULT 'cliente',
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','aceito','cancelado')),
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company, email)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_invites TO authenticated;
GRANT ALL ON public.company_invites TO service_role;
ALTER TABLE public.company_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage invites" ON public.company_invites
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Company reads own invites" ON public.company_invites
  FOR SELECT TO authenticated
  USING (company IS NOT DISTINCT FROM private.user_company(auth.uid()));

CREATE POLICY "Company creates own invites" ON public.company_invites
  FOR INSERT TO authenticated
  WITH CHECK (
    invited_by = auth.uid()
    AND company IS NOT DISTINCT FROM private.user_company(auth.uid())
    AND role IN ('cliente','empresa')
  );

CREATE POLICY "Company updates own invites" ON public.company_invites
  FOR UPDATE TO authenticated
  USING (company IS NOT DISTINCT FROM private.user_company(auth.uid()))
  WITH CHECK (company IS NOT DISTINCT FROM private.user_company(auth.uid()));

CREATE TRIGGER update_company_invites_updated_at
  BEFORE UPDATE ON public.company_invites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SLA por tipo de chamado
CREATE TABLE public.category_sla (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL UNIQUE,
  default_priority ticket_priority NOT NULL DEFAULT 'media',
  response_hours integer NOT NULL DEFAULT 8,
  resolution_hours integer NOT NULL DEFAULT 24,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.category_sla TO authenticated;
GRANT ALL ON public.category_sla TO service_role;
ALTER TABLE public.category_sla ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read category sla" ON public.category_sla
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage category sla" ON public.category_sla
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_category_sla_updated_at
  BEFORE UPDATE ON public.category_sla
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.category_sla (category, default_priority, response_hours, resolution_hours) VALUES
  ('PDV / Frente de caixa', 'critica', 2, 4),
  ('ERP / Retaguarda', 'media', 8, 24),
  ('Fiscal (NFC-e, SAT, NF-e)', 'alta', 4, 8),
  ('Rede e internet', 'alta', 4, 12),
  ('Computador / Impressora', 'media', 8, 24),
  ('Outros', 'baixa', 24, 48);