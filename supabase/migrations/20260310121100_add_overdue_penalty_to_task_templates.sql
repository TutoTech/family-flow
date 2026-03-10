
-- Add overdue penalty configuration to task templates
-- Allows parents to configure automatic point deduction
-- when a task is not completed before the deadline.

ALTER TABLE public.task_templates
  ADD COLUMN overdue_penalty_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN overdue_penalty_points INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.task_templates.overdue_penalty_enabled
  IS 'Whether an automatic point penalty is applied when the task is overdue';
COMMENT ON COLUMN public.task_templates.overdue_penalty_points
  IS 'Number of points deducted from the child when the task is overdue (only if overdue_penalty_enabled = true)';
