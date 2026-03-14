-- Remove the duplicate trigger 'on_penalty_logged_notify' from penalties_log.
-- There is already another trigger 'on_penalty_notification' calling the exact
-- same function (handle_penalty_notification), which was causing duplicate
-- notifications in the app.

DROP TRIGGER IF EXISTS on_penalty_logged_notify ON public.penalties_log;
