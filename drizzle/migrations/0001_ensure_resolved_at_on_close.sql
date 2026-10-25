CREATE OR REPLACE FUNCTION private.set_ticket_resolved_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('resolvido','fechado') AND NEW.resolved_at IS NULL THEN
    NEW.resolved_at := now();
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION private.set_ticket_resolved_at() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS set_ticket_resolved_at ON public.tickets;
CREATE TRIGGER set_ticket_resolved_at BEFORE INSERT OR UPDATE ON public.tickets
FOR EACH ROW EXECUTE FUNCTION private.set_ticket_resolved_at();
ALTER TABLE public.tickets ADD CONSTRAINT tickets_closed_requires_resolved_at
  CHECK (status NOT IN ('resolvido','fechado') OR resolved_at IS NOT NULL);