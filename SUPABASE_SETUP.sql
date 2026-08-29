-- ============================================
-- SUPABASE SQL SETUP - ReviewBoost
-- Copy paste this ENTIRE script in Supabase SQL Editor and run
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: businesses
-- ============================================
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    google_review_url TEXT NOT NULL,
    google_rating DECIMAL(2,1) DEFAULT 4.0,
    google_review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS businesses_name_idx ON public.businesses(name);

-- ============================================
-- TABLE 2: scans
-- ============================================
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_copied BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS scans_business_id_idx ON public.scans(business_id);
CREATE INDEX IF NOT EXISTS scans_created_at_idx ON public.scans(created_at DESC);
CREATE INDEX IF NOT EXISTS scans_rating_idx ON public.scans(rating);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP OLD POLICIES IF EXIST
-- ============================================
DROP POLICY IF EXISTS "Allow public read access to businesses" ON public.businesses;
DROP POLICY IF EXISTS "Allow public insert to businesses" ON public.businesses;
DROP POLICY IF EXISTS "Allow public update to businesses" ON public.businesses;
DROP POLICY IF EXISTS "Allow public read access to scans" ON public.scans;
DROP POLICY IF EXISTS "Allow public insert to scans" ON public.scans;
DROP POLICY IF EXISTS "Allow public update to scans" ON public.scans;

-- ============================================
-- RLS POLICIES - Allow public read/write for demo
-- (For production, add proper authentication)
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
-- DELETE OLD DATA (Clean slate)
-- ============================================
DELETE FROM public.scans;
DELETE FROM public.businesses;

-- ============================================
-- INSERT DEFAULT BUSINESS (House of Paloma Bandra)
-- ============================================
INSERT INTO public.businesses (
    id,
    name,
    location,
    google_review_url,
    google_rating,
    google_review_count
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Fixed UUID for easy reference
    'House of Paloma Bandra',
    'Bandra West, Mumbai',
    'https://search.google.com/local/writereview?placeid=ChIJ4Tfltcucy0ARWPRfFVJNUo8',
    4.6,
    1284
);

-- ============================================
-- INSERT SAMPLE SCANS (for testing dashboard)
-- ============================================

-- Recent scans (last few hours) - for activity feed
INSERT INTO public.scans (business_id, rating, review_copied, timestamp, created_at) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, true, NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '5 minutes'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, true, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 4, true, NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '25 minutes'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, true, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, false, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 4, true, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, true, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 3, true, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),

-- Last 7 days scans (for weekly chart)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 4, true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, true, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, true, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 4, true, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, true, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, true, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 3, true, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days');

-- ============================================
-- FUNCTIONS FOR STATISTICS
-- ============================================

-- Function to get rating breakdown
CREATE OR REPLACE FUNCTION get_rating_breakdown(p_business_id UUID)
RETURNS TABLE(rating INTEGER, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.rating,
        COUNT(*)::BIGINT
    FROM public.scans s
    WHERE s.business_id = p_business_id
    GROUP BY s.rating
    ORDER BY s.rating DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get weekly stats
CREATE OR REPLACE FUNCTION get_weekly_stats(p_business_id UUID)
RETURNS TABLE(day_offset INTEGER, scan_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(DOW FROM created_at)::INTEGER AS day_offset,
        COUNT(*)::BIGINT
    FROM public.scans
    WHERE business_id = p_business_id
      AND created_at >= NOW() - INTERVAL '7 days'
    GROUP BY day_offset
    ORDER BY day_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ENABLE REALTIME (IMPORTANT!)
-- ============================================
-- Check if scans table is already in publication, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'scans'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.scans;
        RAISE NOTICE '✅ Realtime enabled on scans table';
    ELSE
        RAISE NOTICE '✅ Realtime already enabled on scans table';
    END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES (Run separately to verify)
-- ============================================
-- Uncomment and run these one by one to verify setup:

-- Check businesses table
-- SELECT * FROM public.businesses;

-- Check scans table
-- SELECT * FROM public.scans ORDER BY created_at DESC;

-- Check rating breakdown
-- SELECT * FROM get_rating_breakdown('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- Count total scans
-- SELECT COUNT(*) as total_scans FROM public.scans WHERE business_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Count copied reviews
-- SELECT COUNT(*) as total_copied FROM public.scans WHERE business_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' AND review_copied = true;

-- Check recent scans (last 10)
-- SELECT rating, review_copied, created_at FROM public.scans WHERE business_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' ORDER BY created_at DESC LIMIT 10;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database setup complete!';
    RAISE NOTICE '✅ Business ID: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    RAISE NOTICE '✅ Sample scans added for testing';
    RAISE NOTICE '✅ Realtime enabled on scans table';
    RAISE NOTICE '🚀 You can now test your application!';
END $$;
