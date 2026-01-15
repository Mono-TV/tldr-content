# Hotstar Cloud SQL Database Summary

**Database Instance**: `tldrcontent-hotstar-db`  
**Region**: `asia-south1`  
**Platform**: Google Cloud SQL (PostgreSQL)  
**Last Updated**: January 2025

---

## Overview

The Hotstar content data is stored in a Cloud SQL PostgreSQL database, separate from the main `merged_catalog` MongoDB database. This database contains raw data ingested directly from the Hotstar API.

## Database Tables

| Table | Row Count | Description |
|-------|-----------|-------------|
| `hotstar_movies` | 33,955 | Movies from Hotstar catalog |
| `hotstar_shows` | 6,092 | TV shows/series from Hotstar |
| `hotstar_sports` | TBD | Sports content (matches, events) |
| `hotstar_sync_log` | 11 | Sync history and status logs |

---

## Hotstar Movies (33,955 items)

### Schema (43 columns)

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `content_id` | VARCHAR | Unique Hotstar content ID |
| `title` | VARCHAR | Movie title |
| `show_short_title` | VARCHAR | Short display title |
| `description` | TEXT | Full description |
| `short_description` | TEXT | Brief summary |
| `genre` | VARCHAR | Genre category |
| `sub_genre` | VARCHAR | Sub-genre |
| `lang` | VARCHAR | Primary language |
| `channel_name` | VARCHAR | Source channel |
| `actors` | TEXT | Cast list |
| `director` | VARCHAR | Director name |
| `music_director` | VARCHAR | Music director |
| `release_year` | INTEGER | Year of release |
| `duration_minutes` | INTEGER | Duration in minutes |
| `content_rating` | VARCHAR | Age rating (U, U/A, A, etc.) |
| `asset_status` | VARCHAR | published/unpublished |
| `premium` | BOOLEAN | Premium content flag |
| `entity_type` | VARCHAR | Content type identifier |
| `detail_page_url` | VARCHAR | Web URL for content |
| `playback_uri` | VARCHAR | Streaming playback URI |
| `encrypted_video_id` | VARCHAR | Encrypted video reference |
| `live_content_type` | VARCHAR | Live streaming type |
| `masthead_url` | VARCHAR | Hero image URL |
| `spotlight_url` | VARCHAR | Spotlight image URL |
| `hero_image_url` | VARCHAR | Hero banner URL |
| `images` | JSONB | All image assets (JSON) |
| `deep_links` | JSONB | App deep linking data |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

### Asset Status Distribution

| Status | Count | Percentage |
|--------|-------|------------|
| Published | 17,581 | 51.8% |
| Unpublished | 16,374 | 48.2% |
| **Total** | **33,955** | **100%** |

### Content Tier Distribution

| Tier | Count | Percentage |
|------|-------|------------|
| Premium | 19,521 | 57.5% |
| Free | 14,434 | 42.5% |
| **Total** | **33,955** | **100%** |

### Language Distribution

| Language | Count | Percentage |
|----------|-------|------------|
| Hindi | 17,503 | 51.5% |
| English | 5,398 | 15.9% |
| Kannada | 1,784 | 5.3% |
| Telugu | 1,753 | 5.2% |
| Tamil | 1,698 | 5.0% |
| Marathi | 1,359 | 4.0% |
| Malayalam | 1,270 | 3.7% |
| Bengali | 1,235 | 3.6% |
| Gujarati | 543 | 1.6% |
| Punjabi | 466 | 1.4% |
| Others | ~946 | 2.8% |

### Key Metadata Coverage

| Field | Coverage | Notes |
|-------|----------|-------|
| `title` | 100% | Always present |
| `content_id` | 100% | Unique identifier |
| `lang` | ~100% | Primary language |
| `actors` | ~70% | Cast information |
| `director` | ~60% | Director name |
| `genre` | ~85% | Genre classification |
| `release_year` | ~90% | Year of release |
| `duration_minutes` | ~95% | Runtime |
| `content_rating` | ~80% | Age ratings |
| `images` | ~95% | JSONB with multiple sizes |
| `deep_links` | ~90% | App linking data |

---

## Hotstar Shows (6,092 items)

### Content Tier Distribution

