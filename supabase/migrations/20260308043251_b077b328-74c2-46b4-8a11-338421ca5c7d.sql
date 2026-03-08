
-- =============================================
-- STOP REPEAT - Modèle de données complet
-- =============================================

-- 1. Enums
CREATE TYPE public.app_role AS ENUM ('parent', 'child');
CREATE TYPE public.task_status AS ENUM ('pending', 'done', 'late', 'awaiting_validation', 'validated', 'rejected');
CREATE TYPE public.recurrence_type AS ENUM ('daily', 'weekly', 'weekdays', 'weekends', 'custom');
CREATE TYPE public.redemption_status AS ENUM ('requested', 'approved', 'rejected', 'delivered');

-- 2. Families
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  pin_code_hash TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. User Roles (separate table)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 5. Security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_family_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT family_id FROM public.profiles WHERE user_id = _user_id
$$;

-- 6. Device tokens
CREATE TABLE public.device_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  push_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Child stats
CREATE TABLE public.child_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_points INTEGER NOT NULL DEFAULT 0,
  wallet_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  daily_penalties INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Task templates
CREATE TABLE public.task_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  assigned_to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  recurrence_type recurrence_type NOT NULL DEFAULT 'daily',
  recurrence_config JSONB DEFAULT '{}',
  due_time TIME NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 1,
  requires_photo BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Task instances
CREATE TABLE public.task_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_template_id UUID NOT NULL REFERENCES public.task_templates(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  assigned_to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_for_date DATE NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  status task_status NOT NULL DEFAULT 'pending',
  validated_by_user_id UUID REFERENCES auth.users(id),
  validated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Task evidence photos
CREATE TABLE public.task_evidence_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_instance_id UUID NOT NULL REFERENCES public.task_instances(id) ON DELETE CASCADE,
  uploaded_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  storage_key TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- 11. House rules
CREATE TABLE public.house_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  points_penalty INTEGER NOT NULL DEFAULT 0,
  wallet_penalty NUMERIC(10,2) NOT NULL DEFAULT 0,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Penalties log
CREATE TABLE public.penalties_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES public.house_rules(id) ON DELETE CASCADE,
  logged_by_parent_id UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Rewards
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cost_points INTEGER NOT NULL,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Reward redemptions
CREATE TABLE public.reward_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved_by_parent_id UUID REFERENCES auth.users(id),
  status redemption_status NOT NULL DEFAULT 'requested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Family settings
CREATE TABLE public.family_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL UNIQUE REFERENCES public.families(id) ON DELETE CASCADE,
  penalty_threshold_per_day INTEGER NOT NULL DEFAULT 3,
  points_to_money_rate NUMERIC(10,4) NOT NULL DEFAULT 0.10,
  streak_bonus_percent INTEGER NOT NULL DEFAULT 10,
  photo_retention_days INTEGER NOT NULL DEFAULT 30,
  tts_delay_minutes INTEGER NOT NULL DEFAULT 5,
  parent_alert_delay_minutes INTEGER NOT NULL DEFAULT 15,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Quotes
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  author TEXT,
  category TEXT,
  language TEXT NOT NULL DEFAULT 'fr',
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- =============================================
-- RLS
-- =============================================
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_evidence_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penalties_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Families
CREATE POLICY "Users can view their family" ON public.families FOR SELECT USING (id = public.get_user_family_id(auth.uid()));
CREATE POLICY "Parents can update their family" ON public.families FOR UPDATE USING (id = public.get_user_family_id(auth.uid()) AND public.has_role(auth.uid(), 'parent'));
CREATE POLICY "Authenticated can create a family" ON public.families FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Profiles
CREATE POLICY "Users can view family profiles" ON public.profiles FOR SELECT USING (family_id = public.get_user_family_id(auth.uid()) OR user_id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- User roles
CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own role" ON public.user_roles FOR INSERT WITH CHECK (user_id = auth.uid());

-- Device tokens
CREATE POLICY "Users manage own tokens" ON public.device_tokens FOR ALL USING (user_id = auth.uid());

-- Child stats
CREATE POLICY "Family can view child stats" ON public.child_stats FOR SELECT USING (child_id = auth.uid() OR public.get_user_family_id(child_id) = public.get_user_family_id(auth.uid()));
CREATE POLICY "Parents can update child stats" ON public.child_stats FOR UPDATE USING (public.has_role(auth.uid(), 'parent') AND public.get_user_family_id(child_id) = public.get_user_family_id(auth.uid()));
CREATE POLICY "Users can insert own child stats" ON public.child_stats FOR INSERT WITH CHECK (child_id = auth.uid());

-- Task templates
CREATE POLICY "Family can view task templates" ON public.task_templates FOR SELECT USING (family_id = public.get_user_family_id(auth.uid()));
CREATE POLICY "Parents can insert task templates" ON public.task_templates FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'parent') AND family_id = public.get_user_family_id(auth.uid()));
CREATE POLICY "Parents can update task templates" ON public.task_templates FOR UPDATE USING (public.has_role(auth.uid(), 'parent') AND family_id = public.get_user_family_id(auth.uid()));
CREATE POLICY "Parents can delete task templates" ON public.task_templates FOR DELETE USING (public.has_role(auth.uid(), 'parent') AND family_id = public.get_user_family_id(auth.uid()));

