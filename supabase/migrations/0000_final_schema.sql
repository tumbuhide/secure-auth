-- Secure Auth: Final & Complete Database Schema
-- Version: 2.0
-- This single file contains the complete schema for a fresh database setup.

-- 1. Clients Table: Stores OAuth2/OIDC client applications.
CREATE TABLE public.clients (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(255) UNIQUE NOT NULL,
    client_secret_hash VARCHAR(255),
    client_name VARCHAR(255) NOT NULL,
    redirect_uris TEXT[] NOT NULL,
    post_logout_redirect_uris TEXT[],
    response_types TEXT[] NOT NULL DEFAULT '{"code"}',
    grant_types TEXT[] NOT NULL DEFAULT '{"authorization_code", "refresh_token"}',
    scope TEXT NOT NULL DEFAULT 'openid profile email',
    token_endpoint_auth_method VARCHAR(50) NOT NULL DEFAULT 'client_secret_post',
    logo_uri VARCHAR(255),
    client_uri VARCHAR(255),
    tos_uri VARCHAR(255),
    policy_uri VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.clients IS 'Stores registered OAuth2/OIDC client applications.';

-- 2. Authorizations Table: Tracks user consents for clients.
CREATE TABLE public.authorizations (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id VARCHAR(255) NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
    scopes_granted TEXT[] NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, client_id)
);
COMMENT ON TABLE public.authorizations IS 'Tracks user consents granted to client applications.';

-- 3. Refresh Tokens Table: Securely stores refresh tokens.
CREATE TABLE public.refresh_tokens (
    id SERIAL PRIMARY KEY,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id VARCHAR(255) NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
    scopes TEXT[] NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_agent TEXT,
    ip_address VARCHAR(45),
    parent_token_hash VARCHAR(255)
);
COMMENT ON TABLE public.refresh_tokens IS 'Securely stores refresh tokens for persistent sessions.';

-- 4. Authorization Codes Table: Temporary storage for auth codes.
CREATE TABLE public.authorization_codes (
    id SERIAL PRIMARY KEY,
    code_hash VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id VARCHAR(255) NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
    redirect_uri VARCHAR(255) NOT NULL,
    scopes TEXT[] NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    code_challenge VARCHAR(255),
    code_challenge_method VARCHAR(10),
    nonce VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.authorization_codes IS 'Temporarily stores authorization codes for the OIDC flow.';

-- 5. API Keys Table: For M2M or direct API access.
CREATE TABLE public.api_keys (
    id SERIAL PRIMARY KEY,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    prefix VARCHAR(10) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id VARCHAR(255) REFERENCES public.clients(client_id) ON DELETE CASCADE,
    description TEXT,
    scopes TEXT[] NOT NULL,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.api_keys IS 'Stores API keys for programmatic access.';

-- 6. Audit Logs Table: Records all significant system events.
CREATE TABLE public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    client_id VARCHAR(255), -- Not a foreign key, client might be deleted
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) NOT NULL,
    details JSONB,
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
COMMENT ON TABLE public.audit_logs IS 'Records all significant system events for security and monitoring.';

-- 7. System Settings Table: For dynamic system configuration.
CREATE TABLE public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    description TEXT,
    last_updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.system_settings IS 'Stores global system configurations.';

-- 8. MFA Factors Table: Stores MFA secrets for users.
CREATE TABLE public.mfa_factors (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friendly_name TEXT,
    factor_type TEXT NOT NULL,
    status TEXT NOT NULL,
    secret TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, friendly_name)
);
COMMENT ON TABLE public.mfa_factors IS 'Stores multi-factor authentication secrets for each user.';

-- 9. Login Attempts Table: Tracks login attempts for brute-force protection.
CREATE TABLE public.login_attempts (
    id BIGSERIAL PRIMARY KEY,
    ip_address TEXT,
    email TEXT,
    attempted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    successful BOOLEAN NOT NULL
);
COMMENT ON TABLE public.login_attempts IS 'Tracks login attempts to prevent brute-force attacks.';

-- 10. Default System Settings
INSERT INTO public.system_settings (key, value, description)
VALUES
    ('token_lifetimes', '{"access_token": 3600, "refresh_token": 604800, "authorization_code": 60}', 'Token lifetimes in seconds (access, refresh, auth code).'),
    ('password_policy', '{"min_length": 8}', 'User password policies.')
ON CONFLICT (key) DO NOTHING;

-- 11. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_clients_client_id ON public.clients (client_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_client ON public.refresh_tokens (user_id, client_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_email_time ON public.login_attempts (ip_address, email, attempted_at DESC);

-- 12. Row Level Security (RLS) Policies
-- MFA Factors should only be accessible by the owner.
ALTER TABLE public.mfa_factors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage their own MFA factors"
    ON public.mfa_factors
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 13. Grant Permissions to Supabase Roles
-- Grant authenticated users access to manage their own MFA factors.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mfa_factors TO authenticated;

-- Grant service_role (backend admin) full access to ALL tables.
-- THIS IS THE CRITICAL FIX.
GRANT ALL ON TABLE public.clients TO service_role;
GRANT ALL ON TABLE public.authorizations TO service_role;
GRANT ALL ON TABLE public.refresh_tokens TO service_role;
GRANT ALL ON TABLE public.authorization_codes TO service_role;
GRANT ALL ON TABLE public.api_keys TO service_role;
GRANT ALL ON TABLE public.audit_logs TO service_role;
GRANT ALL ON TABLE public.system_settings TO service_role;
GRANT ALL ON TABLE public.mfa_factors TO service_role;
GRANT ALL ON TABLE public.login_attempts TO service_role;

-- Grant access to sequences for ID generation.
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Final Schema Setup Complete --
