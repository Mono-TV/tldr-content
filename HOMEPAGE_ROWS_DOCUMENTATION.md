# Homepage Rows Documentation

Complete guide to creating, managing, and customizing Top Rated Movies rows on the homepage.

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Top Rated Movies Row Variants](#top-rated-movies-row-variants)
4. [MongoDB Query Examples](#mongodb-query-examples)
5. [API Query Examples](#api-query-examples)
6. [Frontend Implementation](#frontend-implementation)
7. [Manual Language Corrections](#manual-language-corrections)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The homepage displays curated **Top Rated Movies** rows with different filters (language, genre, year range, etc.). Each row shows 15 high-quality movies based on IMDb ratings and vote counts.

**Current Top Rated Movies Rows:**
1. Top Rated Movies (Last 5 years) - 50k votes
2. Top Rated English Movies (Last 10 years) - 50k votes
3. Top Rated Hindi Movies (Last 10 years) - 50k votes
4. Top Rated Tamil Movies (Last 10 years) - 15k votes
5. Top Rated Telugu Movies (Last 10 years) - 5k votes
6. Top Rated Malayalam Movies (Last 10 years) - 5k votes
7. Top Rated Kannada Movies (Last 15 years) - 5k votes
8. Top Rated Bengali Movies (Last 15 years) - 2k votes, 7.5+ rating

**Filter Strategy:**
Different languages use different thresholds based on industry size and global reach:
- **Major languages** (English, Hindi): 50,000 votes - global audience
- **Regional powerhouse** (Tamil): 15,000 votes - strong domestic + international reach
- **Regional major** (Telugu, Malayalam): 5,000 votes - significant audience
- **Regional smaller** (Kannada): 5,000 votes + extended 15-year range
- **Niche regional** (Bengali): 2,000 votes + rating 7.5 + extended 15-year range

All rows maintain high rating standards (7.5-8.0+) while ensuring 15+ movies per row.

**Tie-Breaker Strategy:**
When multiple movies have the same IMDb rating, they are sorted using this multi-level hierarchy:
1. **Primary:** IMDb rating (highest first)
2. **Secondary:** Vote count (more votes = more reliable rating)
3. **Tertiary:** Release date (newer content first)

**Example:** Movies with 8.3 rating are ordered by votes: 234k → 137k → 134k → 70k → 56k → 50k

---

## Database Schema

### Collection: `merged_catalog`

**Database:** MongoDB (`content_db`)
**Total Documents:** 105,569+ movies and shows

### Key Fields

```javascript
{
  _id: ObjectId("..."),
  imdb_id: "tt9263550",                    // IMDb identifier
  title: "Rocketry: The Nambi Effect",     // English title
  original_title: "रॉकेट्री",               // Original language title
  year: 2022,                              // Release year
  release_date: "2022-07-01",              // ISO date string

  // Ratings & Popularity
  imdb_rating: 8.6,                        // IMDb rating (0-10)
  imdb_rating_count: 61000,                // Number of IMDb votes
  tmdb_vote_average: 8.4,                  // TMDb rating (0-10)
  tmdb_vote_count: 250,                    // Number of TMDb votes
  tmdb_popularity: 45.6,                   // TMDb popularity score

  // Content Info
  content_type: "movie",                   // "movie" or "show"/"tv"/"series"
  runtime: 157,                            // Duration in minutes
  overview: "Biography of...",             // Plot summary
  plot: "Detailed plot...",                // Full plot

  // Language & Location
  original_language: "ta",                 // ISO 639-1 code (ta = Tamil)
  languages: ["Hindi", "English", "Tamil", "French"], // All available languages
  countries: ["India"],                    // Production countries

  // Classification
  genres: [
    { id: 18, name: "Drama" },
    { id: 36, name: "History" }
  ],

  // Cast & Crew
  cast: [
    {
      name: "R. Madhavan",
      character: "Nambi Narayanan",
      order: 0,
      profile_path: "/..."
    }
  ],
  directors: ["R. Madhavan"],
  writers: ["R. Madhavan"],

  // Media
  poster_url: "https://image.tmdb.org/t/p/original/...",
  backdrop_url: "https://m.media-amazon.com/...",
  trailer_url: "https://www.youtube.com/watch?v=...",
  trailer_key: "abc123xyz"
}
```

### Indexes

```javascript
// Recommended indexes for query performance
db.merged_catalog.createIndex({ imdb_rating: -1 })
db.merged_catalog.createIndex({ original_language: 1 })
db.merged_catalog.createIndex({ content_type: 1 })
db.merged_catalog.createIndex({ year: -1 })
db.merged_catalog.createIndex({ imdb_rating_count: -1 })
db.merged_catalog.createIndex({ "genres.name": 1 })
```

---

## Top Rated Movies Row Variants

### 1. Top Rated Movies (General)

**Filters:**
- IMDb rating ≥ 8.0
- Vote count ≥ 50,000
- Content type: movie
- Released in last 5 years
- Sorted by rating (descending)

**Use Case:** Show recent high-quality movies across all languages

---

### 2. Top Rated Movies by Language

**Variants with Language-Specific Thresholds:**

| Language | ISO Code | Rating | Votes | Years | Results |
|----------|----------|--------|-------|-------|---------|
| English | `en` | 8.0+ | 50,000 | 10 | ~100+ |
| Hindi | `hi` | 8.0+ | 50,000 | 10 | ~15 |
| Tamil | `ta` | 8.0+ | 15,000 | 10 | ~22 |
| Telugu | `te` | 8.0+ | 5,000 | 10 | ~21 |
| Malayalam | `ml` | 8.0+ | 5,000 | 10 | ~22 |
| Kannada | `kn` | 8.0+ | 5,000 | 15 | ~15 |
| Bengali | `bn` | 7.5+ | 2,000 | 15 | ~28 |

**Why Different Thresholds?**
- **Global languages** (English, Hindi): Higher thresholds ensure only widely-acclaimed films
- **Tamil**: Strong international diaspora allows medium-high threshold
- **Telugu/Malayalam**: Significant regional audience, moderate threshold
- **Kannada**: Extended year range compensates for smaller volume
- **Bengali**: Lower rating + votes + extended range to ensure adequate content

**Use Case:** Show original movies in specific languages (not dubbed versions)

**Note:** Bhojpuri removed due to insufficient high-quality content (0 movies available)

---

### 3. Top Rated Movies by Genre

**Variants:**
- Top Rated Action Movies
- Top Rated Drama Movies
- Top Rated Comedy Movies
- Top Rated Thriller Movies
- Top Rated Science Fiction Movies
- Top Rated Horror Movies

**Filters:**
- IMDb rating ≥ 8.0
- Vote count ≥ 50,000
- Content type: movie
- Genre: specific genre name
- Released in last 10 years
- Sorted by rating (descending)

**Use Case:** Show high-quality movies in specific genres

---

### 4. Top Rated Movies by Decade

**Variants:**
- Top Rated Movies 2020s (`year_from: 2020`)
- Top Rated Movies 2010s (`year_from: 2010, year_to: 2019`)
- Top Rated Movies 2000s (`year_from: 2000, year_to: 2009`)
- Top Rated Classic Movies (`year_to: 1999`)

**Filters:**
- IMDb rating ≥ 8.0
- Vote count ≥ 100,000 (higher for classics)
- Content type: movie
- Year range: specific decade
- Sorted by rating (descending)

**Use Case:** Show high-quality movies from different time periods

---

### 5. Top Rated Movies by Region

**Variants:**
- Top Rated Indian Movies (`country: 'India'`)
- Top Rated Korean Movies (`original_language: 'ko'`)
- Top Rated Japanese Movies (`original_language: 'ja'`)
- Top Rated French Movies (`original_language: 'fr'`)

**Filters:**
- IMDb rating ≥ 8.0
- Vote count ≥ 50,000
- Content type: movie
- Country or original_language filter
- Released in last 10 years
- Sorted by rating (descending)

**Use Case:** Show high-quality movies from specific regions/countries

---

## MongoDB Query Examples

### Connect to Database

```bash
# Using MongoDB shell
mongosh "mongodb+srv://your-connection-string" --username your-user

# Or in Node.js
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db('content_db');
```

---

### 1. Top Rated Movies (General - Last 5 Years)

```javascript
// MongoDB Query with Tie-Breakers
db.merged_catalog.find({
  content_type: "movie",
  imdb_rating: { $gte: 8.0 },
  imdb_rating_count: { $gte: 50000 },
  year: { $gte: 2021 }  // Adjust year dynamically
})
.sort({
  imdb_rating: -1,          // Primary: highest rating first
  imdb_rating_count: -1,    // Secondary: more votes = more reliable
  release_date: -1          // Tertiary: newer content first
})
.limit(15)
.toArray();

// With Aggregation Pipeline
db.merged_catalog.aggregate([
  {
    $match: {
      content_type: "movie",
      $or: [
        { imdb_rating: { $gte: 8.0 } },
        { tmdb_vote_average: { $gte: 8.0 } }
      ],
      imdb_rating_count: { $gte: 50000 },
      year: { $gte: 2021 }
    }
  },
  { $sort: { imdb_rating: -1, imdb_rating_count: -1, release_date: -1 } },
  { $limit: 15 },
  {
    $project: {
      _id: 1,
      imdb_id: 1,
      title: 1,
      year: 1,
      imdb_rating: 1,
      imdb_rating_count: 1,
      poster_url: 1,
      backdrop_url: 1,
      genres: 1,
      languages: 1,
      original_language: 1
    }
  }
]);
```

**Expected Results:**
```javascript
[
  {
    _id: ObjectId("..."),
    imdb_id: "tt15097216",
    title: "12th Fail",
    year: 2023,
    imdb_rating: 8.7,
    original_language: "hi",
    languages: ["Hindi", "English"]
  },
  {
    imdb_id: "tt9263550",
    title: "Rocketry: The Nambi Effect",
    year: 2022,
    imdb_rating: 8.6,
    original_language: "hi", // Corrected from "ta"
    languages: ["Hindi", "English", "Tamil", "French"]
  }
  // ... 13 more results
]
```

---

### 2. Top Rated Hindi Movies (Last 10 Years)

```javascript
// MongoDB Query
db.merged_catalog.find({
  content_type: "movie",
  original_language: "hi",
  imdb_rating: { $gte: 8.0 },
  imdb_rating_count: { $gte: 50000 },
  year: { $gte: 2016 }
})
.sort({ imdb_rating: -1, imdb_rating_count: -1, release_date: -1 })
.limit(15)
.toArray();

// With Manual Corrections (exclude movies corrected away, include corrected to Hindi)
db.merged_catalog.find({
  content_type: "movie",
  $or: [
    {
      original_language: "hi",
      imdb_id: { $nin: [] } // Exclude if any Hindi movies corrected away
    },
    {
      imdb_id: { $in: ["tt9263550"] } // Include Rocketry (corrected to Hindi)
    }
  ],
  imdb_rating: { $gte: 8.0 },
  imdb_rating_count: { $gte: 50000 },
  year: { $gte: 2016 }
})
.sort({ imdb_rating: -1, imdb_rating_count: -1, release_date: -1 })
.limit(15)
.toArray();
```

**Expected Results:**
```javascript
[
  { title: "12th Fail", imdb_rating: 8.7, original_language: "hi", year: 2023 },
  { title: "Rocketry: The Nambi Effect", imdb_rating: 8.6, original_language: "hi", year: 2022 },
  { title: "Dhurandhar", imdb_rating: 8.6, original_language: "hi", year: 2023 },
  { title: "The Kashmir Files", imdb_rating: 8.5, original_language: "hi", year: 2022 },
  { title: "Dangal", imdb_rating: 8.3, original_language: "hi", year: 2016 }
  // ... more results
]
```

---

### 3. Top Rated Tamil Movies (Last 10 Years)

```javascript
// MongoDB Query - 15k votes threshold
db.merged_catalog.find({
  content_type: "movie",
  original_language: "ta",
  imdb_rating: { $gte: 8.0 },
  imdb_rating_count: { $gte: 15000 },  // Lowered from 50k to 15k
  year: { $gte: 2016 },
  imdb_id: { $nin: ["tt9263550"] } // Exclude Rocketry (corrected to Hindi)
})
.sort({ imdb_rating: -1, imdb_rating_count: -1, release_date: -1 })
.limit(15)
.toArray();
```

**Expected Results (22 total):**
```javascript
[
  { title: "Peranbu", imdb_rating: 8.7, original_language: "ta", year: 2019 },
  { title: "Soorarai Pottru", imdb_rating: 8.6, original_language: "ta", year: 2020 },
  { title: "Jai Bhim", imdb_rating: 8.6, original_language: "ta", year: 2021 },
  { title: "Pariyerum Perumal", imdb_rating: 8.6, original_language: "ta", year: 2018 },
  { title: "Sarpatta Parambarai", imdb_rating: 8.5, original_language: "ta", year: 2021 },
  { title: "96", imdb_rating: 8.5, original_language: "ta", year: 2018 },
  { title: "Kaithi", imdb_rating: 8.4, original_language: "ta", year: 2019 },
  { title: "Maharaja", imdb_rating: 8.3, original_language: "ta", year: 2024 },
  { title: "Vikram", imdb_rating: 8.3, original_language: "ta", year: 2022 }
  // ... 13 more results (22 total, Rocketry NOT included)
]
```

---

### 4. Top Rated English Movies (Last 10 Years)

```javascript
// MongoDB Query
db.merged_catalog.find({
  content_type: "movie",
  original_language: "en",
  imdb_rating: { $gte: 8.0 },
  imdb_rating_count: { $gte: 50000 },
  year: { $gte: 2016 }
})
.sort({ imdb_rating: -1, imdb_rating_count: -1, release_date: -1 })
.limit(15)
.toArray();
```

**Expected Results:**
```javascript
[
  { title: "Oppenheimer", imdb_rating: 8.3, original_language: "en", year: 2023 },
  { title: "Dune: Part Two", imdb_rating: 8.2, original_language: "en", year: 2024 },
  { title: "The Batman", imdb_rating: 7.8, original_language: "en", year: 2022 }
  // ... more results
]
```

---

### 5. Top Rated Action Movies

```javascript
// MongoDB Query
db.merged_catalog.find({
  content_type: "movie",
  "genres.name": { $regex: /action/i },
  imdb_rating: { $gte: 8.0 },
  imdb_rating_count: { $gte: 50000 },
  year: { $gte: 2016 }
})
.sort({ imdb_rating: -1, imdb_rating_count: -1, release_date: -1 })
.limit(15)
.toArray();

// Or using $elemMatch for exact genre matching
db.merged_catalog.find({
  content_type: "movie",
  genres: { $elemMatch: { name: "Action" } },
  imdb_rating: { $gte: 8.0 },
  imdb_rating_count: { $gte: 50000 },
  year: { $gte: 2016 }
})
.sort({ imdb_rating: -1, imdb_rating_count: -1, release_date: -1 })
.limit(15)
.toArray();
```

---

### 6. Top Rated Movies by Decade (2010s)

```javascript
// MongoDB Query - Movies from 2010-2019
db.merged_catalog.find({
  content_type: "movie",
  imdb_rating: { $gte: 8.0 },
  imdb_rating_count: { $gte: 50000 },
  year: { $gte: 2010, $lte: 2019 }
})
.sort({ imdb_rating: -1, imdb_rating_count: -1, release_date: -1 })
.limit(15)
.toArray();
```

---

### 7. Count Movies by Language

```javascript
// Get count of high-rated movies per language
db.merged_catalog.aggregate([
  {
    $match: {
      content_type: "movie",
      imdb_rating: { $gte: 8.0 },
      imdb_rating_count: { $gte: 50000 },
      original_language: { $exists: true, $ne: null }
    }
  },
  {
    $group: {
      _id: "$original_language",
      count: { $sum: 1 },
      avg_rating: { $avg: "$imdb_rating" },
      titles: { $push: "$title" }
    }
  },
  { $sort: { count: -1 } },
  { $limit: 20 }
]);
```

**Expected Results:**
```javascript
[
  { _id: "en", count: 1250, avg_rating: 8.2 },
  { _id: "hi", count: 87, avg_rating: 8.3 },
  { _id: "ta", count: 45, avg_rating: 8.4 },
  { _id: "te", count: 32, avg_rating: 8.3 },
  { _id: "ko", count: 28, avg_rating: 8.5 },
  { _id: "ja", count: 25, avg_rating: 8.4 }
]
```

---

### 8. Top Rated Movies with Aggregation Stats

```javascript
// Get top movies with additional stats
db.merged_catalog.aggregate([
  {
    $match: {
      content_type: "movie",
      imdb_rating: { $gte: 8.0 },
      imdb_rating_count: { $gte: 50000 },
      year: { $gte: 2016 }
    }
  },
  {
    $addFields: {
      rating_score: {
        $multiply: [
          "$imdb_rating",
          { $log10: { $add: ["$imdb_rating_count", 1] } }
        ]
      }
    }
  },
  { $sort: { rating_score: -1 } },
  { $limit: 15 },
  {
    $project: {
      title: 1,
      year: 1,
      imdb_rating: 1,
      imdb_rating_count: 1,
      rating_score: { $round: ["$rating_score", 2] },
      original_language: 1,
      genres: 1
    }
  }
]);
```

---

## API Query Examples

Base URL: `https://content-api-401132033262.asia-south1.run.app`

**Note:** When using `sort=rating`, the API automatically applies tie-breakers:
1. Primary: IMDb rating (descending)
2. Secondary: Vote count (descending)
3. Tertiary: Release date (descending)

This ensures consistent, deterministic ordering for movies with the same rating.

### 1. Top Rated Movies (Last 5 Years)

```bash
curl -s "https://content-api-401132033262.asia-south1.run.app/api/content?min_rating=8&min_votes=50000&type=movie&year_from=2021&sort=rating&order=desc&limit=15" \
  | jq '.items[] | {title, year, imdb_rating, original_language}'
```

**Response:**
```json
{
  "items": [
    {
      "title": "12th Fail",
      "year": 2023,
      "imdb_rating": 8.7,
      "original_language": "hi"
    },
    {
      "title": "Oppenheimer",
      "year": 2023,
      "imdb_rating": 8.3,
      "original_language": "en"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 15,
    "total": 245,
    "pages": 17
  }
}
```

---

### 2. Top Rated Hindi Movies

```bash
curl -s "https://content-api-401132033262.asia-south1.run.app/api/content?min_rating=8&min_votes=50000&type=movie&original_language=hi&year_from=2016&sort=rating&order=desc&limit=15" \
  | jq '.items[] | "\(.imdb_rating) - \(.title) (\(.year))"'
```

**Response:**
```
"8.7 - 12th Fail (2023)"
"8.6 - Rocketry: The Nambi Effect (2022)"
"8.6 - Dhurandhar (2023)"
"8.5 - The Kashmir Files (2022)"
"8.3 - Dangal (2016)"
```

---

### 3. Top Rated Tamil Movies

```bash
curl -s "https://content-api-401132033262.asia-south1.run.app/api/content?min_rating=8&min_votes=50000&type=movie&original_language=ta&year_from=2016&sort=rating&order=desc&limit=15" \
  | jq '.items[] | "\(.imdb_rating) - \(.title) (\(.year))"'
```

**Response:**
```
"8.6 - Soorarai Pottru (2020)"
"8.6 - Jai Bhim (2021)"
"8.4 - Kaithi (2019)"
"8.3 - Maharaja (2024)"
"8.3 - Vikram (2022)"
```

---

### 4. Top Rated Action Movies

```bash
curl -s "https://content-api-401132033262.asia-south1.run.app/api/content?min_rating=8&min_votes=50000&type=movie&genre=Action&year_from=2016&sort=rating&order=desc&limit=15" \
  | jq '.items[0:5] | .[] | {title, imdb_rating, genres: [.genres[].name]}'
```

---

### 5. Get Single Movie Details

```bash
# By IMDb ID
curl -s "https://content-api-401132033262.asia-south1.run.app/api/content/tt9263550" \
  | jq '{title, imdb_rating, original_language, languages, year, cast: [.cast[0:3][].name]}'
```

**Response:**
```json
{
  "title": "Rocketry: The Nambi Effect",
  "imdb_rating": 8.6,
  "original_language": "hi",
  "languages": ["Hindi", "English", "Tamil", "French"],
  "year": 2022,
  "cast": ["R. Madhavan", "Simran", "Rajit Kapur"]
}
```

---

### 6. Search Movies

```bash
curl -s "https://content-api-401132033262.asia-south1.run.app/api/search?q=Rocketry&limit=5" \
  | jq '.items[] | {title, imdb_id, year, imdb_rating}'
```

---

## Frontend Implementation

### File: `/web/src/app/page.tsx`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { ContentRow } from '@/components/sections/content-row';
import api from '@/services/api';

export default function HomePage() {
  // Calculate dynamic year ranges
  const fiveYearsAgo = new Date().getFullYear() - 5;
  const tenYearsAgo = new Date().getFullYear() - 10;

  // 1. Top Rated Movies (Last 5 Years)
  const { data: topRatedRecentData, isLoading: topRatedRecentLoading } = useQuery({
    queryKey: ['topRatedRecent'],
    queryFn: () => api.getContent({
      min_rating: 8,
      min_votes: 50000,
      type: 'movie',
      year_from: fiveYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // 2. Top Rated English Movies (Last 10 Years)
  const { data: topRatedEnglishData, isLoading: topRatedEnglishLoading } = useQuery({
    queryKey: ['topRatedEnglish'],
    queryFn: () => api.getContent({
      min_rating: 8,
      min_votes: 50000,
      type: 'movie',
      original_language: 'en',
      year_from: tenYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // 3. Top Rated Hindi Movies (Last 10 Years)
  const { data: topRatedHindiData, isLoading: topRatedHindiLoading } = useQuery({
    queryKey: ['topRatedHindi'],
    queryFn: () => api.getContent({
      min_rating: 8,
      min_votes: 50000,
      type: 'movie',
      original_language: 'hi',
      year_from: tenYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // ... More language-specific queries (Tamil, Telugu, etc.)

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      {/* ... */}

      {/* Content Rows */}
      <div className="space-y-8 pl-12 lg:pl-16">
        {/* Row 1: Top Rated Movies (Last 5 Years) */}
        <ContentRow
          title="Top Rated Movies"
          contents={topRatedRecentData?.items || []}
          isLoading={topRatedRecentLoading}
          href="/browse?min_rating=8&sort=rating"
        />

        {/* Row 2: Top Rated English Movies */}
        <ContentRow
          title="Top Rated English Movies"
          contents={topRatedEnglishData?.items || []}
          isLoading={topRatedEnglishLoading}
          href="/browse?original_language=en&min_rating=8&sort=rating"
        />

        {/* Row 3: Top Rated Hindi Movies */}
        <ContentRow
          title="Top Rated Hindi Movies"
          contents={topRatedHindiData?.items || []}
          isLoading={topRatedHindiLoading}
          href="/browse?original_language=hi&min_rating=8&sort=rating"
        />

        {/* ... More rows */}
      </div>
    </div>
  );
}
```

### Adding a New Top Rated Row (Example: Korean Movies)

```typescript
// Step 1: Add query hook
const { data: topRatedKoreanData, isLoading: topRatedKoreanLoading } = useQuery({
  queryKey: ['topRatedKorean'],
  queryFn: () => api.getContent({
    min_rating: 8,
    min_votes: 50000,
    type: 'movie',
    original_language: 'ko',  // Korean ISO code
    year_from: tenYearsAgo,
    sort: 'rating',
    order: 'desc',
    limit: 15
  }),
});

// Step 2: Add JSX row
<ContentRow
  title="Top Rated Korean Movies"
  contents={topRatedKoreanData?.items || []}
  isLoading={topRatedKoreanLoading}
  href="/browse?original_language=ko&min_rating=8&sort=rating"
/>
```

---

## Manual Language Corrections

### The Problem: Incorrect Metadata

Some movies have wrong `original_language` values in the database. For example:
- **"Rocketry: The Nambi Effect"** was shot simultaneously in Hindi, Tamil, and English
- Database has: `original_language: "ta"` (Tamil)
- Should be: `original_language: "hi"` (Hindi)

### The Solution: LANGUAGE_CORRECTIONS

Located in `/api/server.js`:

```javascript
// Manual corrections for incorrect original_language metadata
// Maps IMDb ID to correct ISO 639-1 language code
const LANGUAGE_CORRECTIONS = {
  'tt9263550': 'hi', // Rocketry: The Nambi Effect (Hindi, not Tamil)
  // Add more corrections here
};
```

### How It Works

1. **During Database Filtering:**
   - When API receives `original_language=hi`, it includes:
     - Movies with `original_language: "hi"` AND NOT in correction keys
     - Movies with `imdb_id` in corrections mapped to `"hi"`
   - When API receives `original_language=ta`, it:
     - Includes Tamil movies EXCEPT those corrected to other languages
     - Excludes `tt9263550` (Rocketry)

2. **In API Response:**
   - `applyLanguageCorrections()` overrides the `original_language` field
   - Rocketry returns with `original_language: "hi"` instead of `"ta"`

### Adding a New Correction

**Step 1: Find IMDb ID**

```bash
# Search for the movie
curl -s "https://content-api-401132033262.asia-south1.run.app/api/search?q=Movie+Name&limit=1" \
  | jq '.items[0] | {title, imdb_id, original_language, languages}'
```

**Example Output:**
```json
{
  "title": "KGF: Chapter 2",
  "imdb_id": "tt10698680",
  "original_language": "kn",
  "languages": ["Kannada", "Hindi", "Tamil", "Telugu"]
}
```

**Step 2: Add to LANGUAGE_CORRECTIONS**

Edit `/api/server.js`:

```javascript
const LANGUAGE_CORRECTIONS = {
  'tt9263550': 'hi',   // Rocketry: The Nambi Effect (Hindi, not Tamil)
  'tt10698680': 'hi',  // KGF: Chapter 2 (Hindi, not Kannada)
};
```

**Step 3: Deploy Backend**

```bash
cd /path/to/tldrcontent
git add api/server.js
git commit -m "feat: Add language correction for KGF: Chapter 2"
git push origin main

gcloud run deploy content-api \
  --source . \
  --region=asia-south1 \
  --allow-unauthenticated \
  --set-secrets=MONGO_URI=content-api-mongo-uri:latest
```

**Step 4: Verify Correction**

```bash
# Check movie now shows corrected language
curl -s "https://content-api-401132033262.asia-south1.run.app/api/content/tt10698680" \
  | jq '{title, original_language}'

# Output: {"title": "KGF: Chapter 2", "original_language": "hi"}

# Verify it appears in Hindi row
curl -s "https://content-api-401132033262.asia-south1.run.app/api/content?original_language=hi&min_rating=8&min_votes=50000&limit=20" \
  | jq '.items[] | select(.imdb_id == "tt10698680") | {title, imdb_rating}'

# Verify it does NOT appear in Kannada row
curl -s "https://content-api-401132033262.asia-south1.run.app/api/content?original_language=kn&min_rating=8&min_votes=50000&limit=20" \
  | jq '.items[] | select(.imdb_id == "tt10698680")'
# Output: (empty - movie excluded from Kannada results)
```

---

## Troubleshooting

### 1. Row Shows No Results

**Possible Causes:**
- No movies match all filter criteria
- Year range too restrictive
- Vote count threshold too high
- Wrong ISO language code

**Debug:**
```bash
# Test without vote filter
curl -s "https://content-api-401132033262.asia-south1.run.app/api/content?original_language=hi&min_rating=8&limit=5" \
  | jq '.items | length'

# Test directly in MongoDB
db.merged_catalog.countDocuments({
  original_language: "hi",
  imdb_rating: { $gte: 8.0 },
  content_type: "movie"
})
```

### 2. Wrong Movies in Language Row

**Problem:** Dubbed movies appearing in language-specific rows

**Solution:** Use `original_language` instead of `language`:
```typescript
// ❌ Wrong - includes dubbed movies
language: 'Hindi'

// ✅ Correct - original Hindi movies only
original_language: 'hi'
```

### 3. Movie Appears in Wrong Row

**Problem:** Multilingual movie in incorrect language row

**Solution:** Add to LANGUAGE_CORRECTIONS (see section above)

### 4. API Returns 500 Error

**Debug:**
```bash
# Check API health
curl "https://content-api-401132033262.asia-south1.run.app/health"

# Check Cloud Run logs
gcloud run services logs read content-api --region=asia-south1 --limit=50

# Test MongoDB connection
mongosh "your-connection-string" --eval "db.merged_catalog.countDocuments({})"
```

### 5. Slow Query Performance

**Solutions:**
1. Ensure indexes exist (see Database Schema section)
2. Reduce `limit` value
3. Use React Query caching:
   ```typescript
   useQuery({
     queryKey: ['topRated'],
     queryFn: () => api.getContent({...}),
     staleTime: 5 * 60 * 1000, // Cache for 5 minutes
   });
   ```

---

## ISO 639-1 Language Codes Reference

| Language | ISO Code | Example Movie |
|----------|----------|---------------|
| English | `en` | Oppenheimer |
| Hindi | `hi` | 12th Fail, Rocketry |
| Tamil | `ta` | Soorarai Pottru |
| Telugu | `te` | RRR |
| Malayalam | `ml` | Drishyam |
| Kannada | `kn` | Kantara |
| Bengali | `bn` | Pather Panchali |
| Bhojpuri | `bho` | |
| Korean | `ko` | Parasite |
| Japanese | `ja` | Spirited Away |
| Mandarin | `zh` | Crouching Tiger |
| Spanish | `es` | Pan's Labyrinth |
| French | `fr` | Amélie |
| German | `de` | Das Leben der Anderen |
| Russian | `ru` | Solaris |

**Full list:** https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes

---

## Quick Reference

### Top Rated Movies Variants

| Variant | Filters | Code |
|---------|---------|------|
| General (5 yrs) | `min_rating=8, min_votes=50000, year_from=2021` | `original_language` not specified |
| English | `original_language=en, min_rating=8, min_votes=50000, year_from=2016` | `en` |
| Hindi | `original_language=hi, min_rating=8, min_votes=50000, year_from=2016` | `hi` |
| Tamil | `original_language=ta, min_rating=8, min_votes=50000, year_from=2016` | `ta` |
| Telugu | `original_language=te, min_rating=8, min_votes=50000, year_from=2016` | `te` |
| Action | `genre=Action, min_rating=8, min_votes=50000, year_from=2016` | Genre filter |
| 2010s | `min_rating=8, min_votes=50000, year_from=2010, year_to=2019` | Year range |

### Files to Edit

| Task | File | Location |
|------|------|----------|
| Add homepage row | `page.tsx` | `/web/src/app/page.tsx` |
| Add language correction | `server.js` | `/api/server.js` (LANGUAGE_CORRECTIONS) |
| Update TypeScript types | `index.ts` | `/web/src/types/index.ts` |

---

**Last Updated:** January 2026
**Database:** MongoDB `content_db.merged_catalog` (105,569+ items)
**API URL:** https://content-api-401132033262.asia-south1.run.app
**Frontend:** https://content.lumiolabs.in