-- Task instances
CREATE POLICY "Family can view task instances" ON public.task_instances FOR SELECT USING (family_id = public.get_user_family_id(auth.uid()));
CREATE POLICY "Assigned or parent can update task instances" ON public.task_instances FOR UPDATE USING (assigned_to_user_id = auth.uid() OR (public.has_role(auth.uid(), 'parent') AND family_id = public.get_user_family_id(auth.uid())));
CREATE POLICY "Parents can insert task instances" ON public.task_instances FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'parent') AND family_id = public.get_user_family_id(auth.uid()));

-- Evidence photos
CREATE POLICY "Family can view evidence" ON public.task_evidence_photos FOR SELECT USING (EXISTS (SELECT 1 FROM public.task_instances ti WHERE ti.id = task_instance_id AND ti.family_id = public.get_user_family_id(auth.uid())));
CREATE POLICY "Users can upload evidence" ON public.task_evidence_photos FOR INSERT WITH CHECK (uploaded_by_user_id = auth.uid());

-- House rules
CREATE POLICY "Family can view rules" ON public.house_rules FOR SELECT USING (family_id = public.get_user_family_id(auth.uid()));
CREATE POLICY "Parents can manage rules" ON public.house_rules FOR ALL USING (public.has_role(auth.uid(), 'parent') AND family_id = public.get_user_family_id(auth.uid()));

-- Penalties log
CREATE POLICY "Family can view penalties" ON public.penalties_log FOR SELECT USING (family_id = public.get_user_family_id(auth.uid()));
CREATE POLICY "Parents can log penalties" ON public.penalties_log FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'parent') AND family_id = public.get_user_family_id(auth.uid()));

-- Rewards
CREATE POLICY "Family can view rewards" ON public.rewards FOR SELECT USING (family_id = public.get_user_family_id(auth.uid()));
CREATE POLICY "Parents can manage rewards" ON public.rewards FOR ALL USING (public.has_role(auth.uid(), 'parent') AND family_id = public.get_user_family_id(auth.uid()));

-- Reward redemptions
CREATE POLICY "Users can view own redemptions" ON public.reward_redemptions FOR SELECT USING (child_id = auth.uid() OR (public.has_role(auth.uid(), 'parent') AND EXISTS (SELECT 1 FROM public.rewards r WHERE r.id = reward_id AND r.family_id = public.get_user_family_id(auth.uid()))));
CREATE POLICY "Children can request redemptions" ON public.reward_redemptions FOR INSERT WITH CHECK (child_id = auth.uid());
CREATE POLICY "Parents can update redemptions" ON public.reward_redemptions FOR UPDATE USING (public.has_role(auth.uid(), 'parent') AND EXISTS (SELECT 1 FROM public.rewards r WHERE r.id = reward_id AND r.family_id = public.get_user_family_id(auth.uid())));

-- Family settings
CREATE POLICY "Family can view settings" ON public.family_settings FOR SELECT USING (family_id = public.get_user_family_id(auth.uid()));
CREATE POLICY "Parents can manage settings" ON public.family_settings FOR ALL USING (public.has_role(auth.uid(), 'parent') AND family_id = public.get_user_family_id(auth.uid()));

-- Quotes
CREATE POLICY "Anyone can view quotes" ON public.quotes FOR SELECT USING (is_active = true);

-- =============================================
-- TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON public.families FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_child_stats_updated_at BEFORE UPDATE ON public.child_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_task_templates_updated_at BEFORE UPDATE ON public.task_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_task_instances_updated_at BEFORE UPDATE ON public.task_instances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON public.rewards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reward_redemptions_updated_at BEFORE UPDATE ON public.reward_redemptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_family_settings_updated_at BEFORE UPDATE ON public.family_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create family_settings
CREATE OR REPLACE FUNCTION public.handle_new_family()
RETURNS TRIGGER AS $$
BEGIN INSERT INTO public.family_settings (family_id) VALUES (NEW.id); RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_family_created AFTER INSERT ON public.families FOR EACH ROW EXECUTE FUNCTION public.handle_new_family();

-- Auto-create child_stats when child role assigned
CREATE OR REPLACE FUNCTION public.handle_child_role_assigned()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'child' THEN
    INSERT INTO public.child_stats (child_id) VALUES (NEW.user_id) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_child_role_assigned AFTER INSERT ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.handle_child_role_assigned();

-- Indexes
CREATE INDEX idx_profiles_family ON public.profiles(family_id);
CREATE INDEX idx_profiles_user ON public.profiles(user_id);
CREATE INDEX idx_task_templates_family ON public.task_templates(family_id);
CREATE INDEX idx_task_instances_family_date ON public.task_instances(family_id, scheduled_for_date);
CREATE INDEX idx_task_instances_assigned ON public.task_instances(assigned_to_user_id, scheduled_for_date);
CREATE INDEX idx_penalties_log_family ON public.penalties_log(family_id, created_at);
CREATE INDEX idx_reward_redemptions_child ON public.reward_redemptions(child_id);
