-- ==============================================================================
-- ONLYHUB HACKATHON DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- ==============================================================================

-- 1. Create hackathons table
CREATE TABLE IF NOT EXISTS public.hackathons (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'devfolio', 'dorahacks', 'mlh', 'unstop', 'wemakedevs'
    mode TEXT NOT NULL, -- 'Online', 'In-Person', 'Hybrid'
    start_date TEXT,
    end_date TEXT,
    display_dates TEXT NOT NULL,
    image_url TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    tags TEXT[] DEFAULT '{}',
    prize_pool TEXT,
    location TEXT,
    organizer TEXT,
    status TEXT DEFAULT 'upcoming', -- 'live', 'upcoming', 'ended'
    featured BOOLEAN DEFAULT FALSE,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes for high-performance querying and filtering
CREATE INDEX IF NOT EXISTS idx_hackathons_platform ON public.hackathons(platform);
CREATE INDEX IF NOT EXISTS idx_hackathons_mode ON public.hackathons(mode);
CREATE INDEX IF NOT EXISTS idx_hackathons_status ON public.hackathons(status);
CREATE INDEX IF NOT EXISTS idx_hackathons_created_at ON public.hackathons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hackathons_tags ON public.hackathons USING GIN(tags);

-- 3. Create sync_logs table to track Bright Data collector triggers
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT NOT NULL,
    collector_id TEXT NOT NULL,
    response_id TEXT,
    status TEXT NOT NULL, -- 'triggered', 'completed', 'failed'
    items_count INT DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON public.sync_logs(started_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to hackathons
CREATE POLICY "Public users can view hackathons" 
    ON public.hackathons 
    FOR SELECT 
    USING (true);

-- Allow service role full access to insert/update hackathons
CREATE POLICY "Service role can manage hackathons" 
    ON public.hackathons 
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Allow service role full access to sync logs
CREATE POLICY "Service role can manage sync logs" 
    ON public.sync_logs 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 5. Create subscribers table for email alerts & digest
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_notified_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_is_active ON public.subscribers(is_active);

-- Enable RLS on subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Allow service role full access to manage subscribers
CREATE POLICY "Service role can manage subscribers" 
    ON public.subscribers 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

