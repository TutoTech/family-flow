-- 1) Default 30 -> 7 days, plus contrainte 1..30
ALTER TABLE public.family_settings ALTER COLUMN photo_retention_days SET DEFAULT 7;

UPDATE public.family_settings SET photo_retention_days = 7 WHERE photo_retention_days = 30;

ALTER TABLE public.family_settings DROP CONSTRAINT IF EXISTS photo_retention_days_range;
ALTER TABLE public.family_settings
  ADD CONSTRAINT photo_retention_days_range CHECK (photo_retention_days BETWEEN 1 AND 30);

-- 2) Trigger pour calculer expires_at à l'insertion d'une photo
CREATE OR REPLACE FUNCTION public.set_evidence_expiration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _retention_days integer;
  _family_id uuid;
BEGIN
  IF NEW.expires_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT ti.family_id INTO _family_id
  FROM public.task_instances ti
  WHERE ti.id = NEW.task_instance_id;

  IF _family_id IS NULL THEN
    NEW.expires_at := now() + interval '7 days';
    RETURN NEW;
  END IF;

  SELECT photo_retention_days INTO _retention_days
  FROM public.family_settings WHERE family_id = _family_id;

  NEW.expires_at := now() + make_interval(days => COALESCE(_retention_days, 7));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_set_evidence_expiration ON public.task_evidence_photos;
CREATE TRIGGER tr_set_evidence_expiration
BEFORE INSERT ON public.task_evidence_photos
FOR EACH ROW EXECUTE FUNCTION public.set_evidence_expiration();

-- Backfill des photos existantes sans expires_at
UPDATE public.task_evidence_photos tep
SET expires_at = tep.uploaded_at + make_interval(days => COALESCE(fs.photo_retention_days, 7))
FROM public.task_instances ti
LEFT JOIN public.family_settings fs ON fs.family_id = ti.family_id
WHERE tep.task_instance_id = ti.id AND tep.expires_at IS NULL;

-- 3) Fonction de nettoyage des photos expirées (storage + base)
CREATE OR REPLACE FUNCTION public.cleanup_expired_evidence_photos()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'storage'
AS $$
DECLARE
  _photo record;
  _count integer := 0;
BEGIN
  FOR _photo IN
    SELECT id, storage_key
    FROM public.task_evidence_photos
    WHERE expires_at IS NOT NULL
      AND expires_at < now()
      AND deleted_at IS NULL
    LIMIT 1000
  LOOP
    DELETE FROM storage.objects
    WHERE bucket_id = 'task-evidence' AND name = _photo.storage_key;

    DELETE FROM public.task_evidence_photos WHERE id = _photo.id;
    _count := _count + 1;
  END LOOP;

  RETURN _count;
END;
$$;