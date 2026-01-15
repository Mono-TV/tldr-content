#!/usr/bin/env python3
"""
Daily incremental sync for Hotstar movies
Detects: New additions, Updates, Deletions
Time: ~5-10 seconds per run

Usage:
    python3 scripts/sync-hotstar-daily.py

Environment Variables:
    DB_USER - PostgreSQL username (default: postgres)
    DB_PASSWORD - PostgreSQL password
    DB_HOST - PostgreSQL host (default: localhost)
    DB_PORT - PostgreSQL port (default: 5432)
"""

import os
import sys
import time
import json
import psycopg2
import requests
import subprocess
from datetime import datetime, timedelta
from typing import List, Dict, Optional

# Add scripts directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))

# Import cloud database configuration
try:
    from cloud_db_config import get_db_connection
    USE_CLOUD_DB = True
except ImportError:
    USE_CLOUD_DB = False
    # Fallback to hardcoded config
    DB_CONFIG = {
        'dbname': 'hotstar_source',
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD'),
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', '5432')
    }

# API configuration (from environment or defaults)
HOTSTAR_API_BASE = os.getenv('HOTSTAR_API_BASE_URL', 'https://pp-catalog-api.hotstar.com')
PARTNER_ID = os.getenv('HOTSTAR_PARTNER_ID', '92837456123')
HOTSTAR_AKAMAI_SECRET = os.getenv('HOTSTAR_AKAMAI_SECRET', '7073910d5c5f50d16d50bfdfb0ebb156dd37bea138f341a8432c92e569881617')
RATE_LIMIT_DELAY = 1.0  # seconds
CIRCUIT_BREAKER_WAIT = 60  # seconds


class HotstarDailySync:
    def __init__(self):
        try:
            if USE_CLOUD_DB:
                # Use cloud database connection (Cloud SQL)
                self.conn = get_db_connection()
            else:
                # Use local database connection
                self.conn = psycopg2.connect(**DB_CONFIG)

            self.cursor = self.conn.cursor()
            print(f"✅ Database connected")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            print(f"   Make sure 'hotstar_source' database exists")
            if not USE_CLOUD_DB:
                print(f"   Run: createdb hotstar_source")
            sys.exit(1)

        self.token = self.generate_fresh_token()
        self.sync_log_id = None

    def generate_fresh_token(self) -> str:
        """Generate fresh Akamai token"""
        try:
            result = subprocess.run(
                ['python3', 'scripts/generate-token.py'],
                capture_output=True,
                text=True,
                check=True
            )

            # Extract token from output
            for line in result.stdout.split('\n'):
                if line.startswith('st='):
                    token = line.strip()
                    print(f"✅ Token generated successfully")
                    return token

            raise Exception("No token found in generate-token.py output")

        except subprocess.CalledProcessError as e:
            print(f"❌ Token generation failed: {e}")
            sys.exit(1)

    def fetch_movies_batch(self, offset: int = 0, size: int = 1000,
                          from_date: Optional[int] = None,
                          to_date: Optional[int] = None) -> Dict:
        """Fetch a batch of movies from Hotstar API"""
        params = {
            'partner': PARTNER_ID,
            'orderBy': 'contentId',
            'order': 'desc',
            'offset': offset,
            'size': size
        }

        if from_date:
            params['fromUpdateDate'] = from_date
        if to_date:
            params['toUpdateDate'] = to_date

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
            print("⚠️  Token expired, regenerating...")
            self.token = self.generate_fresh_token()
            return self.fetch_movies_batch(offset, size, from_date, to_date)

        response.raise_for_status()
        return response.json()

    def save_movie(self, movie: Dict) -> None:
        """Save a single movie to database"""
        # Prepare all fields with defaults for missing values
        movie_data = {
            'id': movie.get('id'),
            'contentId': movie.get('contentId'),
            'title': movie.get('title'),
            'description': movie.get('description'),
            'contentType': movie.get('contentType'),
            'year': movie.get('year'),
            'duration': movie.get('duration'),
            'premium': movie.get('premium', False),
            'vip': movie.get('vip', False),
            'paid': movie.get('paid', False),
            'assetStatus': movie.get('assetStatus'),
            'startDate': movie.get('startDate'),
            'endDate': movie.get('endDate'),
            'broadCastDate': movie.get('broadCastDate'),  # May be missing
            'thumbnail': movie.get('thumbnail'),
            'portraitThumbnail': movie.get('portraitThumbnail'),
            'deepLinkUrl': movie.get('deepLinkUrl'),
            'deepLinkUrlForLivingRoom': movie.get('deepLinkUrlForLivingRoom'),
            'playUri': movie.get('playUri'),
            'parentalRating': movie.get('parentalRating'),
            'parentalRatingName': movie.get('parentalRatingName'),
            'updateDate': movie.get('updateDate'),
        }

        # Prepare JSONB fields
        json_fields = {
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
            'raw': json.dumps(movie)
        }

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
            **movie_data,
            **json_fields
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
        print("=" * 60)
        print("HOTSTAR DAILY SYNC")
        print("=" * 60)

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

            print("\n" + "=" * 60)
            print("✅ DAILY SYNC COMPLETE!")
            print("=" * 60)
            print(f"  Fetched:          {total_fetched:,}")
            print(f"  Added:            {items_added:,}")
            print(f"  Updated:          {items_updated:,}")
            print(f"  Deleted:          {items_deleted:,}")
            print(f"  API Requests:     {api_requests:,}")
            print(f"  Time Taken:       {elapsed:.1f}s")
            print("=" * 60)

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
    print("🔄 Starting Hotstar Daily Sync...")
    if USE_CLOUD_DB:
        print(f"   Database: Cloud SQL (hotstar_source)")
        print(f"   Connection: {os.getenv('CLOUD_SQL_CONNECTION_NAME', 'Not set')}")
    else:
        print(f"   Database: {DB_CONFIG['dbname']}")
        print(f"   Host: {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    print()

    sync = HotstarDailySync()
    sync.daily_sync()


if __name__ == '__main__':
    main()
