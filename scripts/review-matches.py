#!/usr/bin/env python3
"""
Manual Review Interface for Low-Confidence IMDb Matches

Usage:
    python3 scripts/review-matches.py                    # Review all pending
    python3 scripts/review-matches.py --confidence 90   # Review matches below 90%
    python3 scripts/review-matches.py --export          # Export to CSV for bulk review
    python3 scripts/review-matches.py --import file.csv # Import reviewed CSV

Controls during review:
    y / Enter  - Accept the suggested match
    n          - Reject and mark for manual search
    s          - Skip (review later)
    m          - Manual entry (enter IMDb ID)
    o          - Open in browser (Hotstar + IMDb search)
    q          - Quit

Requirements:
    pip install pg8000
"""

import argparse
import csv
import os
import sys
import urllib.parse
import webbrowser
from datetime import datetime

import pg8000

# Cloud SQL Configuration
DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 5433,
    "database": "hotstar_source",
    "user": "postgres",
    "password": "HotstarDB2026SecurePass!",
}


def get_connection():
    return pg8000.connect(**DB_CONFIG)


def clear_screen():
    os.system("cls" if os.name == "nt" else "clear")


def print_movie_details(movie: dict, match_details: dict):
    """Print movie details for review"""
    print("=" * 70)
    print("HOTSTAR MOVIE")
    print("=" * 70)
    print(f"  Title:      {movie['title']}")
    print(f"  Year:       {movie['year']}")
    print(
        f"  Duration:   {movie['duration'] // 60 if movie['duration'] else 'N/A'} min"
    )
    print(f"  Language:   {movie['lang']}")
    print(f"  Content ID: {movie['content_id']}")

    if movie.get("actors"):
        actors = (
            movie["actors"][:100] + "..."
            if len(str(movie["actors"])) > 100
            else movie["actors"]
        )
        print(f"  Actors:     {actors}")

    if movie.get("directors"):
        print(f"  Directors:  {movie['directors']}")

    print()
    print("-" * 70)
    print("SUGGESTED MATCH")
    print("-" * 70)

    if match_details:
        print(f"  IMDb ID:    {match_details.get('imdb_id', 'N/A')}")
        print(f"  TMDB Title: {match_details.get('tmdb_title', 'N/A')}")
        print(f"  Confidence: {movie.get('match_confidence', 0)}%")
        print()
        print("  Match Details:")
        print(f"    - Title similarity: {match_details.get('title_similarity', 'N/A')}")
        print(f"    - Year match:       {match_details.get('year_match', 'N/A')}")
        print(f"    - Runtime match:    {match_details.get('runtime_match', 'N/A')}")
        print(f"    - Cast overlap:     {match_details.get('cast_overlap', 'N/A')}")
        print(f"    - Director match:   {match_details.get('director_match', 'N/A')}")
    else:
        print("  No match found")

    print()
    print("=" * 70)


def open_in_browser(movie: dict, imdb_id: str = None):
    """Open Hotstar movie and IMDb search in browser"""
    # IMDb search
    search_query = urllib.parse.quote(f"{movie['title']} {movie['year'] or ''}")
    imdb_search_url = f"https://www.imdb.com/find/?q={search_query}&s=tt&ttype=ft"

    # If we have an IMDb ID, open that directly
    if imdb_id:
        imdb_url = f"https://www.imdb.com/title/{imdb_id}/"
        webbrowser.open(imdb_url)
    else:
        webbrowser.open(imdb_search_url)

    # TMDB search as backup
    tmdb_search_url = f"https://www.themoviedb.org/search?query={search_query}"
    webbrowser.open(tmdb_search_url)


def validate_imdb_id(imdb_id: str) -> bool:
    """Validate IMDb ID format"""
    if not imdb_id:
        return False
    imdb_id = imdb_id.strip().lower()
    if not imdb_id.startswith("tt"):
        return False
    if len(imdb_id) < 9:  # tt + at least 7 digits
        return False
    return imdb_id[2:].isdigit()


def update_match(conn, content_id: str, imdb_id: str, confidence: int, source: str):
    """Update movie with confirmed IMDb ID"""
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE hotstar_movies
        SET imdb_id = %s,
            match_confidence = %s,
            match_source = %s,
            match_date = %s,
            needs_review = FALSE
        WHERE content_id = %s
    """,
        (imdb_id, confidence, source, datetime.now(), content_id),
    )
    conn.commit()


def mark_no_match(conn, content_id: str):
    """Mark movie as having no IMDb match"""
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE hotstar_movies
        SET imdb_id = 'NO_MATCH',
            match_confidence = 0,
            match_source = 'manual_review',
            match_date = %s,
            needs_review = FALSE
        WHERE content_id = %s
    """,
        (datetime.now(), content_id),
    )
    conn.commit()


