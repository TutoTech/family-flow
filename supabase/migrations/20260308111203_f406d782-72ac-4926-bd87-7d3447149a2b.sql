
-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create a function that sends push notification via edge function when a notification is inserted
CREATE OR REPLACE FUNCTION public.send_push_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM extensions.http_post(
    url := 'https://fzstjebbxbejypgwamqx.supabase.co/functions/v1/send-push',
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'title', NEW.title,
      'body', NEW.body,
      'type', NEW.type,
      'metadata', NEW.metadata
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    )
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the notification insert if push fails
  RETURN NEW;
END;
$$;

-- Trigger to send push on notification insert
CREATE TRIGGER on_notification_send_push
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_push_on_notification();
