
DROP POLICY "Children can request redemptions" ON public.reward_redemptions;
CREATE POLICY "Children or parents can request redemptions"
  ON public.reward_redemptions FOR INSERT
  WITH CHECK (
    (child_id = auth.uid())
    OR
    (has_role(auth.uid(), 'parent') AND EXISTS (
      SELECT 1 FROM rewards r WHERE r.id = reward_redemptions.reward_id AND r.family_id = get_user_family_id(auth.uid())
    ))
  );
