
-- Allow users to view roles of family members (needed for member list)
CREATE POLICY "Users can view family member roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR get_user_family_id(user_id) = get_user_family_id(auth.uid())
);

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
