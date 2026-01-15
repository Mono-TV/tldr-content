# Database Comparison: Merged Catalog vs Hotstar API

This document compares the metadata available in the existing `merged_catalog` MongoDB collection (sourced from IMDb/TMDB) with the Hotstar API content.

## Content Volume Comparison

| Source | Movies | TV Shows | Sports | Total |
|--------|--------|----------|--------|-------|
| **Merged Catalog (IMDb/TMDB)** | 75,775 | 29,794 | - | 105,569 |
| **Hotstar API** | 51,550 | 6,139 | 175,041 | 232,730 |
| **Hotstar Ingested (Sports)** | - | - | 10,000 | 10,000 |

## Metadata Field Comparison

### Core Identification

| Field | Merged Catalog | Hotstar API | Notes |
|-------|----------------|-------------|-------|
| **Unique ID** | `imdb_id` (tt1234567) | `contentId` (numeric) | Different ID systems |
| **TMDB ID** | `tmdb_id` | - | Not available in Hotstar |
| **Title** | `title` | `title` | Both have |
| **Original Title** | `original_title` | - | Only in merged catalog |
| **Content Type** | `content_type` (movie/show) | `contentType` (MOVIE/SHOW/MATCH) | Similar |

### Descriptive Metadata

| Field | Merged Catalog | Hotstar API | Notes |
|-------|----------------|-------------|-------|
| **Description** | `overview`, `plot`, `plot_full` | `description` | Merged has more detail |
| **Year** | `year` | `year` | Both have |
| **Release Date** | `release_date` (YYYY-MM-DD) | - | Only in merged catalog |
| **Runtime** | `runtime` (minutes) | `duration` (seconds) | Different units |
| **Genres** | `genres` (array of objects) | `genre` (array of strings) | Different format |
| **Keywords** | `keywords` | `searchKeywords` | Both have |

### Ratings & Popularity

| Field | Merged Catalog | Hotstar API | Notes |
|-------|----------------|-------------|-------|
| **IMDb Rating** | `imdb_rating` (0-10) | - | **Only in merged catalog** |
| **IMDb Vote Count** | `imdb_rating_count` | - | **Only in merged catalog** |
| **TMDB Rating** | `tmdb_vote_average` | - | **Only in merged catalog** |
| **TMDB Vote Count** | `tmdb_vote_count` | - | **Only in merged catalog** |
| **TMDB Popularity** | `tmdb_popularity` | - | **Only in merged catalog** |
| **Parental Rating** | `content_rating` (R, PG-13) | `parentalRatingName` (12+, PG) | Different systems |

### Language & Region

| Field | Merged Catalog | Hotstar API | Notes |
|-------|----------------|-------------|-------|
| **Languages** | `languages` (array) | `lang` (array) | Both have |
| **Original Language** | `original_language` (ISO code) | `originalLanguage` (name) | Different format |
| **Language Objects** | - | `langObjs` (with ISO codes) | Hotstar has more detail |
| **Countries** | `countries` (array) | - | Only in merged catalog |

### Cast & Crew

| Field | Merged Catalog | Hotstar API | Notes |
|-------|----------------|-------------|-------|
| **Cast** | `cast` (detailed objects) | `actors` (names only) | Merged has more detail |
| **Cast Details** | name, character, popularity, profile_path | - | Only in merged catalog |
| **Directors** | `directors` (array) | - | **Only in merged catalog** |
| **Writers** | `writers` (array) | - | **Only in merged catalog** |
| **Stars** | `stars` (array) | - | Only in merged catalog |
| **Crew** | `crew` (array) | - | Only in merged catalog |

### Images & Media

| Field | Merged Catalog | Hotstar API | Notes |
|-------|----------------|-------------|-------|
| **Poster URL** | `poster_url` | `portraitThumbnail` | Both have |
| **Backdrop URL** | `backdrop_url` | `thumbnail` | Both have |
| **Image Objects** | `images.posters`, `images.backdrops` | `images`, `sourceImages` | Both have |
| **Videos/Trailers** | `videos` (array) | - | Only in merged catalog |

### Streaming & Access

| Field | Merged Catalog | Hotstar API | Notes |
|-------|----------------|-------------|-------|
| **Streaming Platforms** | `streaming_platforms` | - | External platforms |
| **Premium Flag** | - | `premium` | **Hotstar-specific** |
| **VIP Flag** | - | `vip` | **Hotstar-specific** |
| **Paid Flag** | - | `paid` | **Hotstar-specific** |
| **Deep Links** | - | `deepLinkUrl`, `locators` | **Hotstar-specific** |
| **Watch URLs** | - | `locators` (web, ios, android, tv) | **Hotstar-specific** |
| **Asset Status** | - | `assetStatus` (PUBLISHED/UNPUBLISHED) | **Hotstar-specific** |

### Dates & Scheduling

| Field | Merged Catalog | Hotstar API | Notes |
|-------|----------------|-------------|-------|
| **Release Date** | `release_date` | - | Only in merged catalog |
| **Start Date** | - | `startDate` (epoch) | **Hotstar-specific** |
| **End Date** | - | `endDate` (epoch) | **Hotstar-specific** |
| **Update Date** | `last_updated` | `updateDate` (epoch) | Both have |

### Financial Data

