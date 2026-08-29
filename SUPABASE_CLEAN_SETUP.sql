-- ============================================
-- SUPABASE FRESH SETUP - ReviewBoost
-- ZERO DATA - Pure Real-time Only!
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (Clean slate)
-- ============================================
DROP TABLE IF EXISTS public.scans CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;

-- ============================================
-- TABLE 1: businesses
-- ============================================
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    google_review_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX businesses_name_idx ON public.businesses(name);

-- ============================================
-- TABLE 2: scans
-- ============================================
CREATE TABLE public.scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_copied BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX scans_business_id_idx ON public.scans(business_id);
CREATE INDEX scans_created_at_idx ON public.scans(created_at DESC);
CREATE INDEX scans_rating_idx ON public.scans(rating);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE POLICIES
-- ============================================

-- Businesses policies
CREATE POLICY "Allow public read access to businesses"
    ON public.businesses
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to businesses"
    ON public.businesses
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update to businesses"
    ON public.businesses
    FOR UPDATE
    USING (true);

-- Scans policies
CREATE POLICY "Allow public read access to scans"
    ON public.scans
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to scans"
    ON public.scans
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update to scans"
    ON public.scans
    FOR UPDATE
    USING (true);

-- ============================================
-- INSERT BUSINESS DATA (NO SAMPLE SCANS!)
-- ============================================
INSERT INTO public.businesses (
    id,
    name,
    location,
    google_review_url
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'House of Paloma Bandra',
    'Bandra West, Mumbai',
    'https://search.google.com/local/writereview?placeid=ChIJ4TflFcvJ5zsRWP5VIdUk9Qg'
);

-- ============================================
-- NO SAMPLE DATA! 
-- Fresh start - only real QR scans will add data
-- ============================================

-- ============================================
-- ENABLE REALTIME
-- ============================================
DO $$
BEGIN
    -- Remove table from publication if exists
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.scans;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    
    -- Add table to publication
    ALTER PUBLICATION supabase_realtime ADD TABLE public.scans;
    
    RAISE NOTICE '✅ Realtime enabled on scans table';
END $$;

-- ============================================
-- SUCCESS! FRESH START READY
-- ============================================
SELECT 
    '✅ Fresh Setup Complete!' as status,
    COUNT(*) as total_scans 
FROM public.scans;

SELECT 
    'Business Ready: ' || name as info
FROM public.businesses;
