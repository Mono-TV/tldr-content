#!/usr/bin/env python3
"""
Initial full ingestion of all Hotstar TV shows
Time: TBD based on total count (ignoring episodes for now)

Usage:
    python3 scripts/ingest-hotstar-shows.py

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


class HotstarShowsIngestion:
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
            print(f"   stderr: {e.stderr}")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Token generation error: {e}")
            sys.exit(1)

    def fetch_shows_batch(self, offset: int = 0, size: int = 1000,
                          from_date: Optional[int] = None,
                          to_date: Optional[int] = None) -> Dict:
        """Fetch a batch of TV shows from Hotstar API"""
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
            f'{HOTSTAR_API_BASE}/show/search',
            params=params,
            headers=headers,
            timeout=30
        )

        if response.status_code == 403:
            # Token expired, regenerate
            print("⚠️  Token expired, regenerating...")
            self.token = self.generate_fresh_token()
            return self.fetch_shows_batch(offset, size, from_date, to_date)

        response.raise_for_status()
        return response.json()

    def save_show(self, show: Dict) -> None:
        """Save a single TV show to database"""
        # Prepare all fields with defaults for missing values
        show_data = {
            'id': show.get('id'),
            'contentId': str(show.get('contentId')),  # Convert to string
            'title': show.get('title'),
            'description': show.get('description'),
            'contentType': show.get('contentType'),
            'season_count': show.get('seasonCount', 0),
            'episode_count': show.get('episodeCount', 0),
            'year': show.get('year'),
            'duration': show.get('duration'),
            'premium': show.get('premium', False),
            'vip': show.get('vip', False),
            'paid': show.get('paid', False),
            'assetStatus': show.get('assetStatus'),
            'startDate': show.get('startDate'),
            'endDate': show.get('endDate'),
            'broadCastDate': show.get('broadCastDate'),
            'thumbnail': show.get('thumbnail'),
            'portraitThumbnail': show.get('portraitThumbnail'),
            'deepLinkUrl': show.get('deepLinkUrl'),
            'deepLinkUrlForLivingRoom': show.get('deepLinkUrlForLivingRoom'),
            'playUri': show.get('playUri'),
            'parentalRating': show.get('parentalRating'),
            'parentalRatingName': show.get('parentalRatingName'),
            'updateDate': show.get('updateDate'),
        }

        # Prepare JSONB fields
        json_fields = {
            'genre': json.dumps(show.get('genre', [])),
            'lang': json.dumps(show.get('lang', [])),
            'langObjs': json.dumps(show.get('langObjs', [])),
            'images': json.dumps(show.get('images', [])),
            'sourceImages': json.dumps(show.get('sourceImages', [])),
            'locators': json.dumps(show.get('locators', [])),
            'actors': json.dumps(show.get('actors', [])),
            'directors': json.dumps(show.get('directors', [])),
            'producers': json.dumps(show.get('producers', [])),
            'anchors': json.dumps(show.get('anchors', [])),
            'searchKeywords': json.dumps(show.get('searchKeywords', [])),
            'trailers': json.dumps(show.get('trailers', [])),
            'trailerDeeplinks': json.dumps(show.get('trailerDeeplinks', [])),
            'channelObject': json.dumps(show.get('channelObject')),
            'raw': json.dumps(show)
        }

        self.cursor.execute("""
            INSERT INTO hotstar_shows (
                hotstar_id, content_id, title, description, content_type,
                season_count, episode_count, year, duration,
                genre, lang, lang_objs,
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
                %(season_count)s, %(episode_count)s, %(year)s, %(duration)s,
                %(genre)s, %(lang)s, %(langObjs)s,
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
                season_count = EXCLUDED.season_count,
                episode_count = EXCLUDED.episode_count,
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
            **show_data,
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

    def ingest_all_shows(self):
        """Main ingestion function"""
        print("=" * 60)
        print("HOTSTAR TV SHOWS INGESTION - INITIAL FULL SYNC")
        print("=" * 60)

        start_time = time.time()
        self.sync_log_id = self.start_sync_log('shows_initial')

        total_shows = 0
        items_added = 0
        items_updated = 0
        api_requests = 0
        errors = []

        try:
            # Phase 1: First 10,000 shows (simple pagination)
            print("\n📥 Phase 1: Fetching first 10,000 TV shows...")
            print("-" * 60)

            for offset in range(0, 10000, 1000):
                batch_num = offset // 1000 + 1
                print(f"  Batch {batch_num}/10: Shows {offset:,} to {offset+1000:,}")

                try:
                    data = self.fetch_shows_batch(offset=offset, size=1000)
                    api_requests += 1

                    shows = data['body']['results']['items']

                    if not shows:
                        print(f"  No more shows found, stopping at offset {offset}")
                        break

                    for show in shows:
                        try:
                            # Check if show exists (convert contentId to string)
                            content_id = str(show['contentId'])
                            self.cursor.execute("""
                                SELECT id FROM hotstar_shows
                                WHERE content_id = %s
                            """, (content_id,))

                            exists = self.cursor.fetchone()

                            self.save_show(show)
                            total_shows += 1

                            if exists:
                                items_updated += 1
                            else:
                                items_added += 1

                        except Exception as e:
                            errors.append({
                                'show_id': show.get('contentId'),
                                'error': str(e)
                            })

                    self.conn.commit()
                    print(f"  ✓ Saved {len(shows)} shows (Total: {total_shows:,})")

                    if len(shows) < 1000:
                        print(f"  Reached end of shows (got {len(shows)} items)")
                        break

                except Exception as e:
                    print(f"  ✗ Error: {e}")
                    errors.append({'batch': batch_num, 'error': str(e)})
                    time.sleep(CIRCUIT_BREAKER_WAIT)
                    continue

                time.sleep(RATE_LIMIT_DELAY)

            # Success
            elapsed = time.time() - start_time

            self.update_sync_log(
                self.sync_log_id,
                completed_at=datetime.now(),
                status='completed',
                total_items_fetched=total_shows,
                items_added=items_added,
                items_updated=items_updated,
                api_requests_made=api_requests,
                errors=json.dumps(errors) if errors else None,
                duration_seconds=int(elapsed)
            )

            print("\n" + "=" * 60)
            print("✅ INGESTION COMPLETE!")
            print("=" * 60)
            print(f"  Total TV Shows:   {total_shows:,}")
            print(f"  Items Added:      {items_added:,}")
            print(f"  Items Updated:    {items_updated:,}")
            print(f"  API Requests:     {api_requests:,}")
            print(f"  Errors:           {len(errors)}")
            print(f"  Time Taken:       {elapsed:.1f}s ({elapsed/60:.1f} min)")
            print("=" * 60)

        except Exception as e:
            elapsed = time.time() - start_time

            self.update_sync_log(
                self.sync_log_id,
                completed_at=datetime.now(),
                status='failed',
                total_items_fetched=total_shows,
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
    print("🚀 Starting Hotstar TV Shows Ingestion...")
    if USE_CLOUD_DB:
        print(f"   Database: Cloud SQL (hotstar_source)")
        print(f"   Connection: {os.getenv('CLOUD_SQL_CONNECTION_NAME', 'Not set')}")
    else:
        print(f"   Database: {DB_CONFIG['dbname']}")
        print(f"   Host: {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    print()

    ingestion = HotstarShowsIngestion()
    ingestion.ingest_all_shows()


if __name__ == '__main__':
    main()