def get_movies_for_review(conn, max_confidence: int = 100, limit: int = None):
    """Get movies that need review"""
    cursor = conn.cursor()

    query = """
        SELECT content_id, title, year, duration, lang, actors, directors,
               imdb_id, match_confidence, match_source, match_details
        FROM hotstar_movies
        WHERE (needs_review = TRUE OR match_confidence < %s)
          AND (imdb_id IS NULL OR imdb_id NOT IN ('NO_MATCH', 'SKIPPED'))
        ORDER BY match_confidence DESC NULLS LAST, title
    """

    if limit:
        query += f" LIMIT {limit}"

    cursor.execute(query, (max_confidence,))

    movies = []
    for row in cursor.fetchall():
        import json

        match_details = {}
        if row[10]:
            try:
                match_details = (
                    json.loads(row[10]) if isinstance(row[10], str) else row[10]
                )
            except:
                pass

        movies.append(
            {
                "content_id": row[0],
                "title": row[1],
                "year": row[2],
                "duration": row[3],
                "lang": row[4],
                "actors": row[5],
                "directors": row[6],
                "imdb_id": row[7],
                "match_confidence": row[8],
                "match_source": row[9],
                "match_details": match_details,
            }
        )

    return movies


def export_to_csv(conn, filename: str, max_confidence: int = 100):
    """Export movies needing review to CSV"""
    movies = get_movies_for_review(conn, max_confidence)

    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "content_id",
                "title",
                "year",
                "duration_min",
                "language",
                "suggested_imdb_id",
                "confidence",
                "tmdb_title",
                "confirmed_imdb_id",
                "action",  # User fills these
            ]
        )

        for movie in movies:
            writer.writerow(
                [
                    movie["content_id"],
                    movie["title"],
                    movie["year"],
                    movie["duration"] // 60 if movie["duration"] else "",
                    movie["lang"],
                    movie["imdb_id"] or "",
                    movie["match_confidence"] or "",
                    movie.get("match_details", {}).get("tmdb_title", ""),
                    "",  # confirmed_imdb_id - user fills
                    "",  # action (accept/reject/skip) - user fills
                ]
            )

    print(f"✅ Exported {len(movies)} movies to {filename}")
    print()
    print("Instructions:")
    print("  1. Open the CSV in Excel/Google Sheets")
    print("  2. For each row, fill in:")
    print("     - confirmed_imdb_id: The correct IMDb ID (e.g., tt1234567)")
    print("     - action: 'accept' (use suggested), 'confirm' (use confirmed_imdb_id),")
    print("               'reject' (no match), or 'skip' (review later)")
    print(
        "  3. Save and import with: python3 scripts/review-matches.py --import file.csv"
    )


