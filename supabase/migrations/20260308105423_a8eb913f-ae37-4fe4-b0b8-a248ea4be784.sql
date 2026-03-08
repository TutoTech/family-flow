
-- Tighten the insert policy - only allow inserts where user_id matches (for security definer functions this is bypassed anyway)
DROP POLICY "System can insert notifications" ON public.notifications;

-- No direct insert policy needed since triggers use SECURITY DEFINER
-- Add a restrictive policy that prevents direct user inserts
CREATE POLICY "No direct inserts"
  ON public.notifications FOR INSERT
  WITH CHECK (false);
