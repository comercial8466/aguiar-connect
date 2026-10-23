CREATE TABLE public.powerbi_feed_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL DEFAULT 'Power BI',
  token text NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(24), 'hex'),
  active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.powerbi_feed_tokens TO authenticated;
GRANT ALL ON public.powerbi_feed_tokens TO service_role;
ALTER TABLE public.powerbi_feed_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage powerbi tokens" ON public.powerbi_feed_tokens FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_powerbi_feed_tokens_updated_at BEFORE UPDATE ON public.powerbi_feed_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();