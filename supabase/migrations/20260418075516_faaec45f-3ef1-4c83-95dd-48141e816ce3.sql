-- Crée le trigger manquant qui injecte automatiquement les 20 templates de tâches
-- d'exemple lorsqu'un enfant rejoint une famille (premier enfant uniquement).
-- Le corps de la fonction handle_seed_example_tasks existe déjà, mais le trigger
-- n'avait jamais été attaché à la table profiles.

DROP TRIGGER IF EXISTS tr_seed_example_tasks ON public.profiles;

CREATE TRIGGER tr_seed_example_tasks
AFTER INSERT OR UPDATE OF family_id ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_seed_example_tasks();