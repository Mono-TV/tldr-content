-- Hotstar Sync Log Table
-- Purpose: Track all sync operations (initial, incremental, daily)
-- Database: hotstar_source (separate from main TLDR database)

CREATE TABLE IF NOT EXISTS hotstar_sync_log (
  id BIGSERIAL PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL,  -- 'initial', 'incremental', 'daily'
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  status VARCHAR(50),  -- 'running', 'completed', 'failed'

  -- Statistics
  total_items_fetched INTEGER DEFAULT 0,
  items_added INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  items_deleted INTEGER DEFAULT 0,
  api_requests_made INTEGER DEFAULT 0,

  -- Time window for incremental sync
  from_update_date BIGINT,
  to_update_date BIGINT,

  -- Error tracking
  errors JSONB,  -- Array of error messages

  -- Performance
  duration_seconds INTEGER
);

-- Indexes for performance
CREATE INDEX idx_sync_log_sync_type ON hotstar_sync_log(sync_type);
CREATE INDEX idx_sync_log_started_at ON hotstar_sync_log(started_at);
CREATE INDEX idx_sync_log_status ON hotstar_sync_log(status);

-- Comments
COMMENT ON TABLE hotstar_sync_log IS 'Tracks all Hotstar sync operations with statistics and errors';
COMMENT ON COLUMN hotstar_sync_log.sync_type IS 'Type of sync operation: initial, incremental, daily';
COMMENT ON COLUMN hotstar_sync_log.from_update_date IS 'Start of time window for incremental sync (epoch seconds)';
COMMENT ON COLUMN hotstar_sync_log.to_update_date IS 'End of time window for incremental sync (epoch seconds)';
COMMENT ON COLUMN hotstar_sync_log.errors IS 'JSON array of error messages encountered during sync';
