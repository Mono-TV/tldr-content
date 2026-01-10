# Hotstar Movie Ingestion & Sync Architecture

**Date:** January 10, 2026
**Purpose:** Complete ingestion plan for Hotstar content with daily sync

---

## 🏗️ Architecture Overview

### Database Strategy: Separate Source Database

```
┌─────────────────────────────────────────────────────┐
│                  TLDR Content                       │
│                  Main Database                      │
│            (Aggregated/Normalized Data)             │
└─────────────────────────────────────────────────────┘
                         ↑
                         │ Read/Transform
                         │
┌─────────────────────────────────────────────────────┐
│              HOTSTAR Source Database                │
│               (Raw API Responses)                   │
│  - Complete metadata preservation                   │
│  - Original field names                             │
│  - JSON storage for complex fields                  │
│  - Audit trail (created_at, updated_at)             │
└─────────────────────────────────────────────────────┘
                         ↑
                         │ Ingest/Sync
                         │
┌─────────────────────────────────────────────────────┐
│                 Hotstar API                         │
│         (pp-catalog-api.hotstar.com)                │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### Table: `hotstar_movies`

```sql
CREATE TABLE hotstar_movies (
  -- Primary Keys
  id BIGSERIAL PRIMARY KEY,
  hotstar_id BIGINT NOT NULL UNIQUE,  -- Hotstar's internal ID
  content_id VARCHAR(50) NOT NULL UNIQUE,  -- Hotstar's content ID

  -- Basic Information
  title VARCHAR(500) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) DEFAULT 'MOVIE',
  year INTEGER,
  duration INTEGER,  -- in seconds

  -- Classification
  genre JSONB,  -- Array: ["Drama", "Action"]
  lang JSONB,   -- Array: ["Hindi", "English"]
  lang_objs JSONB,  -- Full language objects with iso codes

  -- Availability
  premium BOOLEAN DEFAULT false,
  vip BOOLEAN DEFAULT false,
  paid BOOLEAN DEFAULT false,
  asset_status VARCHAR(50),  -- PUBLISHED, UNPUBLISHED

  -- Dates (epoch timestamps in seconds)
  start_date BIGINT,
  end_date BIGINT,
  broadcast_date BIGINT,

  -- Media Assets
  thumbnail TEXT,
  portrait_thumbnail TEXT,
  images JSONB,  -- Array of image objects
  source_images JSONB,  -- Array of source image objects

  -- Links
  deep_link_url TEXT,
  deep_link_url_living_room TEXT,
  play_uri TEXT,
  locators JSONB,  -- Array of platform-specific URLs

  -- Credits
  actors JSONB,  -- Array of actor names
  directors JSONB,  -- Array of director names
  producers JSONB,  -- Array of producer names
  anchors JSONB,  -- Array of anchor names

  -- Additional Metadata
  search_keywords JSONB,  -- Array of keywords
  trailers JSONB,  -- Array of trailer objects
  trailer_deep_links JSONB,  -- Array of trailer deep links
  parental_rating INTEGER,
  parental_rating_name VARCHAR(50),

  -- Channel Information
  channel_object JSONB,  -- {id, name, contentId}

  -- Audit Fields
  api_update_date BIGINT,  -- From Hotstar API
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,

  -- Raw Data (for debugging/future proofing)
  raw_response JSONB,  -- Complete API response

  -- Indexes
  INDEX idx_content_id (content_id),
  INDEX idx_hotstar_id (hotstar_id),
  INDEX idx_year (year),
  INDEX idx_premium (premium),
  INDEX idx_asset_status (asset_status),
  INDEX idx_api_update_date (api_update_date),
  INDEX idx_last_synced_at (last_synced_at),
  INDEX idx_is_deleted (is_deleted),
  INDEX idx_genre ((genre)),  -- GIN index for JSONB
  INDEX idx_lang ((lang))     -- GIN index for JSONB
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hotstar_movies_updated_at
  BEFORE UPDATE ON hotstar_movies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Table: `hotstar_sync_log`

```sql
CREATE TABLE hotstar_sync_log (
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
  duration_seconds INTEGER,

  INDEX idx_sync_type (sync_type),
  INDEX idx_started_at (started_at),
  INDEX idx_status (status)
);
```

