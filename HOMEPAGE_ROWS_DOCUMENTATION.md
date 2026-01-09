# Homepage Rows Documentation

Complete guide to creating, managing, and customizing content rows on the homepage.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Creating Homepage Rows](#creating-homepage-rows)
4. [API Filters Reference](#api-filters-reference)
5. [Language-Specific Rows](#language-specific-rows)
6. [Manual Language Corrections](#manual-language-corrections)
7. [Testing API Endpoints](#testing-api-endpoints)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The homepage displays curated content rows fetched from the backend API. Each row is powered by React Query for efficient data fetching and caching.

**Key Features:**
- 15 items per row (configurable)
- Real-time filtering by rating, votes, language, genre, year, etc.
- Manual correction system for incorrect metadata
- Responsive design with horizontal scrolling
- ISR (Incremental Static Regeneration) for content detail pages

---

## Architecture

```
Frontend (Next.js 16.1.1)
├── /web/src/app/page.tsx          # Homepage with all rows
├── /web/src/types/index.ts        # TypeScript interfaces
├── /web/src/services/api.ts       # API client wrapper
└── /web/src/components/sections/
    └── content-row.tsx             # Row component

Backend (Node.js + Express)
├── /api/server.js                  # Main API server
├── MongoDB (merged_catalog)        # Content database
└── Cloud Run Deployment            # Serverless hosting
```

---

## Creating Homepage Rows

### Step 1: Define React Query Hook

In `/web/src/app/page.tsx`, add a new `useQuery` hook:

```typescript
const { data: yourRowData, isLoading: yourRowLoading } = useQuery({
  queryKey: ['yourRowKey'],  // Unique key for caching
  queryFn: () => api.getContent({
    min_rating: 8,              // Minimum IMDb/TMDb rating
    min_votes: 50000,           // Minimum vote count
    type: 'movie',              // 'movie' or 'show'
    original_language: 'en',    // ISO 639-1 code (optional)
    year_from: 2016,            // Start year (optional)
    sort: 'rating',             // Sort by: rating, popularity, release_date
    order: 'desc',              // 'asc' or 'desc'
    limit: 15                   // Number of items
  }),
});
```

### Step 2: Add JSX ContentRow Component

```tsx
<ContentRow
  title="Your Row Title"
  contents={yourRowData?.items || []}
  isLoading={yourRowLoading}
  href="/browse?your_filters_here"  // Link to browse page
/>
```

### Complete Example: Top Rated Science Fiction Movies

```typescript
// 1. Add the query hook
const { data: sciFiData, isLoading: sciFiLoading } = useQuery({
  queryKey: ['topRatedSciFi'],
  queryFn: () => api.getContent({
    min_rating: 8,
    min_votes: 50000,
    type: 'movie',
    genre: 'Science Fiction',
    year_from: 2010,
    sort: 'rating',
    order: 'desc',
    limit: 15
  }),
});

// 2. Add the JSX row (inside the main return statement)
<ContentRow
  title="Top Rated Sci-Fi Movies"
  contents={sciFiData?.items || []}
  isLoading={sciFiLoading}
  href="/browse?genre=Science+Fiction&min_rating=8&sort=rating"
/>
```

---

## API Filters Reference

### Available Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `min_rating` | number | Minimum IMDb or TMDb rating (0-10) | `8` |
| `min_votes` | number | Minimum vote count | `50000` |
| `type` | string | Content type: `'movie'` or `'show'` | `'movie'` |
| `language` | string | Any language in languages array | `'Hindi'` |
| `original_language` | string | ISO 639-1 language code | `'hi'` |
| `genre` | string | Genre name (case-insensitive) | `'Action'` |
| `year` | number | Exact year | `2023` |
| `year_from` | number | Minimum year (inclusive) | `2016` |
| `year_to` | number | Maximum year (inclusive) | `2025` |
| `country` | string | Country name | `'India'` |
| `sort` | string | Sort field: `'rating'`, `'popularity'`, `'release_date'`, `'title'`, `'year'` | `'rating'` |
| `order` | string | Sort order: `'asc'` or `'desc'` | `'desc'` |
| `limit` | number | Number of results (max 100) | `15` |
| `page` | number | Page number for pagination | `1` |

### Filter Combinations

**High-quality recent movies:**
```typescript
{
  min_rating: 8,
  min_votes: 50000,
  type: 'movie',
  year_from: 2020,
  sort: 'rating',
  order: 'desc',
  limit: 15
}
```

**Popular TV shows:**
```typescript
{
  type: 'show',
  sort: 'popularity',
  order: 'desc',
  limit: 15
}
```

**Classic movies:**
```typescript
{
  min_rating: 8,
  min_votes: 100000,
  type: 'movie',
  year_to: 2000,
  sort: 'rating',
  order: 'desc',
  limit: 15
}
```

---

## Language-Specific Rows

### Understanding Language Filtering

**Two Language Fields:**

1. **`languages`** (array) - All available languages including dubs/subtitles
   - Example: `["Hindi", "English", "Tamil", "French"]`
   - Use `language` parameter to filter

2. **`original_language`** (string) - The movie's original production language
   - Example: `"ta"` (Tamil)
   - Use `original_language` parameter to filter
   - **Recommended for language-specific rows**

### Why Use `original_language`?

**Before (using `language`):**
```typescript
// Problem: "Spider-Man" dubbed in Hindi appears in Hindi row
language: 'Hindi'  // Matches all movies with Hindi in languages array
```

**After (using `original_language`):**
```typescript
// Solution: Only original Hindi movies appear
original_language: 'hi'  // Matches only movies originally made in Hindi
```

### ISO 639-1 Language Codes

| Language | Code |
|----------|------|
| English | `en` |
| Hindi | `hi` |
| Tamil | `ta` |
| Telugu | `te` |
| Malayalam | `ml` |
| Kannada | `kn` |
| Bengali | `bn` |
| Bhojpuri | `bho` |
| Korean | `ko` |
| Japanese | `ja` |
| Mandarin | `zh` |
| Spanish | `es` |
| French | `fr` |

**Full list:** https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes

### Example: Top Rated Tamil Movies

```typescript
const tenYearsAgo = new Date().getFullYear() - 10;

const { data: topRatedTamilData, isLoading: topRatedTamilLoading } = useQuery({
  queryKey: ['topRatedTamil'],
  queryFn: () => api.getContent({
    min_rating: 8,
    min_votes: 50000,
    type: 'movie',
    original_language: 'ta',  // ISO code for Tamil
    year_from: tenYearsAgo,
    sort: 'rating',
    order: 'desc',
    limit: 15
  }),
});

<ContentRow
  title="Top Rated Tamil Movies"
  contents={topRatedTamilData?.items || []}
  isLoading={topRatedTamilLoading}
  href="/browse?original_language=ta&min_rating=8&sort=rating"
/>
```

---

## Manual Language Corrections

### The Problem

Sometimes the `original_language` metadata from TMDb/IMDb is incorrect. For example:
- "Rocketry: The Nambi Effect" was shot in Hindi, Tamil, and English simultaneously
- Database has `original_language: "ta"` (Tamil)
- But it should appear in the **Hindi row** as it was primarily a Hindi production

### The Solution: `LANGUAGE_CORRECTIONS` Mapping

Located in `/api/server.js`:

```javascript
// Manual corrections for incorrect original_language metadata
// Maps IMDb ID to correct ISO 639-1 language code
const LANGUAGE_CORRECTIONS = {
  'tt9263550': 'hi', // Rocketry: The Nambi Effect (Hindi, not Tamil)
  // Add more corrections here as needed
};
```

### How It Works

1. **During API Filtering:**
   - When filtering by `original_language=hi`, the API includes:
     - Movies with `original_language: "hi"` in database **AND NOT in corrections**
     - Movies in `LANGUAGE_CORRECTIONS` mapped to `"hi"`
   - When filtering by `original_language=ta`, the API:
     - Includes Tamil movies **EXCEPT** those corrected to other languages
     - Excludes `tt9263550` (Rocketry) from Tamil results

2. **In API Responses:**
   - The `applyLanguageCorrections()` function overrides the `original_language` field
   - Rocketry returns with `original_language: "hi"` instead of `"ta"`

### Adding a New Correction

**Step 1: Find the IMDb ID**

Use the search API or check the movie's detail page:
```bash
curl "https://content-api-401132033262.asia-south1.run.app/api/search?q=Movie+Name" | jq '.items[0].imdb_id'
```

**Step 2: Add to LANGUAGE_CORRECTIONS**

Edit `/api/server.js`:

```javascript
const LANGUAGE_CORRECTIONS = {
  'tt9263550': 'hi',  // Rocketry: The Nambi Effect (Hindi, not Tamil)
  'tt1234567': 'te',  // Example: Wrong metadata → Telugu
  'tt7654321': 'en',  // Example: Another correction → English
};
```

**Step 3: Deploy the Backend**

```bash
cd /path/to/tldrcontent
git add api/server.js
git commit -m "feat: Add language correction for Movie Name (IMDb ID)"
git push origin main

# Deploy to Cloud Run
gcloud run deploy content-api \
  --source . \
  --region=asia-south1 \
  --allow-unauthenticated \
  --set-secrets=MONGO_URI=content-api-mongo-uri:latest
```

**Step 4: Verify the Correction**

```bash
# Check the movie's corrected language
curl "https://content-api-401132033262.asia-south1.run.app/api/content/tt1234567" \
  | jq '{title, original_language}'

# Verify it appears in the correct language row
curl "https://content-api-401132033262.asia-south1.run.app/api/content?original_language=te&limit=20" \
  | jq '.items[] | select(.imdb_id == "tt1234567")'
```

### Complete Example: Adding Correction for a Multilingual Film

**Scenario:** "KGF: Chapter 2" (tt10698680) is marked as Kannada but should be in Hindi row

```javascript
// 1. Add to LANGUAGE_CORRECTIONS in /api/server.js
const LANGUAGE_CORRECTIONS = {
  'tt9263550': 'hi',   // Rocketry: The Nambi Effect
  'tt10698680': 'hi',  // KGF: Chapter 2 (Hindi, not Kannada)
};

// 2. Commit and deploy
git add api/server.js
git commit -m "feat: Add language correction for KGF: Chapter 2"
git push origin main
gcloud run deploy content-api --source . --region=asia-south1 --allow-unauthenticated --set-secrets=MONGO_URI=content-api-mongo-uri:latest

// 3. Test the results
curl "https://content-api-401132033262.asia-south1.run.app/api/content?original_language=hi&min_rating=8&limit=20" | jq '.items[] | select(.title | contains("KGF"))'
```

**Result:**
- KGF: Chapter 2 now appears in **Hindi top-rated movies**
- KGF: Chapter 2 does NOT appear in **Kannada top-rated movies**
- API returns `original_language: "hi"` for this movie

---

## Testing API Endpoints

### Test Content Endpoint

```bash
# Get top-rated Hindi movies
curl -s "https://content-api-401132033262.asia-south1.run.app/api/content?min_rating=8&min_votes=50000&type=movie&original_language=hi&year_from=2016&sort=rating&order=desc&limit=5" \
  | jq '.items[] | {title, imdb_rating, original_language}'
```

**Expected Output:**
```json
{
  "title": "12th Fail",
  "imdb_rating": 8.7,
  "original_language": "hi"
}
{
  "title": "Rocketry: The Nambi Effect",
  "imdb_rating": 8.6,
  "original_language": "hi"
}
...
```

### Test Search Endpoint

```bash
# Search for a movie
curl -s "https://content-api-401132033262.asia-south1.run.app/api/search?q=Rocketry&limit=1" \
  | jq '.items[] | {title, imdb_id, original_language, languages}'
```

### Test Single Content Item

```bash
# Get specific movie by IMDb ID
curl -s "https://content-api-401132033262.asia-south1.run.app/api/content/tt9263550" \
  | jq '{title, imdb_rating, original_language, year, languages}'
```

### Test Language Correction

```bash
# Verify movie appears in corrected language row (Hindi)
echo "=== HINDI TOP MOVIES ==="
curl -s "https://content-api-401132033262.asia-south1.run.app/api/content?original_language=hi&min_rating=8&min_votes=50000&type=movie&limit=10" \
  | jq '.items[] | "\(.imdb_rating) - \(.title)"'

# Verify movie does NOT appear in original database language row (Tamil)
echo "=== TAMIL TOP MOVIES ==="
curl -s "https://content-api-401132033262.asia-south1.run.app/api/content?original_language=ta&min_rating=8&min_votes=50000&type=movie&limit=10" \
  | jq '.items[] | "\(.imdb_rating) - \(.title)"'
```

---

## Troubleshooting

### Row Shows Wrong Content

**Problem:** Row displays movies that don't match the filters

**Solution:**
1. Check the `queryKey` is unique and descriptive
2. Clear React Query cache: Restart dev server
3. Verify API response directly with curl
4. Check filter parameters match the intended criteria

### Language Row Shows Dubbed Movies

**Problem:** English row shows Indian movies dubbed in English

**Solution:** Use `original_language` instead of `language`:

```typescript
// ❌ Wrong - includes dubbed versions
language: 'English'

// ✅ Correct - only original English movies
original_language: 'en'
```

### Movie Appears in Wrong Language Row

**Problem:** A multilingual movie appears in the wrong language

**Solution:** Add to `LANGUAGE_CORRECTIONS` in `/api/server.js`:

```javascript
const LANGUAGE_CORRECTIONS = {
  'tt9263550': 'hi',    // Rocketry → Hindi (was Tamil)
  'ttXXXXXXX': 'ta',    // Your movie → Correct language
};
```

Deploy and test:
```bash
gcloud run deploy content-api --source . --region=asia-south1 --allow-unauthenticated --set-secrets=MONGO_URI=content-api-mongo-uri:latest
```

### No Results for Language Code

**Problem:** Row is empty when using `original_language`

**Possible Causes:**
1. **Wrong ISO code** - Use `'hi'` not `'Hindi'`
2. **No movies match all filters** - Try removing `min_votes` or increasing year range
3. **Database has null values** - Some movies don't have `original_language` set

**Debug:**
```bash
# Test without strict filters
curl "https://content-api-401132033262.asia-south1.run.app/api/content?original_language=hi&limit=5" \
  | jq '.items | length'

# If 0, try with language instead
curl "https://content-api-401132033262.asia-south1.run.app/api/content?language=Hindi&limit=5" \
  | jq '.items | length'
```

### API Returns 500 Error

**Problem:** Backend crashes or returns server error

**Debug Steps:**
1. Check Cloud Run logs:
   ```bash
   gcloud run services logs read content-api --region=asia-south1 --limit=50
   ```

2. Test MongoDB connection:
   ```bash
   curl "https://content-api-401132033262.asia-south1.run.app/health"
   ```

3. Check filter syntax - ensure all values are valid types

### Slow Row Loading

**Problem:** Rows take too long to load

**Optimizations:**
1. Reduce `limit` (currently 15 items)
2. Add database indexes for frequently filtered fields
3. Use `staleTime` in React Query for longer caching:
   ```typescript
   useQuery({
     queryKey: ['yourRow'],
     queryFn: () => api.getContent({...}),
     staleTime: 5 * 60 * 1000, // Cache for 5 minutes
   });
   ```

---

## Best Practices

### 1. Query Key Naming

Use descriptive, unique keys:
```typescript
// ✅ Good
queryKey: ['topRatedHindiMovies']
queryKey: ['trendingAction2024']

// ❌ Bad
queryKey: ['movies']
queryKey: ['content1']
```

### 2. Filter Combinations

Always combine filters for high-quality content:
```typescript
// ✅ Good - quality content only
{
  min_rating: 8,
  min_votes: 50000,
  type: 'movie'
}

// ❌ Bad - may show low-quality content
{
  type: 'movie'
}
```

### 3. Year Ranges

Use dynamic year calculations:
```typescript
// ✅ Good - automatically updates
const fiveYearsAgo = new Date().getFullYear() - 5;

// ❌ Bad - becomes outdated
year_from: 2020
```

### 4. Consistent Row Heights

Keep all rows at 15 items for visual consistency:
```typescript
limit: 15  // Standard across all rows
```

### 5. Documentation

Comment complex filters:
```typescript
// Fetch top-rated movies from last 5 years with significant vote counts
// This ensures only popular, high-quality recent releases
const { data } = useQuery({
  queryKey: ['topRatedRecent'],
  queryFn: () => api.getContent({
    min_rating: 8,        // IMDb > 8.0
    min_votes: 50000,     // 50K+ votes
    type: 'movie',        // Movies only
    year_from: fiveYearsAgo,
    sort: 'rating',
    order: 'desc',
    limit: 15
  }),
});
```

---

## Quick Reference

### Common Row Types

**Top Rated Recent:**
```typescript
{min_rating: 8, min_votes: 50000, type: 'movie', year_from: 2020, sort: 'rating', order: 'desc', limit: 15}
```

**Trending:**
```typescript
{sort: 'popularity', order: 'desc', limit: 15}
```

**New Releases:**
```typescript
{sort: 'release_date', order: 'desc', limit: 15}
```

**By Genre:**
```typescript
{genre: 'Action', min_rating: 7, sort: 'rating', order: 'desc', limit: 15}
```

**By Language:**
```typescript
{original_language: 'hi', min_rating: 8, min_votes: 50000, type: 'movie', year_from: 2016, sort: 'rating', order: 'desc', limit: 15}
```

### Files to Edit

| Task | File | Location |
|------|------|----------|
| Add homepage row | `page.tsx` | `/web/src/app/page.tsx` |
| Add language correction | `server.js` | `/api/server.js` (LANGUAGE_CORRECTIONS) |
| Update types | `index.ts` | `/web/src/types/index.ts` |
| Test API | Terminal | Use `curl` commands above |

---

## Support

For issues or questions:
- Check API logs: `gcloud run services logs read content-api --region=asia-south1`
- Test endpoints with curl examples above
- Review this documentation for common patterns
- Check `/web/src/app/page.tsx` for existing row examples

---

**Last Updated:** January 2026
**API Version:** 1.0.0
**Frontend Version:** Next.js 16.1.1
