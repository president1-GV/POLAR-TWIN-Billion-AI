-- ============================================================================
-- POLAR-TWIN: Supabase Authentication, Profiles & RLS Security Migration
-- SIH 26060 — Indian Antarctic Research Stations (Bharati & Maitri)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked directly to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'OPERATOR' CHECK (role IN ('OPERATOR', 'ENGINEER', 'COMMANDER', 'ANALYST', 'VIEWER', 'ADMIN')),
    station_id VARCHAR(32) DEFAULT 'station_bharati' REFERENCES public.stations(id) ON DELETE SET NULL,
    clearance_level INT NOT NULL DEFAULT 2 CHECK (clearance_level BETWEEN 1 AND 5),
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES FOR PROFILES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (
    auth.uid() = id 
    OR 
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role IN ('ADMIN', 'COMMANDER')
    )
);

DROP POLICY IF EXISTS "Public can view active profiles for mission roster" ON public.profiles;
CREATE POLICY "Public can view active profiles for mission roster"
ON public.profiles
FOR SELECT
USING (is_active = TRUE);

DROP POLICY IF EXISTS "Users can update their own non-sensitive profile" ON public.profiles;
CREATE POLICY "Users can update their own non-sensitive profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND clearance_level = (SELECT clearance_level FROM public.profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles"
ON public.profiles
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
);

-- 4. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH.USERS SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role VARCHAR(32) := 'OPERATOR';
    assigned_station VARCHAR(32) := 'station_bharati';
    assigned_clearance INT := 2;
BEGIN
    IF NEW.email LIKE '%admin%' THEN
        assigned_role := 'ADMIN';
        assigned_clearance := 5;
        assigned_station := 'station_bharati';
    ELSIF NEW.email LIKE '%commander%' THEN
        assigned_role := 'COMMANDER';
        assigned_clearance := 4;
        assigned_station := 'station_bharati';
    ELSIF NEW.email LIKE '%engineer%' THEN
        assigned_role := 'ENGINEER';
        assigned_clearance := 3;
        assigned_station := 'station_bharati';
    ELSIF NEW.email LIKE '%analyst%' THEN
        assigned_role := 'ANALYST';
        assigned_clearance := 2;
        assigned_station := 'station_maitri';
    ELSIF NEW.email LIKE '%viewer%' OR NEW.email LIKE '%guest%' THEN
        assigned_role := 'VIEWER';
        assigned_clearance := 1;
    END IF;

    INSERT INTO public.profiles (
        id,
        username,
        display_name,
        role,
        station_id,
        clearance_level,
        mfa_enabled,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        assigned_role,
        assigned_station,
        assigned_clearance,
        assigned_role IN ('ADMIN', 'COMMANDER'),
        TRUE,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        updated_at = NOW(),
        last_login_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. SEED STANDARD POLAR ROSTER PROFILES (Deterministic UUIDs for offline/demo/testing)
INSERT INTO public.profiles (id, username, display_name, role, station_id, clearance_level, mfa_enabled, is_active)
VALUES
('00000000-0000-0000-0000-000000000001', 'operator.sharma', 'V. Sharma', 'OPERATOR', 'station_bharati', 2, FALSE, TRUE),
('00000000-0000-0000-0000-000000000002', 'engineer.deshmukh', 'A. Deshmukh', 'ENGINEER', 'station_bharati', 3, FALSE, TRUE),
('00000000-0000-0000-0000-000000000003', 'commander.nair', 'Col. R. Nair', 'COMMANDER', 'station_bharati', 4, TRUE, TRUE),
('00000000-0000-0000-0000-000000000004', 'analyst.patel', 'Dr. K. Patel', 'ANALYST', 'station_maitri', 2, FALSE, TRUE),
('00000000-0000-0000-0000-000000000005', 'admin.ncpor', 'NCPOR Mission Control Admin', 'ADMIN', 'station_bharati', 5, TRUE, TRUE),
('00000000-0000-0000-0000-000000000006', 'viewer.guest', 'Scientific Guest', 'VIEWER', 'station_bharati', 1, FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    station_id = EXCLUDED.station_id,
    clearance_level = EXCLUDED.clearance_level;

NOTIFY pgrst, 'reload schema';