### Table: `hotstar_api_tokens`

```sql
CREATE TABLE hotstar_api_tokens (
  id BIGSERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,

  INDEX idx_expires_at (expires_at),
  INDEX idx_is_active (is_active)
);
```

---

## 🚀 Initial Ingestion Process

### Phase 1: Database Setup

```bash
# 1. Create separate database
createdb hotstar_source

# 2. Run migrations
psql hotstar_source < migrations/001_create_hotstar_movies.sql
psql hotstar_source < migrations/002_create_sync_log.sql
psql hotstar_source < migrations/003_create_api_tokens.sql
```

### Phase 2: Initial Full Ingestion

**Script:** `scripts/ingest-hotstar-movies.py`

```python
#!/usr/bin/env python3
"""
Initial full ingestion of all Hotstar movies
Time: ~1-2 minutes for 51,495 movies
"""

import os
import time
import json
import psycopg2
from datetime import datetime
from typing import List, Dict, Optional
import subprocess

# Database connection
DB_CONFIG = {
    'dbname': 'hotstar_source',
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432')
}

# API configuration
HOTSTAR_API_BASE = 'https://pp-catalog-api.hotstar.com'
PARTNER_ID = '92837456123'
RATE_LIMIT_DELAY = 1.0  # seconds
CIRCUIT_BREAKER_WAIT = 60  # seconds

class HotstarIngestion:
    def __init__(self):
        self.conn = psycopg2.connect(**DB_CONFIG)
        self.cursor = self.conn.cursor()
        self.token = self.generate_fresh_token()
        self.sync_log_id = None

    def generate_fresh_token(self) -> str:
        """Generate fresh Akamai token"""
        result = subprocess.run(
            ['python3', 'scripts/generate-token.py'],
            capture_output=True,
            text=True
        )

        # Extract token from output
        for line in result.stdout.split('\n'):
            if line.startswith('st='):
                token = line.strip()

                # Save to database
                expires_at = datetime.now() + timedelta(seconds=2000)
                self.cursor.execute("""
                    INSERT INTO hotstar_api_tokens
                    (token, expires_at, is_active)
                    VALUES (%s, %s, true)
                """, (token, expires_at))
                self.conn.commit()

                return token

        raise Exception("Failed to generate token")

    def fetch_movies_batch(self, offset: int = 0, size: int = 1000,
                          from_date: Optional[int] = None,
                          to_date: Optional[int] = None) -> Dict:
        """Fetch a batch of movies from Hotstar API"""
        import requests

        params = {
            'partner': PARTNER_ID,
            'orderBy': 'contentId',
            'order': 'desc',
            'offset': offset,
            'size': size
        }

        if from_date:
            params['fromStartDate'] = from_date
        if to_date:
            params['toStartDate'] = to_date

        headers = {
            'x-country-code': 'in',
            'x-platform-code': 'ANDROID',
            'x-partner-name': PARTNER_ID,
            'x-region-code': 'DL',
            'x-client-code': 'pt',
            'hdnea': self.token
        }

        response = requests.get(
            f'{HOTSTAR_API_BASE}/movie/search',
            params=params,
            headers=headers,
            timeout=30
        )

        if response.status_code == 403:
            # Token expired, regenerate
            print("Token expired, regenerating...")
            self.token = self.generate_fresh_token()
            return self.fetch_movies_batch(offset, size, from_date, to_date)

        response.raise_for_status()
        return response.json()

    def save_movie(self, movie: Dict) -> None:
        """Save a single movie to database"""
        self.cursor.execute("""
            INSERT INTO hotstar_movies (
                hotstar_id, content_id, title, description, content_type,
                year, duration, genre, lang, lang_objs,
                premium, vip, paid, asset_status,
                start_date, end_date, broadcast_date,
                thumbnail, portrait_thumbnail, images, source_images,
                deep_link_url, deep_link_url_living_room, play_uri, locators,
                actors, directors, producers, anchors,
                search_keywords, trailers, trailer_deep_links,
                parental_rating, parental_rating_name,
                channel_object, api_update_date, raw_response
            ) VALUES (
                %(id)s, %(contentId)s, %(title)s, %(description)s, %(contentType)s,
                %(year)s, %(duration)s, %(genre)s, %(lang)s, %(langObjs)s,
                %(premium)s, %(vip)s, %(paid)s, %(assetStatus)s,
                %(startDate)s, %(endDate)s, %(broadCastDate)s,
                %(thumbnail)s, %(portraitThumbnail)s, %(images)s, %(sourceImages)s,
                %(deepLinkUrl)s, %(deepLinkUrlForLivingRoom)s, %(playUri)s, %(locators)s,
                %(actors)s, %(directors)s, %(producers)s, %(anchors)s,
                %(searchKeywords)s, %(trailers)s, %(trailerDeeplinks)s,
                %(parentalRating)s, %(parentalRatingName)s,
                %(channelObject)s, %(updateDate)s, %(raw)s
            )
            ON CONFLICT (content_id) DO UPDATE SET
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                year = EXCLUDED.year,
                duration = EXCLUDED.duration,
                genre = EXCLUDED.genre,
                lang = EXCLUDED.lang,
                lang_objs = EXCLUDED.lang_objs,
                premium = EXCLUDED.premium,
                vip = EXCLUDED.vip,
                paid = EXCLUDED.paid,
                asset_status = EXCLUDED.asset_status,
                start_date = EXCLUDED.start_date,
                end_date = EXCLUDED.end_date,
                thumbnail = EXCLUDED.thumbnail,
                portrait_thumbnail = EXCLUDED.portrait_thumbnail,
                images = EXCLUDED.images,
                source_images = EXCLUDED.source_images,
                deep_link_url = EXCLUDED.deep_link_url,
                play_uri = EXCLUDED.play_uri,
                locators = EXCLUDED.locators,
                actors = EXCLUDED.actors,
                directors = EXCLUDED.directors,
                search_keywords = EXCLUDED.search_keywords,
                parental_rating = EXCLUDED.parental_rating,
                parental_rating_name = EXCLUDED.parental_rating_name,
                channel_object = EXCLUDED.channel_object,
                api_update_date = EXCLUDED.api_update_date,
                raw_response = EXCLUDED.raw_response,
                last_synced_at = CURRENT_TIMESTAMP
        """, {
            **movie,
            'raw': json.dumps(movie),
            'genre': json.dumps(movie.get('genre', [])),
            'lang': json.dumps(movie.get('lang', [])),
            'langObjs': json.dumps(movie.get('langObjs', [])),
            'images': json.dumps(movie.get('images', [])),
            'sourceImages': json.dumps(movie.get('sourceImages', [])),
            'locators': json.dumps(movie.get('locators', [])),
            'actors': json.dumps(movie.get('actors', [])),
            'directors': json.dumps(movie.get('directors', [])),
            'producers': json.dumps(movie.get('producers', [])),
            'anchors': json.dumps(movie.get('anchors', [])),
            'searchKeywords': json.dumps(movie.get('searchKeywords', [])),
            'trailers': json.dumps(movie.get('trailers', [])),
            'trailerDeeplinks': json.dumps(movie.get('trailerDeeplinks', [])),
            'channelObject': json.dumps(movie.get('channelObject')),
            'broadCastDate': movie.get('broadCastDate'),
            'portraitThumbnail': movie.get('portraitThumbnail'),
            'deepLinkUrlForLivingRoom': movie.get('deepLinkUrlForLivingRoom'),
            'playUri': movie.get('playUri')
        })

    def start_sync_log(self, sync_type: str) -> int:
        """Create a sync log entry"""
        self.cursor.execute("""
            INSERT INTO hotstar_sync_log (sync_type, started_at, status)
            VALUES (%s, %s, 'running')
            RETURNING id
        """, (sync_type, datetime.now()))

        self.conn.commit()
        return self.cursor.fetchone()[0]

    def update_sync_log(self, sync_log_id: int, **kwargs):
        """Update sync log with statistics"""
        set_clauses = []
        values = []

        for key, value in kwargs.items():
            set_clauses.append(f"{key} = %s")
            values.append(value)

        values.append(sync_log_id)

        self.cursor.execute(f"""
            UPDATE hotstar_sync_log
            SET {', '.join(set_clauses)}
            WHERE id = %s
        """, values)

        self.conn.commit()

    def ingest_all_movies(self):
        """Main ingestion function"""
        print("="*60)
        print("HOTSTAR MOVIE INGESTION - INITIAL FULL SYNC")
        print("="*60)

        start_time = time.time()
        self.sync_log_id = self.start_sync_log('initial')

        total_movies = 0
        items_added = 0
        items_updated = 0
        api_requests = 0
        errors = []

        try:
            # Phase 1: First 10,000 movies (simple pagination)
            print("\n📥 Phase 1: Fetching first 10,000 movies...")
            print("-" * 60)

            for offset in range(0, 10000, 1000):
                batch_num = offset // 1000 + 1
                print(f"  Batch {batch_num}/10: Movies {offset:,} to {offset+1000:,}")

                try:
                    data = self.fetch_movies_batch(offset=offset, size=1000)
                    api_requests += 1

                    movies = data['body']['results']['items']

                    for movie in movies:
                        try:
                            self.save_movie(movie)
                            total_movies += 1
                            # Check if it was insert or update based on rowcount
                            # Simplified: count all as added for initial sync
                            items_added += 1
                        except Exception as e:
                            errors.append({
                                'movie_id': movie.get('contentId'),
                                'error': str(e)
                            })

                    self.conn.commit()
                    print(f"  ✓ Saved {len(movies)} movies (Total: {total_movies:,})")

                except Exception as e:
                    print(f"  ✗ Error: {e}")
                    errors.append({'batch': batch_num, 'error': str(e)})
                    time.sleep(CIRCUIT_BREAKER_WAIT)
                    continue

                time.sleep(RATE_LIMIT_DELAY)

            # Phase 2: Remaining movies (date-based)
            print(f"\n📥 Phase 2: Fetching remaining movies (date-based)...")
            print("-" * 60)

            date_ranges = [
                (2024, 2025, "2024-2025"),
                (2023, 2024, "2023"),
                (2022, 2023, "2022"),
                (2021, 2022, "2021"),
                (2020, 2021, "2020"),
                (2019, 2020, "2019"),
                (2018, 2019, "2018"),
                (2017, 2018, "2017"),
                (2016, 2017, "2016"),
                (2010, 2016, "2010-2015"),
                (2000, 2010, "2000-2009"),
                (1990, 2000, "1990-1999"),
            ]

            for from_year, to_year, label in date_ranges:
                print(f"\n  📅 Fetching {label} movies...")

                from_date = int(datetime(from_year, 1, 1).timestamp())
                to_date = int(datetime(to_year, 12, 31, 23, 59, 59).timestamp())

                offset = 0
                batch_count = 0

                while True:
                    try:
                        data = self.fetch_movies_batch(
                            offset=offset,
                            size=1000,
                            from_date=from_date,
                            to_date=to_date
                        )
                        api_requests += 1

                        movies = data['body']['results']['items']
                        if not movies:
                            break

                        batch_count += 1

                        for movie in movies:
                            try:
                                self.save_movie(movie)
                                total_movies += 1
                                items_added += 1
                            except Exception as e:
                                errors.append({
                                    'movie_id': movie.get('contentId'),
                                    'error': str(e)
                                })

                        self.conn.commit()
                        print(f"    Batch {batch_count}: +{len(movies)} movies (Total: {total_movies:,})")

                        offset += 1000

                        if len(movies) < 1000:
                            break

                        # Check pagination limit
                        if offset + 1000 > 10000:
                            break

                    except Exception as e:
                        print(f"    ✗ Error: {e}")
                        errors.append({'year_range': label, 'error': str(e)})
                        time.sleep(CIRCUIT_BREAKER_WAIT)
                        continue

                    time.sleep(RATE_LIMIT_DELAY)

            # Success
            elapsed = time.time() - start_time

            self.update_sync_log(
                self.sync_log_id,
                completed_at=datetime.now(),
                status='completed',
                total_items_fetched=total_movies,
                items_added=items_added,
                items_updated=items_updated,
                api_requests_made=api_requests,
                errors=json.dumps(errors) if errors else None,
                duration_seconds=int(elapsed)
            )

            print("\n" + "="*60)
            print("✅ INGESTION COMPLETE!")
            print("="*60)
            print(f"  Total Movies:     {total_movies:,}")
            print(f"  Items Added:      {items_added:,}")
            print(f"  Items Updated:    {items_updated:,}")
            print(f"  API Requests:     {api_requests:,}")
            print(f"  Errors:           {len(errors)}")
            print(f"  Time Taken:       {elapsed:.1f}s ({elapsed/60:.1f} min)")
            print("="*60)

        except Exception as e:
            elapsed = time.time() - start_time

            self.update_sync_log(
                self.sync_log_id,
                completed_at=datetime.now(),
                status='failed',
                total_items_fetched=total_movies,
                items_added=items_added,
                api_requests_made=api_requests,
                errors=json.dumps(errors + [{'fatal': str(e)}]),
                duration_seconds=int(elapsed)
            )

            print(f"\n❌ INGESTION FAILED: {e}")
            raise

        finally:
            self.cursor.close()
            self.conn.close()

def main():
    ingestion = HotstarIngestion()
    ingestion.ingest_all_movies()

if __name__ == '__main__':
    main()
```

