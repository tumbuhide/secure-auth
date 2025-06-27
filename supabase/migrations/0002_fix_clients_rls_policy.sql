-- RLS Policy for clients table
-- This policy allows authenticated users to SELECT clients they have created.
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, to prevent conflicts
DROP POLICY IF EXISTS "Allow individual user read access" ON public.clients;
DROP POLICY IF EXISTS "Allow users to manage their own clients" ON public.clients;

-- Create a new, correct policy
CREATE POLICY "Allow users to manage their own clients"
    ON public.clients
    FOR SELECT
    USING (auth.uid() = created_by_user_id);

-- NOTE: Inserts/Updates/Deletes are handled by Server Actions using the service_role,
-- so we only need to grant SELECT permission for the user's own data.
-- The service_role bypasses RLS by default.

-- Grant SELECT permission to authenticated users
GRANT SELECT ON TABLE public.clients TO authenticated;
