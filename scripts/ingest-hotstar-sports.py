#!/usr/bin/env python3
"""
Initial full ingestion of all Hotstar sports content
Time: TBD based on total count

Usage:
    python3 scripts/ingest-hotstar-sports.py

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


class HotstarSportsIngestion:
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

    def fetch_sports_batch(self, offset: int = 0, size: int = 1000,
                          from_date: Optional[int] = None,
                          to_date: Optional[int] = None) -> Dict:
        """Fetch a batch of sports from Hotstar API"""
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
            f'{HOTSTAR_API_BASE}/sport/search',
            params=params,
            headers=headers,
            timeout=30
        )

        if response.status_code == 403:
            # Token expired, regenerate
            print("⚠️  Token expired, regenerating...")
            self.token = self.generate_fresh_token()
            return self.fetch_sports_batch(offset, size, from_date, to_date)

        response.raise_for_status()
        return response.json()

    def save_sport(self, sport: Dict) -> None:
        """Save a single sport item to database"""
        # Prepare all fields with defaults for missing values
        sport_data = {
            'id': sport.get('id'),
            'contentId': sport.get('contentId'),
            'title': sport.get('title'),
            'description': sport.get('description'),
            'contentType': sport.get('contentType'),
            'sport_type': sport.get('sportType'),
            'tournament': sport.get('tournament'),
            'teams': sport.get('teams'),
            'match_date': sport.get('matchDate'),
            'duration': sport.get('duration'),
            'premium': sport.get('premium', False),
            'vip': sport.get('vip', False),
            'paid': sport.get('paid', False),
            'assetStatus': sport.get('assetStatus'),
            'startDate': sport.get('startDate'),
            'endDate': sport.get('endDate'),
            'broadCastDate': sport.get('broadCastDate'),
            'thumbnail': sport.get('thumbnail'),
            'portraitThumbnail': sport.get('portraitThumbnail'),
            'deepLinkUrl': sport.get('deepLinkUrl'),
            'deepLinkUrlForLivingRoom': sport.get('deepLinkUrlForLivingRoom'),
            'playUri': sport.get('playUri'),
            'parentalRating': sport.get('parentalRating'),
            'parentalRatingName': sport.get('parentalRatingName'),
            'updateDate': sport.get('updateDate'),
        }

        # Prepare JSONB fields
        json_fields = {
            'genre': json.dumps(sport.get('genre', [])),
            'lang': json.dumps(sport.get('lang', [])),
            'langObjs': json.dumps(sport.get('langObjs', [])),
            'images': json.dumps(sport.get('images', [])),
            'sourceImages': json.dumps(sport.get('sourceImages', [])),
            'locators': json.dumps(sport.get('locators', [])),
            'actors': json.dumps(sport.get('actors', [])),
            'directors': json.dumps(sport.get('directors', [])),
            'producers': json.dumps(sport.get('producers', [])),
            'anchors': json.dumps(sport.get('anchors', [])),
            'searchKeywords': json.dumps(sport.get('searchKeywords', [])),
            'trailers': json.dumps(sport.get('trailers', [])),
            'trailerDeeplinks': json.dumps(sport.get('trailerDeeplinks', [])),
            'channelObject': json.dumps(sport.get('channelObject')),
            'raw': json.dumps(sport)
        }

        self.cursor.execute("""
            INSERT INTO hotstar_sports (
                hotstar_id, content_id, title, description, content_type,
                sport_type, tournament, teams, match_date, duration,
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
                %(sport_type)s, %(tournament)s, %(teams)s, %(match_date)s, %(duration)s,
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
                sport_type = EXCLUDED.sport_type,
                tournament = EXCLUDED.tournament,
                teams = EXCLUDED.teams,
                match_date = EXCLUDED.match_date,
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
            **sport_data,
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

    def ingest_all_sports(self):
        """Main ingestion function"""
        print("=" * 60)
        print("HOTSTAR SPORTS INGESTION - INITIAL FULL SYNC")
        print("=" * 60)

        start_time = time.time()
        self.sync_log_id = self.start_sync_log('sports_initial')

        total_sports = 0
        items_added = 0
        items_updated = 0
        api_requests = 0
        errors = []

        try:
            # Phase 1: First 10,000 sports (simple pagination)
            print("\n📥 Phase 1: Fetching first 10,000 sports...")
            print("-" * 60)

            for offset in range(0, 10000, 1000):
                batch_num = offset // 1000 + 1
                print(f"  Batch {batch_num}/10: Sports {offset:,} to {offset+1000:,}")

                try:
                    data = self.fetch_sports_batch(offset=offset, size=1000)
                    api_requests += 1

                    sports = data['body']['results']['items']

                    if not sports:
                        print(f"  No more sports found, stopping at offset {offset}")
                        break

                    for sport in sports:
                        try:
                            # Check if sport exists
                            self.cursor.execute("""
                                SELECT id FROM hotstar_sports
                                WHERE content_id = %s
                            """, (sport['contentId'],))

                            exists = self.cursor.fetchone()

                            self.save_sport(sport)
                            total_sports += 1

                            if exists:
                                items_updated += 1
                            else:
                                items_added += 1

                        except Exception as e:
                            errors.append({
                                'sport_id': sport.get('contentId'),
                                'error': str(e)
                            })

                    self.conn.commit()
                    print(f"  ✓ Saved {len(sports)} sports (Total: {total_sports:,})")

                    if len(sports) < 1000:
                        print(f"  Reached end of sports (got {len(sports)} items)")
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
                total_items_fetched=total_sports,
                items_added=items_added,
                items_updated=items_updated,
                api_requests_made=api_requests,
                errors=json.dumps(errors) if errors else None,
                duration_seconds=int(elapsed)
            )

            print("\n" + "=" * 60)
            print("✅ INGESTION COMPLETE!")
            print("=" * 60)
            print(f"  Total Sports:     {total_sports:,}")
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
                total_items_fetched=total_sports,
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
    print("🚀 Starting Hotstar Sports Ingestion...")
    if USE_CLOUD_DB:
        print(f"   Database: Cloud SQL (hotstar_source)")
        print(f"   Connection: {os.getenv('CLOUD_SQL_CONNECTION_NAME', 'Not set')}")
    else:
        print(f"   Database: {DB_CONFIG['dbname']}")
        print(f"   Host: {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    print()

    ingestion = HotstarSportsIngestion()
    ingestion.ingest_all_sports()


if __name__ == '__main__':
    main()