| Tier | Count | Percentage |
|------|-------|------------|
| Premium | 3,847 | 63.1% |
| Free | 2,245 | 36.9% |
| **Total** | **6,092** | **100%** |

### Language Distribution

| Language | Count | Percentage |
|----------|-------|------------|
| Telugu | 2,687 | 44.1% |
| English | 953 | 15.6% |
| Hindi | 888 | 14.6% |
| Tamil | 569 | 9.3% |
| Kannada | 293 | 4.8% |
| Malayalam | 251 | 4.1% |
| Bengali | 174 | 2.9% |
| Marathi | 151 | 2.5% |
| Others | ~126 | 2.1% |

### Asset Status

All shows have `asset_status = NULL` (not set during ingestion)

---

## Sync History

The `hotstar_sync_log` table tracks ingestion runs:

| Sync Date | Content Type | Records | Status |
|-----------|--------------|---------|--------|
| Initial Sync | Movies | 65,755 | Success |
| Initial Sync | Shows | 6,092 | Success |

---

## Comparison: Cloud SQL vs MongoDB

| Aspect | Cloud SQL (Hotstar) | MongoDB (merged_catalog) |
|--------|---------------------|--------------------------|
| **Purpose** | Raw Hotstar API data | Normalized, enriched catalog |
| **Source** | Hotstar API only | IMDb + TMDB merged |
| **Movies** | 33,955 | 75,775 |
| **Shows** | 6,092 | 29,794 |
| **Schema** | Fixed columns | Flexible documents |
| **Images** | Hotstar CDN URLs | IMDb/TMDB URLs |
| **Cast Data** | Text field | Structured array |
| **Ratings** | Content rating only | IMDb + aggregated |
| **Deep Links** | Yes (JSONB) | No |
| **Streaming URIs** | Yes | No |

---

## Access Methods

### Via Cloud SQL Proxy (Recommended)

```bash
# Start Cloud SQL Proxy
cloud-sql-proxy tldrcontent-455209:asia-south1:tldrcontent-hotstar-db --port 5433

# Connect with psql
PGPASSWORD='hotstar_secure_2024' psql -h 127.0.0.1 -p 5433 -U hotstar_user -d hotstar_content
```

### Via Python Scripts

```python
# Use existing scripts
python scripts/cloud-db-config.py

# Or with existing ingestion scripts
python scripts/ingest_hotstar_movies.py
```

---

## Sample Queries

### Get Published Hindi Movies
```sql
SELECT content_id, title, release_year, genre, content_rating
FROM hotstar_movies
WHERE asset_status = 'published' 
  AND lang = 'Hindi'
  AND premium = false
ORDER BY release_year DESC
LIMIT 20;
```

### Get Premium Shows by Language
```sql
SELECT lang, COUNT(*) as count
FROM hotstar_shows
WHERE premium = true
GROUP BY lang
ORDER BY count DESC;
```

### Find Movies with Complete Metadata
```sql
SELECT content_id, title, actors, director, genre
FROM hotstar_movies
WHERE actors IS NOT NULL
  AND director IS NOT NULL
  AND genre IS NOT NULL
  AND release_year IS NOT NULL
LIMIT 10;
```

### Get Deep Link Data
```sql
SELECT content_id, title, deep_links
FROM hotstar_movies
WHERE deep_links IS NOT NULL
LIMIT 5;
```

---

## Integration Notes

1. **Content Matching**: Use `content_id` from Hotstar to match with external databases. The ID format follows Hotstar's internal convention.

2. **Image Assets**: The `images` JSONB field contains multiple resolutions suitable for different display contexts (thumbnails, cards, heroes).

3. **Streaming Integration**: `playback_uri` and `encrypted_video_id` fields are essential for video playback integration.

4. **Deep Linking**: The `deep_links` JSONB enables direct app navigation for mobile integrations.

5. **Availability**: Check `asset_status = 'published'` and `premium` fields to determine content availability for different user tiers.

---

## Related Documentation

- [Database Comparison](./DATABASE_COMPARISON.md) - Detailed field mapping between sources
- [Hotstar API Guide](./README_HOTSTAR.md) - API ingestion documentation
- [Cloud Deployment Guide](./CLOUD_DEPLOYMENT_GUIDE.md) - Full deployment instructions
