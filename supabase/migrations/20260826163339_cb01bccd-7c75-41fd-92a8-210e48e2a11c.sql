-- ENUMS
CREATE TYPE public.ticket_status AS ENUM ('aberto','em_andamento','aguardando_cliente','resolvido','fechado');
CREATE TYPE public.ticket_priority AS ENUM ('baixa','media','alta','critica');

-- HELPERS
CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('tecnico','admin'))
$$;
REVOKE ALL ON FUNCTION private.is_staff(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO authenticated, service_role;

-- TICKETS
CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  company text,
  status public.ticket_status NOT NULL DEFAULT 'aberto',
  priority public.ticket_priority NOT NULL DEFAULT 'media',
  sla_due_at timestamptz,
  first_response_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.tickets TO authenticated;
GRANT ALL ON public.tickets TO service_role;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own tickets" ON public.tickets
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Staff view all tickets" ON public.tickets
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Users create own tickets" ON public.tickets
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Staff update tickets" ON public.tickets
  FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

-- Clientes não podem alterar campos sensíveis (status, SLA, responsável)
CREATE OR REPLACE FUNCTION public.guard_ticket_update()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT private.is_staff(auth.uid()) THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.sla_due_at IS DISTINCT FROM OLD.sla_due_at
       OR NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
       OR NEW.priority IS DISTINCT FROM OLD.priority
       OR NEW.first_response_at IS DISTINCT FROM OLD.first_response_at
       OR NEW.resolved_at IS DISTINCT FROM OLD.resolved_at THEN
      RAISE EXCEPTION 'Somente técnicos e gestores podem alterar status, prioridade, SLA ou responsável';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER guard_ticket_update BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.guard_ticket_update();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SLA padrão conforme prioridade
CREATE OR REPLACE FUNCTION public.set_ticket_sla()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.sla_due_at IS NULL THEN
    NEW.sla_due_at := now() + CASE NEW.priority
      WHEN 'critica' THEN interval '2 hours'
      WHEN 'alta' THEN interval '4 hours'
      WHEN 'media' THEN interval '8 hours'
      ELSE interval '24 hours' END;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER set_ticket_sla BEFORE INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_ticket_sla();

-- COMENTÁRIOS
CREATE TABLE public.ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ticket_comments TO authenticated;
GRANT ALL ON public.ticket_comments TO service_role;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read public comments" ON public.ticket_comments
  FOR SELECT TO authenticated USING (
    internal = false AND EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
  );
CREATE POLICY "Staff read all comments" ON public.ticket_comments
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Participants add comments" ON public.ticket_comments
  FOR INSERT TO authenticated WITH CHECK (
    author_id = auth.uid()
    AND (internal = false OR private.is_staff(auth.uid()))
    AND (private.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid()))
  );

-- ANEXOS
CREATE TABLE public.ticket_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attachment_size_limit CHECK (size_bytes > 0 AND size_bytes <= 10485760),
  CONSTRAINT attachment_mime_allowed CHECK (mime_type IN (
    'image/png','image/jpeg','image/webp','image/gif','application/pdf','text/plain','text/csv','application/zip'
  ))
);
GRANT SELECT, INSERT, DELETE ON public.ticket_attachments TO authenticated;
GRANT ALL ON public.ticket_attachments TO service_role;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read own attachments" ON public.ticket_attachments
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
  );
CREATE POLICY "Staff read all attachments" ON public.ticket_attachments
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Participants upload attachments" ON public.ticket_attachments
  FOR INSERT TO authenticated WITH CHECK (
    uploaded_by = auth.uid()
    AND (private.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid()))
  );
CREATE POLICY "Staff delete attachments" ON public.ticket_attachments
  FOR DELETE TO authenticated USING (private.is_staff(auth.uid()));

-- AUDITORIA
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.write_audit_log()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_entity_id uuid;
BEGIN
  v_entity_id := COALESCE((to_jsonb(NEW) ->> 'id')::uuid, (to_jsonb(OLD) ->> 'id')::uuid);
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, old_data, new_data)
  VALUES (
    auth.uid(),
    lower(TG_OP),
    TG_TABLE_NAME,
    v_entity_id,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;
REVOKE ALL ON FUNCTION public.write_audit_log() FROM public, anon, authenticated;

CREATE TRIGGER audit_tickets AFTER INSERT OR UPDATE OR DELETE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER audit_user_roles AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER audit_ticket_attachments AFTER INSERT OR DELETE ON public.ticket_attachments
  FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();