CREATE POLICY "Staff can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (private.is_staff(auth.uid()));