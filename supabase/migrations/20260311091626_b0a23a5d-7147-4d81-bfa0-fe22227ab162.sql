
-- FIX 1: Remove privilege escalation on user_roles
-- Roles are assigned exclusively by the handle_new_user trigger (SECURITY DEFINER)
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;

-- FIX 2: Remove overly permissive families SELECT policy
DROP POLICY IF EXISTS "Anyone authenticated can read family by invite code" ON public.families;

-- Create a SECURITY DEFINER function for invite code lookup (safe, returns only id+name+plan)
CREATE OR REPLACE FUNCTION public.lookup_family_by_invite_code(_code text)
RETURNS TABLE (id uuid, name text, plan text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.id, f.name, f.plan
  FROM public.families f
  WHERE f.invite_code = _code
  LIMIT 1;
$$;

-- FIX 3: Make task-evidence bucket private
UPDATE storage.buckets SET public = false WHERE id = 'task-evidence';

-- Fix storage RLS: drop overly permissive SELECT policy if exists and create family-scoped one
DROP POLICY IF EXISTS "Authenticated users can view evidence" ON storage.objects;
DROP POLICY IF EXISTS "Family members can view own evidence" ON storage.objects;

CREATE POLICY "Family members can view own evidence"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'task-evidence' AND
  EXISTS (
    SELECT 1 FROM public.task_evidence_photos tep
    JOIN public.task_instances ti ON ti.id = tep.task_instance_id
    WHERE tep.storage_key = name
      AND ti.family_id = public.get_user_family_id(auth.uid())
  )
);
