CREATE OR REPLACE FUNCTION private.set_ticket_resolved_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('resolvido','fechado') THEN
    -- Staying closed (e.g. resolvido -> fechado): preserve the original resolution date
    IF TG_OP = 'UPDATE' AND OLD.status IN ('resolvido','fechado') AND OLD.resolved_at IS NOT NULL THEN
      NEW.resolved_at := OLD.resolved_at;
    ELSIF NEW.resolved_at IS NULL THEN
      NEW.resolved_at := now();
    END IF;
  ELSE
    -- Reopened or open: no resolution date (previous value stays in audit_logs)
    NEW.resolved_at := NULL;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION private.set_ticket_resolved_at() FROM PUBLIC, anon, authenticated;

ALTER TABLE public.tickets ADD CONSTRAINT tickets_open_has_no_resolved_at
  CHECK (status IN ('resolvido','fechado') OR resolved_at IS NULL) NOT VALID;
ALTER TABLE public.tickets ADD CONSTRAINT tickets_resolved_after_created
  CHECK (resolved_at IS NULL OR resolved_at >= created_at) NOT VALID;