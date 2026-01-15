-- Hotstar TV Shows Table
-- Stores TV show/series content from Hotstar API (without episodes)

CREATE TABLE IF NOT EXISTS hotstar_shows (
    id BIGSERIAL PRIMARY KEY,
    hotstar_id BIGINT NOT NULL UNIQUE,
    content_id VARCHAR(100) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    content_type VARCHAR(100),

    -- Show-specific fields
    season_count INTEGER DEFAULT 0,
    episode_count INTEGER DEFAULT 0,
    year INTEGER,

    -- Duration (typical episode length)
    duration INTEGER,

    -- Categories and metadata
    genre JSONB DEFAULT '[]',
    lang JSONB DEFAULT '[]',
    lang_objs JSONB DEFAULT '[]',

    -- Premium/VIP flags
    premium BOOLEAN DEFAULT false,
    vip BOOLEAN DEFAULT false,
    paid BOOLEAN DEFAULT false,
    asset_status VARCHAR(50),

    -- Date fields
    start_date BIGINT,
    end_date BIGINT,
    broadcast_date BIGINT,

    -- Image URLs
    thumbnail TEXT,
    portrait_thumbnail TEXT,
    images JSONB DEFAULT '[]',
    source_images JSONB DEFAULT '[]',

    -- Deep links
    deep_link_url TEXT,
    deep_link_url_living_room TEXT,
    play_uri TEXT,
    locators JSONB DEFAULT '[]',

    -- People
    actors JSONB DEFAULT '[]',
    directors JSONB DEFAULT '[]',
    producers JSONB DEFAULT '[]',
    anchors JSONB DEFAULT '[]',

    -- Search and trailers
    search_keywords JSONB DEFAULT '[]',
    trailers JSONB DEFAULT '[]',
    trailer_deep_links JSONB DEFAULT '[]',

    -- Ratings
    parental_rating INTEGER,
    parental_rating_name VARCHAR(50),

    -- Channel
    channel_object JSONB,

    -- API metadata
    api_update_date BIGINT,
    raw_response JSONB,

    -- Deletion tracking
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_shows_content_id ON hotstar_shows(content_id);
CREATE INDEX IF NOT EXISTS idx_shows_title ON hotstar_shows USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_shows_year ON hotstar_shows(year);
CREATE INDEX IF NOT EXISTS idx_shows_asset_status ON hotstar_shows(asset_status);
CREATE INDEX IF NOT EXISTS idx_shows_is_deleted ON hotstar_shows(is_deleted);
CREATE INDEX IF NOT EXISTS idx_shows_created_at ON hotstar_shows(created_at);
CREATE INDEX IF NOT EXISTS idx_shows_lang ON hotstar_shows USING gin(lang);
CREATE INDEX IF NOT EXISTS idx_shows_genre ON hotstar_shows USING gin(genre);
CREATE INDEX IF NOT EXISTS idx_shows_season_count ON hotstar_shows(season_count);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_shows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shows_timestamp
    BEFORE UPDATE ON hotstar_shows
    FOR EACH ROW
    EXECUTE FUNCTION update_shows_updated_at();
