
-- Allow parents to create savings goals for children in their family
DROP POLICY "Children can create own goals" ON public.savings_goals;
CREATE POLICY "Children or parents can create goals"
  ON public.savings_goals FOR INSERT
  WITH CHECK (
    (child_id = auth.uid() AND family_id = get_user_family_id(auth.uid()))
    OR
    (has_role(auth.uid(), 'parent') AND family_id = get_user_family_id(auth.uid()))
  );
