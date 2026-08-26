CREATE OR REPLACE FUNCTION private.can_access_ticket(_ticket_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.is_staff(auth.uid())
     OR EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = _ticket_id AND t.user_id = auth.uid())
$$;
REVOKE ALL ON FUNCTION private.can_access_ticket(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION private.can_access_ticket(uuid) TO authenticated, service_role;

CREATE POLICY "Ticket members read attachments" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'ticket-attachments'
    AND (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
    AND private.can_access_ticket(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "Ticket members upload attachments" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'ticket-attachments'
    AND (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
    AND private.can_access_ticket(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "Staff delete attachments objects" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'ticket-attachments' AND private.is_staff(auth.uid())
  );