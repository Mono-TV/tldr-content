-- Hotstar API Tokens Table
-- Purpose: Store generated Akamai HMAC tokens with expiration tracking
-- Database: hotstar_source (separate from main TLDR database)

CREATE TABLE IF NOT EXISTS hotstar_api_tokens (
  id BIGSERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Indexes for performance
CREATE INDEX idx_api_tokens_expires_at ON hotstar_api_tokens(expires_at);
CREATE INDEX idx_api_tokens_is_active ON hotstar_api_tokens(is_active);

-- Comments
COMMENT ON TABLE hotstar_api_tokens IS 'Stores Akamai HMAC tokens for Hotstar API authentication';
COMMENT ON COLUMN hotstar_api_tokens.token IS 'Akamai EdgeAuth token in format: st=xxx~exp=xxx~acl=/*~hmac=xxx';
COMMENT ON COLUMN hotstar_api_tokens.expires_at IS 'Token expiration time (typically 33 minutes after generation)';
COMMENT ON COLUMN hotstar_api_tokens.is_active IS 'Whether this token is currently active (auto-deactivated on expiry)';
