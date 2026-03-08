
-- Fix the function to use net.http_post (pg_net syntax)
CREATE OR REPLACE FUNCTION public.send_push_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://fzstjebbxbejypgwamqx.supabase.co/functions/v1/send-push',
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'title', NEW.title,
      'body', NEW.body,
      'type', NEW.type,
      'metadata', NEW.metadata
    ),
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6c3RqZWJieGJlanlwZ3dhbXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzA5MzksImV4cCI6MjA4ODUwNjkzOX0.AGOYSP4H854nRCycl794WfNwJa1gX45UYI1iJoayvVQ"}'::jsonb
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;
