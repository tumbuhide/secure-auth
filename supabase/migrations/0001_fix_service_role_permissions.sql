-- Grant usage on the public schema to the service_role
-- This is the critical fix for the "permission denied for schema public" error.
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant all privileges on all current tables in the public schema to the service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant all privileges on all future tables in the public schema to the service_role
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;

-- Grant usage on all sequences to allow ID generation
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO service_role;
