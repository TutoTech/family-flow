CREATE TABLE public.activation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'family',
  is_used boolean NOT NULL DEFAULT false,
  used_by_user_id uuid,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- Only allow reading via edge function (service role). No direct client access.
CREATE POLICY "No direct access to activation codes"
  ON public.activation_codes
  FOR ALL
  TO authenticated
  USING (false);