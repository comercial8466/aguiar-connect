CREATE OR REPLACE FUNCTION private.prevent_self_admin_removal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.role = 'admin' AND OLD.user_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode remover seu próprio acesso de Gestor/Admin';
  END IF;
  IF TG_OP = 'UPDATE' THEN RETURN NEW; END IF;
  RETURN OLD;
END $$;
REVOKE EXECUTE ON FUNCTION private.prevent_self_admin_removal() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS prevent_self_admin_removal ON public.user_roles;
CREATE TRIGGER prevent_self_admin_removal BEFORE DELETE OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION private.prevent_self_admin_removal();