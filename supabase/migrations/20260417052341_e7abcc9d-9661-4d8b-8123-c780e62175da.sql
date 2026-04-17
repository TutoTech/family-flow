-- Le trigger handle_seed_example_tasks insère 20 task_templates lors du rattachement
-- d'un enfant à une famille. Chaque insertion déclenche en cascade :
--   - handle_task_created_notification (insert dans notifications)
--   - send_push_on_notification (net.http_post vers l'edge function send-push)
-- Soit ~20 appels HTTP synchrones → dépasse le statement_timeout (8s).
--
-- Solution : on supprime le trigger automatique. Les parents peuvent toujours
-- créer leurs tâches manuellement ou via la page "Modèles de tâches".

DROP TRIGGER IF EXISTS seed_example_tasks_on_family_join ON public.profiles;
DROP TRIGGER IF EXISTS trg_seed_example_tasks ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_family_set ON public.profiles;