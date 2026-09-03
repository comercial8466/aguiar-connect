ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS satisfaction_rating smallint,
  ADD COLUMN IF NOT EXISTS satisfaction_comment text,
  ADD COLUMN IF NOT EXISTS satisfaction_at timestamptz;

ALTER TABLE public.tickets
  DROP CONSTRAINT IF EXISTS tickets_satisfaction_rating_check;
ALTER TABLE public.tickets
  ADD CONSTRAINT tickets_satisfaction_rating_check
  CHECK (satisfaction_rating IS NULL OR satisfaction_rating BETWEEN 1 AND 5);

DROP POLICY IF EXISTS "Owners rate own tickets" ON public.tickets;
CREATE POLICY "Owners rate own tickets"
ON public.tickets
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'tarciso@aguiarti.com.br'
ON CONFLICT (user_id, role) DO NOTHING;