-- Hotstar Movies Table
-- Purpose: Store complete movie metadata from Hotstar API
-- Database: hotstar_source (separate from main TLDR database)

CREATE TABLE IF NOT EXISTS hotstar_movies (
  -- Primary Keys
  id BIGSERIAL PRIMARY KEY,
  hotstar_id BIGINT NOT NULL UNIQUE,
  content_id VARCHAR(50) NOT NULL UNIQUE,

  -- Basic Information
  title VARCHAR(500) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) DEFAULT 'MOVIE',
  year INTEGER,
  duration INTEGER,

  -- Classification
  genre JSONB,
  lang JSONB,
  lang_objs JSONB,

  -- Availability
  premium BOOLEAN DEFAULT false,
  vip BOOLEAN DEFAULT false,
  paid BOOLEAN DEFAULT false,
  asset_status VARCHAR(50),

  -- Dates (epoch timestamps in seconds)
  start_date BIGINT,
  end_date BIGINT,
  broadcast_date BIGINT,

  -- Media Assets
  thumbnail TEXT,
  portrait_thumbnail TEXT,
  images JSONB,
  source_images JSONB,

  -- Links
  deep_link_url TEXT,
  deep_link_url_living_room TEXT,
  play_uri TEXT,
  locators JSONB,

  -- Credits
  actors JSONB,
  directors JSONB,
  producers JSONB,
  anchors JSONB,

  -- Additional Metadata
  search_keywords JSONB,
  trailers JSONB,
  trailer_deep_links JSONB,
  parental_rating INTEGER,
  parental_rating_name VARCHAR(50),

  -- Channel Information
  channel_object JSONB,

  -- Audit Fields
  api_update_date BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,

  -- Raw Data
  raw_response JSONB
);

-- Indexes for performance
CREATE INDEX idx_hotstar_movies_content_id ON hotstar_movies(content_id);
CREATE INDEX idx_hotstar_movies_hotstar_id ON hotstar_movies(hotstar_id);
CREATE INDEX idx_hotstar_movies_year ON hotstar_movies(year);
CREATE INDEX idx_hotstar_movies_premium ON hotstar_movies(premium);
CREATE INDEX idx_hotstar_movies_asset_status ON hotstar_movies(asset_status);
CREATE INDEX idx_hotstar_movies_api_update_date ON hotstar_movies(api_update_date);
CREATE INDEX idx_hotstar_movies_last_synced_at ON hotstar_movies(last_synced_at);
CREATE INDEX idx_hotstar_movies_is_deleted ON hotstar_movies(is_deleted);

-- GIN indexes for JSONB fields
CREATE INDEX idx_hotstar_movies_genre ON hotstar_movies USING GIN(genre);
CREATE INDEX idx_hotstar_movies_lang ON hotstar_movies USING GIN(lang);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_hotstar_movies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_hotstar_movies_updated_at
  BEFORE UPDATE ON hotstar_movies
  FOR EACH ROW
  EXECUTE FUNCTION update_hotstar_movies_updated_at();

-- Comments
COMMENT ON TABLE hotstar_movies IS 'Complete Hotstar movie catalog with all metadata';
COMMENT ON COLUMN hotstar_movies.hotstar_id IS 'Hotstar internal ID';
COMMENT ON COLUMN hotstar_movies.content_id IS 'Hotstar content ID (public identifier)';
COMMENT ON COLUMN hotstar_movies.api_update_date IS 'Last update timestamp from Hotstar API (epoch seconds)';
COMMENT ON COLUMN hotstar_movies.is_deleted IS 'Soft delete flag - movie no longer available on Hotstar';
COMMENT ON COLUMN hotstar_movies.raw_response IS 'Complete raw JSON response from API for debugging';
