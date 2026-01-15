#!/usr/bin/env python3
"""
IMDb Matching Script for Hotstar Movies
Matches Hotstar movies to IMDb IDs using TMDB API

Usage:
    python3 scripts/match-imdb.py [--limit N] [--dry-run] [--offset N]

Requirements:
    pip install requests pg8000 aiohttp asyncio
"""

import argparse
import asyncio
import json
import os
import sys
import time
from dataclasses import dataclass
from datetime import datetime
from difflib import SequenceMatcher
from typing import Dict, List, Optional, Tuple

import aiohttp

# TMDB Configuration
TMDB_API_KEY = "452357e5da52e2ddde20c64414a40637"
TMDB_BASE_URL = "https://api.themoviedb.org/3"

# Rate limiting: 40 requests per 10 seconds
RATE_LIMIT = 40
RATE_WINDOW = 10
CONCURRENT_REQUESTS = 10

# Cloud SQL Configuration (via Cloud SQL Proxy on port 5433)
DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 5433,
    "database": "hotstar_source",
    "user": "postgres",
    "password": "HotstarDB2026SecurePass!",
}


@dataclass
class MatchResult:
    hotstar_content_id: str
    imdb_id: Optional[str]
    tmdb_id: Optional[int]
    confidence: int
    match_source: str
    match_details: Dict


class RateLimiter:
    def __init__(self, rate: int, window: int):
        self.rate = rate
        self.window = window
        self.tokens = rate
        self.last_update = time.time()
        self.lock = asyncio.Lock()

    async def acquire(self):
        async with self.lock:
            now = time.time()
            elapsed = now - self.last_update
            self.tokens = min(
                self.rate, self.tokens + elapsed * (self.rate / self.window)
            )
            self.last_update = now

            if self.tokens < 1:
                wait_time = (1 - self.tokens) * (self.window / self.rate)
                await asyncio.sleep(wait_time)
                self.tokens = 1

            self.tokens -= 1


def normalize_title(title: str) -> str:
    """Normalize title for comparison"""
    if not title:
        return ""

    import re

    # Remove special characters and extra spaces
    title = re.sub(r"[^\w\s]", " ", title.lower())
    title = re.sub(r"\s+", " ", title).strip()

    # Remove common suffixes
    suffixes = ["hindi", "dubbed", "movie", "film", "hd", "4k", "original"]
    for suffix in suffixes:
        title = re.sub(rf"\s+{suffix}$", "", title)

    return title.strip()


def title_similarity(title1: str, title2: str) -> float:
    """Calculate similarity between two titles"""
    t1 = normalize_title(title1)
    t2 = normalize_title(title2)
    return SequenceMatcher(None, t1, t2).ratio()


def parse_actors(actors_json) -> List[str]:
    """Parse actors from JSONB field"""
    if not actors_json:
        return []

    if isinstance(actors_json, str):
        try:
            actors_json = json.loads(actors_json)
        except:
            return []

    if isinstance(actors_json, list):
        # Could be list of strings or list of dicts
        result = []
        for actor in actors_json:
            if isinstance(actor, str):
                result.append(actor.lower().strip())
            elif isinstance(actor, dict):
                name = actor.get("name") or actor.get("title") or ""
                result.append(name.lower().strip())
        return result

    return []