---

## 🔄 Daily Sync Process

### Strategy: Incremental Updates

**Script:** `scripts/sync-hotstar-daily.py`

```python
#!/usr/bin/env python3
"""
Daily incremental sync for Hotstar movies
Detects: New additions, Updates, Deletions
Time: ~5-10 seconds per run
"""

from datetime import datetime, timedelta
import time

class HotstarDailySync(HotstarIngestion):

    def get_last_sync_time(self) -> int:
        """Get timestamp of last successful sync"""
        self.cursor.execute("""
            SELECT MAX(to_update_date)
            FROM hotstar_sync_log
            WHERE status = 'completed'
            AND sync_type IN ('initial', 'incremental', 'daily')
        """)

        result = self.cursor.fetchone()[0]

        if result:
            return result
        else:
            # Default to 24 hours ago
            return int((datetime.now() - timedelta(hours=24)).timestamp())

    def fetch_incremental_updates(self, from_date: int, to_date: int) -> List[Dict]:
        """Fetch movies updated in time window"""
        all_movies = []
        offset = 0

        while True:
            data = self.fetch_movies_batch(offset=offset, size=1000)
            movies = data['body']['results']['items']

            if not movies:
                break

            # Filter by updateDate
            filtered = [
                m for m in movies
                if from_date <= m.get('updateDate', 0) <= to_date
            ]

            all_movies.extend(filtered)

            offset += 1000

            if len(movies) < 1000:
                break

            if offset >= 10000:
                break

            time.sleep(RATE_LIMIT_DELAY)

        return all_movies

    def detect_deletions(self, active_content_ids: List[str]) -> List[str]:
        """Detect movies that no longer exist in Hotstar"""
        self.cursor.execute("""
            SELECT content_id
            FROM hotstar_movies
            WHERE is_deleted = false
            AND asset_status = 'PUBLISHED'
        """)

        existing_ids = {row[0] for row in self.cursor.fetchall()}
        active_ids = set(active_content_ids)

        deleted_ids = existing_ids - active_ids

        return list(deleted_ids)

    def mark_as_deleted(self, content_ids: List[str]) -> int:
        """Mark movies as deleted"""
        if not content_ids:
            return 0

        self.cursor.execute("""
            UPDATE hotstar_movies
            SET is_deleted = true,
                deleted_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE content_id = ANY(%s)
        """, (content_ids,))

        self.conn.commit()
        return len(content_ids)

    def daily_sync(self):
        """Main daily sync function"""
        print("="*60)
        print("HOTSTAR DAILY SYNC")
        print("="*60)

        start_time = time.time()
        sync_log_id = self.start_sync_log('daily')

        # Time window: last sync to now
        from_date = self.get_last_sync_time()
        to_date = int(datetime.now().timestamp())

        print(f"\n📅 Time Window:")
        print(f"  From: {datetime.fromtimestamp(from_date)}")
        print(f"  To:   {datetime.fromtimestamp(to_date)}")

        total_fetched = 0
        items_added = 0
        items_updated = 0
        items_deleted = 0
        api_requests = 0
        errors = []

        try:
            # Fetch incremental updates
            print(f"\n📥 Fetching updated movies...")

            data = self.fetch_movies_batch(
                offset=0,
                size=1000,
                from_date=from_date,
                to_date=to_date
            )
            api_requests += 1

            movies = data['body']['results']['items']
            total_fetched = len(movies)

            print(f"  Found {total_fetched} updated movies")

            # Process updates
            for movie in movies:
                try:
                    # Check if movie exists
                    self.cursor.execute("""
                        SELECT id FROM hotstar_movies
                        WHERE content_id = %s
                    """, (movie['contentId'],))

                    exists = self.cursor.fetchone()

                    self.save_movie(movie)

                    if exists:
                        items_updated += 1
                    else:
                        items_added += 1

                except Exception as e:
                    errors.append({
                        'movie_id': movie.get('contentId'),
                        'error': str(e)
                    })

            self.conn.commit()

            print(f"  ✓ Added: {items_added}")
            print(f"  ✓ Updated: {items_updated}")

            # Detect deletions (sample check - every 7 days do full scan)
            day_of_week = datetime.now().weekday()

            if day_of_week == 0:  # Monday
                print(f"\n🗑️  Checking for deletions (weekly check)...")

                # Get all current active content IDs from API
                print(f"  Fetching all active content IDs...")
                all_active_ids = []
                offset = 0

                while offset < 10000:
                    data = self.fetch_movies_batch(offset=offset, size=1000)
                    api_requests += 1

                    movies = data['body']['results']['items']
                    if not movies:
                        break

                    all_active_ids.extend([m['contentId'] for m in movies])

                    offset += 1000

                    if len(movies) < 1000:
                        break

                    time.sleep(RATE_LIMIT_DELAY)

                print(f"  Found {len(all_active_ids)} active movies")

                # Detect deletions
                deleted_ids = self.detect_deletions(all_active_ids)

                if deleted_ids:
                    print(f"  Found {len(deleted_ids)} deleted movies")
                    items_deleted = self.mark_as_deleted(deleted_ids)
                    print(f"  ✓ Marked {items_deleted} as deleted")
                else:
                    print(f"  No deletions detected")

            # Success
            elapsed = time.time() - start_time

            self.update_sync_log(
                sync_log_id,
                completed_at=datetime.now(),
                status='completed',
                total_items_fetched=total_fetched,
                items_added=items_added,
                items_updated=items_updated,
                items_deleted=items_deleted,
                api_requests_made=api_requests,
                from_update_date=from_date,
                to_update_date=to_date,
                errors=json.dumps(errors) if errors else None,
                duration_seconds=int(elapsed)
            )

            print("\n" + "="*60)
            print("✅ DAILY SYNC COMPLETE!")
            print("="*60)
            print(f"  Fetched:          {total_fetched:,}")
            print(f"  Added:            {items_added:,}")
            print(f"  Updated:          {items_updated:,}")
            print(f"  Deleted:          {items_deleted:,}")
            print(f"  API Requests:     {api_requests:,}")
            print(f"  Time Taken:       {elapsed:.1f}s")
            print("="*60)

        except Exception as e:
            elapsed = time.time() - start_time

            self.update_sync_log(
                sync_log_id,
                completed_at=datetime.now(),
                status='failed',
                total_items_fetched=total_fetched,
                items_added=items_added,
                items_updated=items_updated,
                api_requests_made=api_requests,
                from_update_date=from_date,
                to_update_date=to_date,
                errors=json.dumps(errors + [{'fatal': str(e)}]),
                duration_seconds=int(elapsed)
            )

            print(f"\n❌ DAILY SYNC FAILED: {e}")
            raise

        finally:
            self.cursor.close()
            self.conn.close()

def main():
    sync = HotstarDailySync()
    sync.daily_sync()

if __name__ == '__main__':
    main()
```

