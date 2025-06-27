-- ### PERMISSIONS FIX FOR SELF-HOSTED SUPERBASE ###
-- This migration grants all necessary permissions for both the 'service_role' (for admin operations)
-- and the 'authenticated' role (for user-facing RLS-protected operations).
-- This is the definitive fix for all "permission denied" and "Error fetching" issues.

-- #### 1. SERVICE ROLE PERMISSIONS (for Server Actions & Admin Operations) ####

-- Grant ALL privileges on the entire public schema to the service_role.
-- THIS IS THE ULTIMATE FIX for "permission denied for schema public".
GRANT ALL ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO service_role;

-- #### 2. AUTHENTICATED USER PERMISSIONS (for Dashboard RLS) ####

-- First, ensure RLS is enabled on all tables that users will access directly.
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_factors ENABLE ROW LEVEL SECURITY; -- Jangan lupa ini

-- Drop any old, potentially conflicting policies to ensure a clean slate.
DROP POLICY IF EXISTS "Allow users to read their own clients" ON public.clients;
DROP POLICY IF EXISTS "Allow users to read their own api keys" ON public.api_keys;
DROP POLICY IF EXISTS "Allow users to read their own sessions" ON public.refresh_tokens;
DROP POLICY IF EXISTS "Allow users to read their own consents" ON public.authorizations;
DROP POLICY IF EXISTS "Allow users to manage their own MFA factors" ON public.mfa_factors; -- Jangan lupa ini

-- Create correct, specific policies for authenticated users.
-- Users can only read/manage data where their UID matches the user_id/created_by_user_id column.

CREATE POLICY "Allow users to read their own clients"
    ON public.clients FOR SELECT USING (auth.uid() = created_by_user_id);

CREATE POLICY "Allow users to read their own api keys"
    ON public.api_keys FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to read their own sessions"
    ON public.refresh_tokens FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to read their own consents"
    ON public.authorizations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to manage their own MFA factors"
    ON public.mfa_factors FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Finally, grant the necessary permissions on these tables to the 'authenticated' role.
GRANT SELECT ON TABLE public.clients TO authenticated;
GRANT SELECT ON TABLE public.api_keys TO authenticated;
GRANT SELECT ON TABLE public.refresh_tokens TO authenticated;
GRANT SELECT ON TABLE public.authorizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mfa_factors TO authenticated; -- Perlu izin lebih dari SELECT