def import_from_csv(conn, filename: str):
    """Import reviewed matches from CSV"""
    updated = 0
    rejected = 0
    skipped = 0
    errors = []

    with open(filename, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            content_id = row["content_id"]
            action = row.get("action", "").strip().lower()
            confirmed_id = row.get("confirmed_imdb_id", "").strip()
            suggested_id = row.get("suggested_imdb_id", "").strip()

            try:
                if action == "accept":
                    if suggested_id and validate_imdb_id(suggested_id):
                        update_match(
                            conn, content_id, suggested_id, 100, "manual_accepted"
                        )
                        updated += 1
                    else:
                        errors.append(f"{content_id}: No valid suggested ID to accept")

                elif action == "confirm":
                    if validate_imdb_id(confirmed_id):
                        update_match(
                            conn, content_id, confirmed_id, 100, "manual_confirmed"
                        )
                        updated += 1
                    else:
                        errors.append(
                            f"{content_id}: Invalid confirmed IMDb ID '{confirmed_id}'"
                        )

                elif action == "reject":
                    mark_no_match(conn, content_id)
                    rejected += 1

                elif action == "skip" or not action:
                    skipped += 1

                else:
                    errors.append(f"{content_id}: Unknown action '{action}'")

            except Exception as e:
                errors.append(f"{content_id}: {str(e)}")

    print(f"✅ Import complete:")
    print(f"   Updated:  {updated}")
    print(f"   Rejected: {rejected}")
    print(f"   Skipped:  {skipped}")

    if errors:
        print(f"   Errors:   {len(errors)}")
        for err in errors[:10]:
            print(f"     - {err}")
        if len(errors) > 10:
            print(f"     ... and {len(errors) - 10} more")


def interactive_review(conn, max_confidence: int = 100, limit: int = None):
    """Interactive terminal-based review"""
    movies = get_movies_for_review(conn, max_confidence, limit)

    if not movies:
        print("✅ No movies need review!")
        return

    print(f"Found {len(movies)} movies to review")
    print()
    print("Controls:")
    print("  y/Enter - Accept suggested match")
    print("  n       - Reject (no IMDb match exists)")
    print("  s       - Skip (review later)")
    print("  m       - Manual entry")
    print("  o       - Open in browser")
    print("  q       - Quit")
    print()
    input("Press Enter to start...")

    reviewed = 0
    accepted = 0
    rejected = 0
    manual = 0

    for i, movie in enumerate(movies):
        clear_screen()
        print(
            f"Review {i + 1}/{len(movies)} | Accepted: {accepted} | Rejected: {rejected} | Manual: {manual}"
        )
        print()

        print_movie_details(movie, movie.get("match_details", {}))

        print()
        print(
            "[y/Enter] Accept  [n] Reject  [s] Skip  [m] Manual  [o] Open browser  [q] Quit"
        )

        while True:
            choice = input("> ").strip().lower()

            if choice in ("y", ""):
                # Accept suggested match
                if movie.get("imdb_id") and validate_imdb_id(movie["imdb_id"]):
                    update_match(
                        conn,
                        movie["content_id"],
                        movie["imdb_id"],
                        100,
                        "manual_accepted",
                    )
                    accepted += 1
                    reviewed += 1
                    break
                else:
                    print(
                        "No valid suggested IMDb ID. Use 'm' for manual entry or 'n' to reject."
                    )

            elif choice == "n":
                mark_no_match(conn, movie["content_id"])
                rejected += 1
                reviewed += 1
                break

            elif choice == "s":
                reviewed += 1
                break

            elif choice == "m":
                imdb_id = input("Enter IMDb ID (e.g., tt1234567): ").strip()
                if validate_imdb_id(imdb_id):
                    update_match(
                        conn, movie["content_id"], imdb_id, 100, "manual_entry"
                    )
                    manual += 1
                    reviewed += 1
                    break
                else:
                    print("Invalid IMDb ID format. Should be like 'tt1234567'")

            elif choice == "o":
                open_in_browser(movie, movie.get("imdb_id"))
                print("Opened in browser. Make your choice when ready.")

            elif choice == "q":
                print()
                print(
                    f"Session ended. Reviewed: {reviewed}, Accepted: {accepted}, Rejected: {rejected}, Manual: {manual}"
                )
                return

            else:
                print("Invalid choice. Use y/n/s/m/o/q")

    print()
    print("=" * 50)
    print("REVIEW COMPLETE")
    print("=" * 50)
    print(f"  Total reviewed: {reviewed}")
    print(f"  Accepted:       {accepted}")
    print(f"  Rejected:       {rejected}")
    print(f"  Manual:         {manual}")


def show_stats(conn):
    """Show matching statistics"""
    cursor = conn.cursor()

    # Total movies
    cursor.execute("SELECT COUNT(*) FROM hotstar_movies")
    total = cursor.fetchone()[0]

    # Matched
    cursor.execute(
        "SELECT COUNT(*) FROM hotstar_movies WHERE imdb_id IS NOT NULL AND imdb_id != '' AND imdb_id != 'NO_MATCH'"
    )
    matched = cursor.fetchone()[0]

    # By confidence
    cursor.execute("""
        SELECT
            CASE
                WHEN match_confidence >= 95 THEN '95-100%'
                WHEN match_confidence >= 90 THEN '90-94%'
                WHEN match_confidence >= 80 THEN '80-89%'
                WHEN match_confidence >= 70 THEN '70-79%'
                WHEN match_confidence < 70 THEN 'Below 70%'
                ELSE 'Unmatched'
            END as confidence_range,
            COUNT(*) as count
        FROM hotstar_movies
        GROUP BY confidence_range
        ORDER BY confidence_range DESC
    """)

    print("=" * 50)
    print("MATCHING STATISTICS")
    print("=" * 50)
    print(f"  Total movies:   {total:,}")
    print(f"  Matched:        {matched:,} ({matched * 100 // total}%)")
    print(f"  Unmatched:      {total - matched:,}")
    print()
    print("  By Confidence:")
    for row in cursor.fetchall():
        print(f"    {row[0]}: {row[1]:,}")

    # Needs review
    cursor.execute("SELECT COUNT(*) FROM hotstar_movies WHERE needs_review = TRUE")
    needs_review = cursor.fetchone()[0]
    print()
    print(f"  Needs review:   {needs_review:,}")


def main():
    parser = argparse.ArgumentParser(description="Review and correct IMDb matches")
    parser.add_argument(
        "--confidence",
        type=int,
        default=100,
        help="Review matches below this confidence level",
    )
    parser.add_argument(
        "--limit", type=int, default=None, help="Limit number of movies to review"
    )
    parser.add_argument(
        "--export", type=str, metavar="FILE", help="Export to CSV for bulk review"
    )
    parser.add_argument(
        "--import",
        dest="import_file",
        type=str,
        metavar="FILE",
        help="Import reviewed CSV",
    )
    parser.add_argument("--stats", action="store_true", help="Show matching statistics")
    args = parser.parse_args()

    try:
        conn = get_connection()
        print("✅ Connected to database")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("   Make sure Cloud SQL Proxy is running on port 5433")
        sys.exit(1)

    if args.stats:
        show_stats(conn)
    elif args.export:
        export_to_csv(conn, args.export, args.confidence)
    elif args.import_file:
        import_from_csv(conn, args.import_file)
    else:
        interactive_review(conn, args.confidence, args.limit)

    conn.close()


if __name__ == "__main__":
    main()