---

## ⏰ Scheduling

### Cron Job Setup

```bash
# Edit crontab
crontab -e

# Add daily sync at 2 AM IST
0 2 * * * cd /path/to/tldrcontent && python3 scripts/sync-hotstar-daily.py >> logs/hotstar-sync.log 2>&1

# Add token refresh every 30 minutes
*/30 * * * * cd /path/to/tldrcontent && python3 scripts/generate-token.py > /tmp/hotstar-token-latest.txt 2>&1
```

### Alternative: Node.js Cron (for Next.js integration)

```typescript
// server/jobs/hotstar-sync.ts
import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Daily sync at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Starting Hotstar daily sync...');

  try {
    const { stdout, stderr } = await execAsync(
      'python3 scripts/sync-hotstar-daily.py'
    );

    console.log('Hotstar sync completed:', stdout);

    if (stderr) {
      console.error('Sync errors:', stderr);
    }
  } catch (error) {
    console.error('Hotstar sync failed:', error);
    // Send alert (email, Slack, etc.)
  }
});

// Token refresh every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  try {
    await execAsync('python3 scripts/generate-token.py');
    console.log('Token refreshed');
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
});
```

---

## 📊 Monitoring & Alerts

### Query Sync Status

```sql
-- Get latest sync status
SELECT
  sync_type,
  started_at,
  completed_at,
  status,
  items_added,
  items_updated,
  items_deleted,
  duration_seconds,
  api_requests_made
FROM hotstar_sync_log
ORDER BY started_at DESC
LIMIT 10;

-- Get daily statistics
SELECT
  DATE(started_at) as date,
  COUNT(*) as syncs,
  SUM(items_added) as total_added,
  SUM(items_updated) as total_updated,
  SUM(items_deleted) as total_deleted,
  AVG(duration_seconds) as avg_duration
FROM hotstar_sync_log
WHERE sync_type = 'daily'
AND status = 'completed'
GROUP BY DATE(started_at)
ORDER BY date DESC
LIMIT 30;
```

