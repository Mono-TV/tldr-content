-- Hotstar Sports Table
-- Stores sports content from Hotstar API

CREATE TABLE IF NOT EXISTS hotstar_sports (
    id BIGSERIAL PRIMARY KEY,
    hotstar_id BIGINT NOT NULL UNIQUE,
    content_id VARCHAR(100) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    content_type VARCHAR(100),

    -- Sports-specific fields
    sport_type VARCHAR(100),
    tournament VARCHAR(255),
    teams TEXT,
    match_date BIGINT,

    -- Duration
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
CREATE INDEX IF NOT EXISTS idx_sports_content_id ON hotstar_sports(content_id);
CREATE INDEX IF NOT EXISTS idx_sports_title ON hotstar_sports USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_sports_sport_type ON hotstar_sports(sport_type);
CREATE INDEX IF NOT EXISTS idx_sports_tournament ON hotstar_sports(tournament);
CREATE INDEX IF NOT EXISTS idx_sports_match_date ON hotstar_sports(match_date);
CREATE INDEX IF NOT EXISTS idx_sports_asset_status ON hotstar_sports(asset_status);
CREATE INDEX IF NOT EXISTS idx_sports_is_deleted ON hotstar_sports(is_deleted);
CREATE INDEX IF NOT EXISTS idx_sports_created_at ON hotstar_sports(created_at);
CREATE INDEX IF NOT EXISTS idx_sports_lang ON hotstar_sports USING gin(lang);
CREATE INDEX IF NOT EXISTS idx_sports_genre ON hotstar_sports USING gin(genre);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_sports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sports_timestamp
    BEFORE UPDATE ON hotstar_sports
    FOR EACH ROW
    EXECUTE FUNCTION update_sports_updated_at();
