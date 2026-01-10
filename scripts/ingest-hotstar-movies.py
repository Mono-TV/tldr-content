#!/usr/bin/env python3
"""
Initial full ingestion of all Hotstar movies
Time: ~1-2 minutes for 51,495 movies

Usage:
    python3 scripts/ingest-hotstar-movies.py

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


class HotstarIngestion:
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

                    # Save to database
                    expires_at = datetime.now() + timedelta(seconds=2000)
                    self.cursor.execute("""
                        INSERT INTO hotstar_api_tokens
                        (token, expires_at, is_active)
                        VALUES (%s, %s, true)
                    """, (token, expires_at))
                    self.conn.commit()

                    return token

            raise Exception("No token found in generate-token.py output")

        except subprocess.CalledProcessError as e:
            print(f"❌ Token generation failed: {e}")
            print(f"   stderr: {e.stderr}")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Token generation error: {e}")
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
            print("⚠️  Token expired, regenerating...")
            self.token = self.generate_fresh_token()
            return self.fetch_movies_batch(offset, size, from_date, to_date)

        response.raise_for_status()
        return response.json()

    def save_movie(self, movie: Dict) -> None:
        """Save a single movie to database"""
        # Convert None values and prepare JSONB fields
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
            **movie,
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

    def ingest_all_movies(self):
        """Main ingestion function"""
        print("=" * 60)
        print("HOTSTAR MOVIE INGESTION - INITIAL FULL SYNC")
        print("=" * 60)

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

            print("\n" + "=" * 60)
            print("✅ INGESTION COMPLETE!")
            print("=" * 60)
            print(f"  Total Movies:     {total_movies:,}")
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
    print("🚀 Starting Hotstar Movie Ingestion...")
    if USE_CLOUD_DB:
        print(f"   Database: Cloud SQL (hotstar_source)")
        print(f"   Connection: {os.getenv('CLOUD_SQL_CONNECTION_NAME', 'Not set')}")
    else:
        print(f"   Database: {DB_CONFIG['dbname']}")
        print(f"   Host: {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    print()

    ingestion = HotstarIngestion()
    ingestion.ingest_all_movies()


if __name__ == '__main__':
    main()
