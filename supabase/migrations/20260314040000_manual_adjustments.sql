-- Add manual adjustments table
CREATE TYPE public.adjustment_type AS ENUM ('add_points', 'add_money', 'remove_points', 'remove_money');

CREATE TABLE IF NOT EXISTS public.manual_adjustments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  parent_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  type public.adjustment_type NOT NULL,
  points_amount integer DEFAULT 0,
  wallet_amount numeric(10,2) DEFAULT 0,
  reason text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.manual_adjustments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view adjustments for their family"
ON public.manual_adjustments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.family_id = manual_adjustments.family_id
  )
);

CREATE POLICY "Parents can insert adjustments for their family"
ON public.manual_adjustments FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'parent'
    AND p.family_id = manual_adjustments.family_id
  )
);

-- Function to handle adjustment and statistics
CREATE OR REPLACE FUNCTION public.handle_manual_adjustment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_stats record;
  _new_points integer;
  _new_wallet numeric;
  _title text;
  _body text;
BEGIN
  -- Get current stats
  SELECT current_points, wallet_balance, total_points_earned
  INTO _current_stats
  FROM public.child_stats
  WHERE child_id = NEW.child_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Child stats not found';
  END IF;

  -- Calculate new values
  _new_points := _current_stats.current_points;
  _new_wallet := _current_stats.wallet_balance;

  CASE NEW.type
    WHEN 'add_points' THEN
      _new_points := _new_points + NEW.points_amount;
      _title := 'Bonus ! 🌟';
      _body := 'Tu as reçu un bonus de ' || NEW.points_amount || ' points. (' || NEW.reason || ')';
      
      -- Add to total earned points too (safe check)
      UPDATE public.child_stats SET total_points_earned = _current_stats.total_points_earned + NEW.points_amount WHERE child_id = NEW.child_id;
    WHEN 'remove_points' THEN
      _new_points := GREATEST(0, _new_points - NEW.points_amount);
      _title := 'Ajustement 📉';
      _body := 'Tes points ont été ajustés : -' || NEW.points_amount || ' points. (' || NEW.reason || ')';
    WHEN 'add_money' THEN
      _new_wallet := _new_wallet + NEW.wallet_amount;
      _title := 'Argent de poche ! 💶';
      _body := 'Ton portefeuille a été crédité de ' || NEW.wallet_amount || '€. (' || NEW.reason || ')';
    WHEN 'remove_money' THEN
      _new_wallet := GREATEST(0, _new_wallet - NEW.wallet_amount);
      _title := 'Ajustement 📉';
      _body := 'Ton portefeuille a été débité de ' || NEW.wallet_amount || '€. (' || NEW.reason || ')';
  END CASE;

  -- Update child stats
  UPDATE public.child_stats
  SET 
    current_points = _new_points,
    wallet_balance = _new_wallet
  WHERE child_id = NEW.child_id;

  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, body, metadata)
  VALUES (
    NEW.child_id,
    'bonus',
    _title,
    _body,
    jsonb_build_object('adjustment_id', NEW.id, 'reason', NEW.reason, 'type', NEW.type)
  );

  RETURN NEW;
END;
$$;

-- Trigger for manual adjustment execution
CREATE TRIGGER on_manual_adjustment
  AFTER INSERT ON public.manual_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_manual_adjustment();
