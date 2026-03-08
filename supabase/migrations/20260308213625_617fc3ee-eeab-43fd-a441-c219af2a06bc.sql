
-- Recreate ALL triggers

-- 1. New user → profile + role (on auth.users)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. New family → seed settings, rules, rewards
DROP TRIGGER IF EXISTS on_family_created ON public.families;
CREATE TRIGGER on_family_created
  AFTER INSERT ON public.families
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_family();

-- 3. Child role → create child_stats
DROP TRIGGER IF EXISTS on_child_role_assigned ON public.user_roles;
CREATE TRIGGER on_child_role_assigned
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_child_role_assigned();

-- 4. Profile family set → seed example tasks
DROP TRIGGER IF EXISTS on_profile_family_set ON public.profiles;
CREATE TRIGGER on_profile_family_set
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_seed_example_tasks();

-- 5. Task completed → notify parents
DROP TRIGGER IF EXISTS on_task_completed ON public.task_instances;
CREATE TRIGGER on_task_completed
  AFTER UPDATE ON public.task_instances
  FOR EACH ROW EXECUTE FUNCTION public.handle_task_completed_notification();

-- 6. Task validated → award points
DROP TRIGGER IF EXISTS on_task_validated ON public.task_instances;
CREATE TRIGGER on_task_validated
  AFTER UPDATE ON public.task_instances
  FOR EACH ROW EXECUTE FUNCTION public.handle_task_validated();

-- 7. Penalty logged
DROP TRIGGER IF EXISTS on_penalty_logged ON public.penalties_log;
CREATE TRIGGER on_penalty_logged
  AFTER INSERT ON public.penalties_log
  FOR EACH ROW EXECUTE FUNCTION public.handle_penalty_logged();

DROP TRIGGER IF EXISTS on_penalty_notification ON public.penalties_log;
CREATE TRIGGER on_penalty_notification
  AFTER INSERT ON public.penalties_log
  FOR EACH ROW EXECUTE FUNCTION public.handle_penalty_notification();

-- 8. Reward redemptions
DROP TRIGGER IF EXISTS on_redemption_requested ON public.reward_redemptions;
CREATE TRIGGER on_redemption_requested
  AFTER INSERT ON public.reward_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_redemption_requested_notification();

DROP TRIGGER IF EXISTS on_redemption_approved ON public.reward_redemptions;
CREATE TRIGGER on_redemption_approved
  AFTER UPDATE ON public.reward_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_redemption_approved();

DROP TRIGGER IF EXISTS on_reward_approved_notification ON public.reward_redemptions;
CREATE TRIGGER on_reward_approved_notification
  AFTER UPDATE ON public.reward_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_reward_approved_notification();

-- 9. Child stats → badges
DROP TRIGGER IF EXISTS on_child_stats_updated ON public.child_stats;
CREATE TRIGGER on_child_stats_updated
  AFTER UPDATE ON public.child_stats
  FOR EACH ROW EXECUTE FUNCTION public.check_and_award_badges();

-- 10. Task template created → notify child
DROP TRIGGER IF EXISTS on_task_template_created ON public.task_templates;
CREATE TRIGGER on_task_template_created
  AFTER INSERT ON public.task_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_task_created_notification();

-- 11. Notification → push
DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;
CREATE TRIGGER on_notification_created
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.send_push_on_notification();

-- 12. updated_at
DROP TRIGGER IF EXISTS update_families_updated_at ON public.families;
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON public.families FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_family_settings_updated_at ON public.family_settings;
CREATE TRIGGER update_family_settings_updated_at BEFORE UPDATE ON public.family_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_rewards_updated_at ON public.rewards;
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON public.rewards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_instances_updated_at ON public.task_instances;
CREATE TRIGGER update_task_instances_updated_at BEFORE UPDATE ON public.task_instances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_templates_updated_at ON public.task_templates;
CREATE TRIGGER update_task_templates_updated_at BEFORE UPDATE ON public.task_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_savings_goals_updated_at ON public.savings_goals;
CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reward_redemptions_updated_at ON public.reward_redemptions;
CREATE TRIGGER update_reward_redemptions_updated_at BEFORE UPDATE ON public.reward_redemptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Family member limits
DROP TRIGGER IF EXISTS on_profile_family_limit ON public.profiles;
CREATE TRIGGER on_profile_family_limit
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_family_member_limits();
