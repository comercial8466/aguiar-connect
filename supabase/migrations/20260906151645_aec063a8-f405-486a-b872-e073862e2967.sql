CREATE OR REPLACE FUNCTION public.set_ticket_sla()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_company text;
  v_hours integer;
BEGIN
  v_company := NULLIF(btrim(COALESCE(NEW.company, '')), '');
  IF v_company IS NULL THEN
    SELECT NULLIF(btrim(COALESCE(company, '')), '') INTO v_company
    FROM public.profiles WHERE id = NEW.user_id;
    NEW.company := COALESCE(NEW.company, v_company);
  END IF;

  IF NEW.sla_due_at IS NULL THEN
    IF v_company IS NOT NULL THEN
      SELECT CASE NEW.priority
               WHEN 'critica' THEN c.critica_hours
               WHEN 'alta' THEN c.alta_hours
               WHEN 'media' THEN c.media_hours
               ELSE c.baixa_hours
             END
        INTO v_hours
      FROM public.company_sla_contracts c
      WHERE c.company = v_company;
    END IF;

    IF v_hours IS NULL THEN
      v_hours := CASE NEW.priority
        WHEN 'critica' THEN 2
        WHEN 'alta' THEN 4
        WHEN 'media' THEN 8
        ELSE 24 END;
    END IF;

    NEW.sla_due_at := now() + make_interval(hours => v_hours);
  END IF;

  RETURN NEW;
END;
$function$;