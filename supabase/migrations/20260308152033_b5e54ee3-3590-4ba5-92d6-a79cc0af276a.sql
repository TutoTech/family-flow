
CREATE TABLE public.savings_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid NOT NULL,
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  title text NOT NULL,
  icon text DEFAULT '🎯',
  target_amount numeric NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- Family members can view goals
CREATE POLICY "Family can view savings goals"
  ON public.savings_goals FOR SELECT
  USING (family_id = get_user_family_id(auth.uid()));

-- Children can create their own goals
CREATE POLICY "Children can create own goals"
  ON public.savings_goals FOR INSERT
  WITH CHECK (child_id = auth.uid() AND family_id = get_user_family_id(auth.uid()));

-- Children can update their own goals, parents can update family goals
CREATE POLICY "Owner or parent can update goals"
  ON public.savings_goals FOR UPDATE
  USING (
    (child_id = auth.uid()) OR
    (has_role(auth.uid(), 'parent') AND family_id = get_user_family_id(auth.uid()))
  );

-- Children can delete their own goals, parents can delete family goals
CREATE POLICY "Owner or parent can delete goals"
  ON public.savings_goals FOR DELETE
  USING (
    (child_id = auth.uid()) OR
    (has_role(auth.uid(), 'parent') AND family_id = get_user_family_id(auth.uid()))
  );

-- Auto-update updated_at
CREATE TRIGGER update_savings_goals_updated_at
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