### Alert Script

```python
# scripts/check-sync-health.py
def check_sync_health():
    """Check if sync is running properly"""
    cursor.execute("""
        SELECT started_at, status
        FROM hotstar_sync_log
        WHERE sync_type = 'daily'
        ORDER BY started_at DESC
        LIMIT 1
    """)

    last_sync = cursor.fetchone()

    if not last_sync:
        send_alert("No Hotstar sync found!")
        return

    started_at, status = last_sync
    hours_since_sync = (datetime.now() - started_at).total_seconds() / 3600

    if hours_since_sync > 26:  # Should run daily
        send_alert(f"Last Hotstar sync was {hours_since_sync:.1f} hours ago!")

    if status == 'failed':
        send_alert(f"Last Hotstar sync failed at {started_at}")

    if status == 'running':
        # Check if stuck
        if hours_since_sync > 1:
            send_alert(f"Hotstar sync stuck in 'running' state for {hours_since_sync:.1f} hours")
```

---

## 🔍 Deletion Detection Strategy

### Three-Tier Approach

**1. Weekly Full Scan (Monday)**
- Fetch all current content IDs from API
- Compare with database
- Mark missing items as deleted

**2. Status Change Detection (Daily)**
- Check `assetStatus` field
- Mark `UNPUBLISHED` items as soft-deleted