class TMDBMatcher:
    def __init__(self):
        self.rate_limiter = RateLimiter(RATE_LIMIT, RATE_WINDOW)
        self.session: Optional[aiohttp.ClientSession] = None
        self.stats = {
            "total": 0,
            "matched": 0,
            "high_confidence": 0,
            "low_confidence": 0,
            "no_match": 0,
            "errors": 0,
        }

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, *args):
        if self.session:
            await self.session.close()

    async def search_movie(
        self, title: str, year: Optional[int] = None, language: Optional[str] = None
    ) -> List[Dict]:
        """Search TMDB for a movie"""
        await self.rate_limiter.acquire()

        params = {"api_key": TMDB_API_KEY, "query": title, "include_adult": "true"}

        if year:
            params["year"] = year

        # Map Hotstar language codes to TMDB
        lang_map = {
            "Hindi": "hi",
            "English": "en",
            "Telugu": "te",
            "Tamil": "ta",
            "Kannada": "kn",
            "Malayalam": "ml",
            "Bengali": "bn",
            "Marathi": "mr",
            "Gujarati": "gu",
            "Punjabi": "pa",
            "Odia": "or",
            "Bhojpuri": "bh",
        }

        if language and language in lang_map:
            params["language"] = lang_map[language]

        try:
            async with self.session.get(
                f"{TMDB_BASE_URL}/search/movie",
                params=params,
                timeout=aiohttp.ClientTimeout(total=30),
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("results", [])
                elif response.status == 429:
                    # Rate limited, wait and retry
                    await asyncio.sleep(2)
                    return await self.search_movie(title, year, language)
                else:
                    return []
        except Exception as e:
            print(f"  Search error for '{title}': {e}")
            return []

    async def get_movie_details(self, tmdb_id: int) -> Optional[Dict]:
        """Get movie details including credits"""
        await self.rate_limiter.acquire()

        params = {"api_key": TMDB_API_KEY, "append_to_response": "credits,external_ids"}

        try:
            async with self.session.get(
                f"{TMDB_BASE_URL}/movie/{tmdb_id}",
                params=params,
                timeout=aiohttp.ClientTimeout(total=30),
            ) as response:
                if response.status == 200:
                    return await response.json()
                return None
        except Exception as e:
            print(f"  Details error for TMDB {tmdb_id}: {e}")
            return None

    async def get_external_ids(self, tmdb_id: int) -> Optional[str]:
        """Get IMDb ID from TMDB external IDs"""
        await self.rate_limiter.acquire()

        params = {"api_key": TMDB_API_KEY}

        try:
            async with self.session.get(
                f"{TMDB_BASE_URL}/movie/{tmdb_id}/external_ids",
                params=params,
                timeout=aiohttp.ClientTimeout(total=30),
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("imdb_id")
                return None
        except Exception as e:
            print(f"  External IDs error for TMDB {tmdb_id}: {e}")
            return None

    def calculate_match_confidence(
        self,
        hotstar_movie: Dict,
        tmdb_result: Dict,
        tmdb_details: Optional[Dict] = None,
    ) -> Tuple[int, Dict]:
        """Calculate match confidence score"""
        details = {}
        score = 0

        # Title similarity (max 40 points)
        h_title = hotstar_movie.get("title", "")
        t_title = tmdb_result.get("title", "") or tmdb_result.get("original_title", "")

        title_sim = title_similarity(h_title, t_title)
        title_score = int(title_sim * 40)
        score += title_score
        details["title_similarity"] = round(title_sim, 2)
        details["tmdb_title"] = t_title

        # Also check original title
        t_original = tmdb_result.get("original_title", "")
        if t_original and t_original != t_title:
            orig_sim = title_similarity(h_title, t_original)
            if orig_sim > title_sim:
                title_score = int(orig_sim * 40)
                score = score - int(title_sim * 40) + title_score
                details["title_similarity"] = round(orig_sim, 2)
                details["matched_original_title"] = True

        # Year match (max 25 points)
        h_year = hotstar_movie.get("year")
        t_year = (
            tmdb_result.get("release_date", "")[:4]
            if tmdb_result.get("release_date")
            else None
        )

        if h_year and t_year:
            try:
                year_diff = abs(int(h_year) - int(t_year))
                if year_diff == 0:
                    score += 25
                    details["year_match"] = "exact"
                elif year_diff == 1:
                    score += 15
                    details["year_match"] = "off_by_1"
                elif year_diff <= 2:
                    score += 5
                    details["year_match"] = "off_by_2"
                else:
                    details["year_match"] = f"off_by_{year_diff}"
            except:
                pass

        # Runtime match (max 10 points)
        h_duration = hotstar_movie.get("duration")  # in seconds
        if tmdb_details:
            t_runtime = tmdb_details.get("runtime")  # in minutes
            if h_duration and t_runtime:
                h_minutes = h_duration / 60
                runtime_diff = abs(h_minutes - t_runtime)
                if runtime_diff <= 3:
                    score += 10
                    details["runtime_match"] = "exact"
                elif runtime_diff <= 10:
                    score += 5
                    details["runtime_match"] = "close"
                else:
                    details["runtime_match"] = f"off_by_{int(runtime_diff)}_min"

        # Cast overlap (max 15 points)
        if tmdb_details and "credits" in tmdb_details:
            h_actors = set(parse_actors(hotstar_movie.get("actors")))
            t_actors = set()

            for cast in tmdb_details.get("credits", {}).get("cast", [])[:10]:
                t_actors.add(cast.get("name", "").lower().strip())

            if h_actors and t_actors:
                overlap = len(h_actors & t_actors)
                if overlap >= 3:
                    score += 15
                    details["cast_overlap"] = overlap
                elif overlap >= 2:
                    score += 10
                    details["cast_overlap"] = overlap
                elif overlap >= 1:
                    score += 5
                    details["cast_overlap"] = overlap

        # Director match (max 10 points)
        if tmdb_details and "credits" in tmdb_details:
            h_directors = set(parse_actors(hotstar_movie.get("directors")))
            t_directors = set()

            for crew in tmdb_details.get("credits", {}).get("crew", []):
                if crew.get("job") == "Director":
                    t_directors.add(crew.get("name", "").lower().strip())

            if h_directors and t_directors:
                if h_directors & t_directors:
                    score += 10
                    details["director_match"] = True

        return score, details

    async def match_movie(self, hotstar_movie: Dict) -> MatchResult:
        """Match a single Hotstar movie to IMDb"""
        content_id = hotstar_movie.get("content_id", "")
        title = hotstar_movie.get("title", "")
        year = hotstar_movie.get("year")

        # Get primary language
        lang = None
        lang_data = hotstar_movie.get("lang")
        if lang_data:
            if isinstance(lang_data, str):
                try:
                    lang_data = json.loads(lang_data)
                except:
                    pass
            if isinstance(lang_data, list) and lang_data:
                lang = lang_data[0]

        # Search TMDB
        results = await self.search_movie(title, year, lang)

        if not results:
            # Try without year
            results = await self.search_movie(title, None, lang)

        if not results:
            # Try with just title
            results = await self.search_movie(title)

        if not results:
            return MatchResult(
                hotstar_content_id=content_id,
                imdb_id=None,
                tmdb_id=None,
                confidence=0,
                match_source="no_results",
                match_details={"title": title, "year": year},
            )

        # Evaluate top candidates
        best_match = None
        best_score = 0
        best_details = {}

        for result in results[:5]:  # Check top 5 results
            tmdb_id = result.get("id")

            # Get detailed info for better matching
            details = await self.get_movie_details(tmdb_id)

            score, match_details = self.calculate_match_confidence(
                hotstar_movie, result, details
            )

            if score > best_score:
                best_score = score
                best_match = result
                best_details = match_details
                best_details["tmdb_id"] = tmdb_id

                # Get IMDb ID
                if details and "external_ids" in details:
                    best_details["imdb_id"] = details["external_ids"].get("imdb_id")
                else:
                    imdb_id = await self.get_external_ids(tmdb_id)
                    best_details["imdb_id"] = imdb_id

        if best_match:
            imdb_id = best_details.get("imdb_id")

            # Determine confidence level
            if best_score >= 85:
                confidence = 100
            elif best_score >= 70:
                confidence = 95
            elif best_score >= 55:
                confidence = 90
            elif best_score >= 40:
                confidence = 80
            else:
                confidence = best_score

            return MatchResult(
                hotstar_content_id=content_id,
                imdb_id=imdb_id,
                tmdb_id=best_match.get("id"),
                confidence=confidence,
                match_source="tmdb",
                match_details=best_details,
            )

        return MatchResult(
            hotstar_content_id=content_id,
            imdb_id=None,
            tmdb_id=None,
            confidence=0,
            match_source="no_match",
            match_details={"title": title, "year": year},
        )


def print_progress(stats: dict, total: int, start_time: float):
    """Print real-time progress bar and stats"""
    import shutil

    elapsed = time.time() - start_time
    processed = stats["total"]
    rate = processed / elapsed if elapsed > 0 else 0
    eta_seconds = (total - processed) / rate if rate > 0 else 0

    # Calculate percentages
    pct = processed * 100 // total if total > 0 else 0
    match_pct = stats["matched"] * 100 // processed if processed > 0 else 0
    high_conf_pct = (
        stats["high_confidence"] * 100 // stats["matched"]
        if stats["matched"] > 0
        else 0
    )

    # Progress bar
    term_width = shutil.get_terminal_size().columns
    bar_width = min(40, term_width - 60)
    filled = int(bar_width * processed / total) if total > 0 else 0
    bar = "█" * filled + "░" * (bar_width - filled)

    # ETA formatting
    eta_min = int(eta_seconds // 60)
    eta_sec = int(eta_seconds % 60)

    # Clear line and print
    print(
        f"\r[{bar}] {pct:3d}% | {processed:,}/{total:,} | "
        f"✓{stats['matched']:,} ({match_pct}%) | "
        f"High:{high_conf_pct}% | "
        f"{rate:.1f}/s | ETA: {eta_min}m{eta_sec:02d}s   ",
        end="",
        flush=True,
    )


async def process_batch(
    matcher: TMDBMatcher, movies: List[Dict], dry_run: bool = False, conn=None
) -> List[MatchResult]:
    """Process a batch of movies concurrently"""
    tasks = [matcher.match_movie(movie) for movie in movies]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    valid_results = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            print(f"  Error matching movie: {result}")
            matcher.stats["errors"] += 1
            continue

        valid_results.append(result)
        matcher.stats["total"] += 1

        if result.imdb_id:
            matcher.stats["matched"] += 1
            if result.confidence >= 90:
                matcher.stats["high_confidence"] += 1
            else:
                matcher.stats["low_confidence"] += 1
        else:
            matcher.stats["no_match"] += 1

        # Update database
        if not dry_run and conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE hotstar_movies
                SET imdb_id = %s,
                    match_confidence = %s,
                    match_source = %s,
                    match_date = %s,
                    needs_review = %s,
                    match_details = %s
                WHERE content_id = %s
            """,
                (
                    result.imdb_id,
                    result.confidence,
                    result.match_source,
                    datetime.now(),
                    result.confidence < 90,
                    json.dumps(result.match_details),
                    result.hotstar_content_id,
                ),
            )
            conn.commit()

    return valid_results


async def main():
    parser = argparse.ArgumentParser(description="Match Hotstar movies to IMDb IDs")
    parser.add_argument(
        "--limit", type=int, default=None, help="Limit number of movies to process"
    )
    parser.add_argument("--offset", type=int, default=0, help="Offset to start from")
    parser.add_argument("--dry-run", action="store_true", help="Do not update database")
    parser.add_argument(
        "--batch-size",
        type=int,
        default=10,
        help="Batch size for concurrent processing",
    )
    args = parser.parse_args()

    print("=" * 60)
    print("HOTSTAR → IMDB MATCHING")
    print("=" * 60)
    print(f"Dry run: {args.dry_run}")
    print(f"Batch size: {args.batch_size}")
    if args.limit:
        print(f"Limit: {args.limit}")
    print()

    # Connect to database
    import pg8000

    try:
        conn = pg8000.connect(**DB_CONFIG)
        print("✅ Connected to Cloud SQL")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("   Make sure Cloud SQL Proxy is running or IP is whitelisted")
        sys.exit(1)

    cursor = conn.cursor()

    # Check if columns exist, add if not
    try:
        cursor.execute("""
            ALTER TABLE hotstar_movies
            ADD COLUMN IF NOT EXISTS imdb_id VARCHAR(20),
            ADD COLUMN IF NOT EXISTS match_confidence INTEGER,
            ADD COLUMN IF NOT EXISTS match_source VARCHAR(50),
            ADD COLUMN IF NOT EXISTS match_date TIMESTAMP,
            ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS match_details JSONB
        """)
        conn.commit()
    except Exception as e:
        print(f"Note: Could not add columns (may already exist): {e}")
        conn.rollback()

    # Get movies to match
    query = """
        SELECT content_id, title, year, duration, actors, directors, lang
        FROM hotstar_movies
        WHERE imdb_id IS NULL OR imdb_id = ''
        ORDER BY content_id
    """

    if args.limit:
        query += f" LIMIT {args.limit}"
    if args.offset:
        query += f" OFFSET {args.offset}"

    cursor.execute(query)
    rows = cursor.fetchall()

    movies = []
    for row in rows:
        movies.append(
            {
                "content_id": row[0],
                "title": row[1],
                "year": row[2],
                "duration": row[3],
                "actors": row[4],
                "directors": row[5],
                "lang": row[6],
            }
        )

    print(f"📊 Found {len(movies)} movies to match")
    print()

    if not movies:
        print("No movies to process!")
        return

    start_time = time.time()

    total_movies = len(movies)

    async with TMDBMatcher() as matcher:
        # Process in batches
        all_results = []

        print()  # Empty line before progress bar

        for i in range(0, len(movies), args.batch_size):
            batch = movies[i : i + args.batch_size]

            results = await process_batch(
                matcher,
                batch,
                dry_run=args.dry_run,
                conn=conn if not args.dry_run else None,
            )
            all_results.extend(results)

            # Update progress bar
            print_progress(matcher.stats, total_movies, start_time)

        print()  # New line after progress bar
        print()

    elapsed = time.time() - start_time

    # Print final statistics
    print("=" * 60)
    print("MATCHING COMPLETE")
    print("=" * 60)
    print(f"Total processed:    {matcher.stats['total']}")
    print(
        f"Matched:            {matcher.stats['matched']} ({matcher.stats['matched'] * 100 // max(matcher.stats['total'], 1)}%)"
    )
    print(f"  High confidence:  {matcher.stats['high_confidence']}")
    print(f"  Low confidence:   {matcher.stats['low_confidence']}")
    print(f"No match:           {matcher.stats['no_match']}")
    print(f"Errors:             {matcher.stats['errors']}")
    print(f"Time:               {elapsed:.1f}s ({elapsed / 60:.1f} min)")
    print(f"Rate:               {matcher.stats['total'] / elapsed:.1f} movies/sec")
    print("=" * 60)

    # Close database
    cursor.close()
    conn.close()


if __name__ == "__main__":
    asyncio.run(main())