| Field | Merged Catalog | Hotstar API | Notes |
|-------|----------------|-------------|-------|
| **Budget** | `budget` | - | **Only in merged catalog** |
| **Revenue** | `revenue` | - | **Only in merged catalog** |
| **Production Companies** | `production_companies` | - | Only in merged catalog |

---

## Metadata Coverage Summary

### Merged Catalog (IMDb/TMDB) Strengths
- **Ratings & Reviews**: IMDb ratings, vote counts, popularity scores
- **Cast & Crew Details**: Character names, popularity, profile images
- **Financial Data**: Budget and box office revenue
- **External IDs**: IMDb ID, TMDB ID for cross-referencing
- **Rich Descriptions**: Multiple plot versions (short, full)
- **Videos/Trailers**: Trailer URLs and metadata
- **Global Coverage**: 105,569 titles from worldwide sources

### Hotstar API Strengths
- **Streaming Access**: Direct deep links, watch URLs for all platforms
- **Access Control**: Premium/VIP/Paid flags for subscription management
- **Availability Dates**: Start/end dates for content availability windows
- **Asset Status**: Know if content is published or unpublished
- **Sports Content**: 175,000+ sports events not available elsewhere
- **Regional Focus**: Strong Indian language content
- **Platform Links**: iOS, Android, TV, Web URLs

---

## Field Mapping for Integration

To integrate Hotstar content with the merged catalog, use this mapping:

```javascript
// Hotstar → Merged Catalog mapping
{
  // IDs
  hotstar_id: contentId,          // Store as separate field
  
  // Basic info
  title: title,
  overview: description,
  year: year,
  runtime: Math.floor(duration / 60),  // Convert seconds to minutes
  content_type: contentType.toLowerCase(),
  
  // Languages & Genres
  languages: lang,
  original_language: originalLanguage,
  genres: genre.map(g => ({ name: g })),
  
  // Cast (limited in Hotstar)
  cast: actors?.map((name, i) => ({ 
    name, 
    order: i,
    known_for_department: 'Acting'
  })),
  
  // Images
  poster_url: portraitThumbnail,
  backdrop_url: thumbnail,
  images: {
    posters: images.filter(i => i.type === 'VERTICAL'),
    backdrops: images.filter(i => i.type === 'HORIZONTAL')
  },
  
  // Hotstar-specific (new fields)
  hotstar_premium: premium,
  hotstar_vip: vip,
  hotstar_deep_link: deepLinkUrl,
  hotstar_web_url: locators.find(l => l.platform === 'web')?.url,
  hotstar_start_date: new Date(startDate * 1000),
  hotstar_end_date: new Date(endDate * 1000),
  hotstar_status: assetStatus,
  
  // Content rating
  content_rating: parentalRatingName,
  
  // Keywords
  keywords: searchKeywords
}
```

---

## Recommendations

### For Content Discovery
Use **Merged Catalog** as the primary source because:
- Contains ratings to filter/sort by quality
- Has vote counts for popularity
- Includes cast details for actor-based browsing
- Better genre categorization

### For Streaming
Use **Hotstar API** to supplement with:
- Direct watch links (`locators`)
- Access tier information (premium/vip/paid)
- Availability windows (start/end dates)
- Content status (published/unpublished)

### For Sports
Use **Hotstar API** exclusively:
- 175,000+ sports events
- Live/VOD status
- Tournament and team information
- Sport type categorization

### Integration Strategy

1. **Match by Title + Year**: Since Hotstar doesn't have IMDb IDs, match content by:
   ```javascript
   db.merged_catalog.findOne({
     title: { $regex: hotstarTitle, $options: 'i' },
     year: hotstarYear
   })
   ```

2. **Enrich Merged Catalog**: Add Hotstar-specific fields to existing records:
   - `hotstar_id`
   - `hotstar_url`
   - `hotstar_premium`
   - `streaming_platforms` (add Hotstar)

3. **Create Separate Sports Collection**: Sports don't match movies/shows schema:
   - Already done: `hotstar_sports` collection
   - Contains 10,000 items (more available)

---

## Data Quality Comparison

| Metric | Merged Catalog | Hotstar API |
|--------|----------------|-------------|
| **Title Quality** | High (standardized) | Medium (some test content) |
| **Description Quality** | High (IMDb synopses) | Medium (shorter) |
| **Cast Coverage** | 90.6% with details | ~50% with names only |
| **Rating Data** | 72.3% with IMDb ratings | None |
| **Image Quality** | 74% with posters | ~95% with thumbnails |
| **Genre Accuracy** | High (TMDB taxonomy) | Medium (simpler) |
| **Year Accuracy** | 99.7% | High |

---

## Collection Statistics

### Merged Catalog (`merged_catalog`)
- **Total**: 105,569 items
- **Movies**: 75,775 (72%)
- **Shows**: 29,794 (28%)
- **With Ratings**: 76,290 (72%)
- **With Cast**: 95,614 (91%)
- **Top Languages**: English, Hindi, Tamil, Telugu, Malayalam

### Hotstar Sports (`hotstar_sports`)
- **Total Ingested**: 10,000 items
- **Total Available**: 175,041 items
- **Published**: 5,732 items
- **Sport Types**: 16 (Cricket, Football, Kabaddi, etc.)
- **Premium Content**: 29 items

---

*Last Updated: January 11, 2026*
