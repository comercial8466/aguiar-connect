CREATE OR REPLACE FUNCTION public.security_audit()
RETURNS TABLE (severity text, check_name text, detail text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT private.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas gestores podem executar a verificação de segurança';
  END IF;

  RETURN QUERY
  SELECT 'critical'::text, 'RLS desabilitada'::text,
         format('Tabela public.%s está sem proteção por linha', c.relname)
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity;

  RETURN QUERY
  SELECT 'critical'::text, 'Tabela sem políticas'::text,
         format('Tabela public.%s tem RLS ativa mas nenhuma política definida', c.relname)
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity
    AND NOT EXISTS (SELECT 1 FROM pg_policy p WHERE p.polrelid = c.oid);

  RETURN QUERY
  SELECT 'warning'::text, 'Acesso anônimo'::text,
         format('Tabela public.%s permite leitura por visitantes não autenticados', p.tablename)
  FROM pg_policies p
  WHERE p.schemaname = 'public' AND 'anon' = ANY (p.roles);

  RETURN QUERY
  SELECT 'warning'::text, 'Gestor sem 2FA'::text,
         format('%s conta(s) com papel administrativo sem autenticação em duas etapas', count(*)::text)
  FROM public.user_roles ur
  WHERE ur.role IN ('admin','tecnico')
    AND NOT EXISTS (
      SELECT 1 FROM auth.mfa_factors f
      WHERE f.user_id = ur.user_id AND f.status = 'verified'
    )
  HAVING count(*) > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.security_audit() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.security_audit() TO authenticated, service_role;