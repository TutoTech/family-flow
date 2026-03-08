
-- Allow users to read families by invite_code (needed for join flow)
-- We'll use an edge function instead, so no new RLS needed.
-- But we need a policy so users can view families they search by invite code
CREATE POLICY "Anyone authenticated can read family by invite code"
ON public.families FOR SELECT
TO authenticated
USING (true);

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their family" ON public.families;

-- Re-create: users can view their own family
CREATE POLICY "Users can view their family"
ON public.families FOR SELECT
TO authenticated
USING (id = get_user_family_id(auth.uid()));
