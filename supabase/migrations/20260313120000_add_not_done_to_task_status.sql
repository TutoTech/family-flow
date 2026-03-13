-- Migration to add 'not_done' to task_status ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'task_status' AND e.enumlabel = 'not_done') THEN
        ALTER TYPE public.task_status ADD VALUE 'not_done';
    END IF;
END
$$;