**3. End Date Check (Daily)**
- Check `endDate` field
- Mark expired content

```sql
-- Mark expired content
UPDATE hotstar_movies
SET is_deleted = true,
    deleted_at = CURRENT_TIMESTAMP
WHERE end_date < EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)
AND is_deleted = false;
```

---

## 📈 Performance Metrics

### Expected Performance

| Operation | Time | API Calls |
|-----------|------|-----------|
| **Initial Full Sync** | 1-2 minutes | 52 requests |
| **Daily Sync (typical)** | 5-10 seconds | 1-2 requests |
| **Daily Sync (with deletions)** | 60-90 seconds | 10-12 requests |
| **Weekly Deletion Check** | 60 seconds | 10 requests |

---

## 🎯 Summary

### Initial Setup
1. Create separate `hotstar_source` database
2. Run migrations
3. Execute initial ingestion (1-2 minutes)
4. Set up cron job for daily sync

### Daily Operations
- **2 AM IST:** Daily sync runs automatically
- **Typical time:** 5-10 seconds
- **New movies:** Detected and added
- **Updates:** Detected and synced
- **Deletions:** Marked (weekly full scan)

### Data Preservation
- ✅ All metadata saved
- ✅ Raw JSON response stored
- ✅ Complete audit trail
- ✅ Deletion tracking
- ✅ Separate source database

---

**Ready to implement!** 🚀

Next: Run initial ingestion and set up cron job.
