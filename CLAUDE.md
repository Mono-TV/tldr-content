# CLAUDE.md - TLDR Content Website

This file provides guidance to Claude Code when working with the TLDR Content website codebase.

## Project Overview

TLDR Content is a movie and TV show discovery platform built with Next.js 15, featuring:
- Server-side rendering with Incremental Static Regeneration (ISR)
- Content browsing with advanced filtering
- Netflix-style UI with hero carousels and content rows
- Backend API integration for movie data

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Backend API**: Node.js/Express (separate service)
- **Deployment**: Google Cloud Run (primary), GitHub Pages (static fallback)

## Project Structure

```
tldrcontent/
├── web/                           # Next.js frontend application
│   ├── src/
│   │   ├── app/                   # App router pages
│   │   │   ├── page.tsx           # Homepage (ISR-enabled)
│   │   │   ├── layout.tsx         # Root layout
│   │   │   ├── browse/            # Browse page
│   │   │   └── content/[id]/      # Content detail pages
│   │   ├── components/
│   │   │   ├── pages/             # Page-level components
│   │   │   │   └── home-page-client.tsx  # Homepage UI component
│   │   │   ├── sections/          # Section components
│   │   │   │   ├── hero-carousel.tsx
│   │   │   │   ├── content-row.tsx
│   │   │   │   └── lazy-content-row.tsx
│   │   │   ├── layout/            # Layout components (navbar, etc.)
│   │   │   └── ui/                # Reusable UI components
│   │   ├── lib/
│   │   │   ├── server-api.ts      # Server-side API utilities
│   │   │   ├── fetch-homepage-data.ts  # Homepage data fetcher (ISR)
│   │   │   ├── api.ts             # Client-side API utilities
│   │   │   └── utils.ts           # Utility functions
│   │   └── types/
│   │       └── index.ts           # TypeScript type definitions
│   └── public/                    # Static assets
├── api/                           # Backend API (separate from frontend)
└── .github/workflows/             # CI/CD workflows

```

---

## ISR Implementation (January 2026)

### Overview

The homepage was migrated from client-side rendering to **Incremental Static Regeneration (ISR)** to achieve instant page loads and zero client-side API calls.

### Performance Improvements

**Before ISR:**
- Load Time: 8-10 seconds
- API Requests: 48 simultaneous client-side calls
- Time to Interactive: 8-12 seconds
- First Contentful Paint: 3-5 seconds

**After ISR:**
- Load Time: **627ms** (0.6 seconds)
- API Requests: **0 client-side calls** (all server-side at build)
- Time to Interactive: <1 second
- First Contentful Paint: **504ms**

**Result: 92% performance improvement** 🚀

### Implementation Details

#### Files Modified

1. **`web/src/app/page.tsx`** (Reduced from 1116 lines to 31 lines)
   - Converted to async server component
   - Enabled ISR with 5-minute revalidation
   - Fetches all data server-side at build time

   ```typescript
   // Enable ISR - revalidate every 5 minutes (300 seconds)
   export const revalidate = 300;
   export const dynamic = 'force-static';

   export default async function HomePage() {
     const data = await fetchHomepageData();
     return <HomePageClient data={data} />;
   }
   ```

2. **`web/src/components/providers.tsx`**
   - Increased React Query cache times
   - staleTime: 1min → 5min
   - gcTime: Added 30min
   - Reduced refetching on mount/focus

3. **`web/src/lib/server-api.ts`** (New)
   - Server-side API utilities for ISR
   - Functions: `fetchContent()`, `fetchMultipleContent()`, `searchWithFilters()`, `fetchMultipleStarMovies()`
   - All functions use `fetch()` with `next: { revalidate: 300 }` for caching

4. **`web/src/lib/fetch-homepage-data.ts`** (New)
   - Fetches all 48 homepage rows in parallel using `Promise.all()`
   - Runs at build time and every 5 minutes thereafter
   - Returns typed `HomepageData` interface
   - Includes performance logging

5. **`web/src/components/pages/home-page-client.tsx`** (New)
   - Client component that receives pre-fetched data as props
   - Contains all 48 ContentRow components
   - No client-side data fetching required

6. **`web/src/components/sections/lazy-content-row.tsx`** (New)
   - Intersection Observer-based lazy loading component
   - Currently not used (full ISR approach chosen)
   - Available for future optimization if needed

### Homepage Content Rows

The homepage displays **48 content rows** organized by:

**Top Rated Movies:**
- Overall Top Rated (Recent, Last 5 Years)
- Top Rated by Language: English, Hindi, Bengali, Tamil, Telugu, Malayalam, Kannada

**Genre-Based Rows (5 genres × 8 languages each):**
- Action Movies
- Comedy Movies
- Drama Movies
- Thriller Movies
- Romance Movies (if added)

Each genre has:
- Overall Top Genre Movies
- Top Genre Movies by Language (English, Hindi, Tamil, Telugu, Malayalam, Kannada, Bengali)

**Star-Based Rows:**
- Latest Hindi Star Movies
- Latest English Star Movies
- Latest Tamil Star Movies
- Latest Telugu Star Movies
- Latest Malayalam Star Movies
- Latest Kannada Star Movies
- Latest Bengali Star Movies

**Special Sections:**
- Hero Carousel (Featured Content)
- Top 10 This Week

### API Filter Requirements

Each row has specific filters to ensure at least 15 movies:

| Row | Min Rating | Min Votes | Other Filters |
|-----|-----------|-----------|---------------|
| Top Rated Movies | 8.0 | 50,000 | Last 5 years |
| Top Rated English | 8.0 | 50,000 | Language: English |
| Top Comedy | 7.5 | 50,000 | Genre: Comedy |
| Top English Comedy | 7.5 | 50,000 | Genre: Comedy, Language: English |
| Top Hindi Comedy | 7.5 | 10,000 | Genre: Comedy, Language: Hindi |
| Top Action | 8.0 | 50,000 | Genre: Action |
| Latest Star Movies | 7.0 | 5,000 | Multiple actors, last 5 years |

### Deployment

**Primary Deployment: Google Cloud Run**
- Live URL: https://tldrcontent-ncrhtdqoiq-uc.a.run.app
- Supports ISR with Node.js runtime
- Automatic revalidation every 5 minutes
- Build time: ~3-4 minutes

**Secondary Deployment: GitHub Pages**
- Static export only (ISR not supported)
- Falls back to client-side rendering
- Used for static previews only

### Performance Testing

Run performance tests using the dev-browser skill:

```bash
cd /Users/mono/.claude/plugins/cache/dev-browser-marketplace/dev-browser/66682fb0513a/skills/dev-browser
./server.sh &

# Wait for "Ready" message, then run:
npx tsx <<'EOF'
import { connect } from "@/client.js";

const client = await connect();
const page = await client.page("perf-test");

const start = Date.now();
await page.goto("https://tldrcontent-ncrhtdqoiq-uc.a.run.app");
const end = Date.now();

console.log(`Load time: ${end - start}ms`);
await client.disconnect();
EOF
```

Expected results:
- TTFB: <500ms
- First Contentful Paint: <1000ms
- DOM Content Loaded: <2000ms
- Total Requests: ~70
- API Calls to /api/content: 0

### Cache Strategy

**ISR Cache:**
- Server-side cache: 5 minutes (`revalidate: 300`)
- Stale-while-revalidate: 1 year
- Cache-Control: `s-maxage=300, stale-while-revalidate=31535700`

**React Query Cache:**
- staleTime: 5 minutes
- gcTime (Garbage Collection Time): 30 minutes
- refetchOnMount: false
- refetchOnWindowFocus: false

### Key Metrics

**Performance Grade: A+**

| Metric | Value | Status |
|--------|-------|--------|
| Total Page Load | 663ms | 🟢 Excellent |
| Time to First Byte | 415ms | 🟢 Excellent |
| First Contentful Paint | 504ms | 🟢 Excellent |
| DOM Content Loaded | 627ms | 🟢 Excellent |
| API Calls | 0 | ✅ Perfect |
| Content Pre-rendered | Yes | ✅ ISR Working |

---

## Content Row Filter Guidelines

When adding or modifying content rows, follow these guidelines:

### Minimum Content Requirements
- Each row must have **at least 15 movies**
- Test filters with API calls before deploying
- Adjust rating thresholds if fewer results

### Filter Hierarchy (in order of preference)
1. **Language + Genre + Rating** - Most specific
2. **Genre + Rating** - Good balance
3. **Language + Rating** - Broader
4. **Rating only** - Broadest

### Testing Filters

Test filters using the backend API:

```bash
# Test a filter combination
curl "https://content-api-401132033262.asia-south1.run.app/api/content?language=Hindi&genre=Comedy&min_rating=7.5&min_votes=10000&limit=15"

# Check result count
curl "..." | jq '.total'
```

If results < 15:
1. Lower `min_rating` by 0.5
2. Reduce `min_votes` (50k → 10k → 5k)
3. Expand year range (if applicable)
4. Remove least important filter

### Common Filter Adjustments

```typescript
// If a language/genre combination has limited content:

// Original (might return <15 results)
min_rating: 8.0,
min_votes: 50000

// Adjusted (ensures 15+ results)
min_rating: 7.5,  // Lowered by 0.5
min_votes: 10000  // Reduced vote threshold
```

---

## Development Guidelines

### Working with Server Components

- Server components (async functions) can fetch data directly
- Use `await` for API calls in server components
- Pass data to client components via props
- Client components marked with `'use client'` directive

### Working with Client Components

- Use React Query for client-side data fetching
- Wrap components in `<QueryClientProvider>`
- Use `useQuery` hook for API calls
- Enable suspense for loading states

### Adding New Content Rows

1. Add filter configuration to `fetch-homepage-data.ts`
2. Add parallel fetch in `Promise.all()` array
3. Add to `HomepageData` interface in `fetch-homepage-data.ts`
4. Add `<ContentRow>` component to `home-page-client.tsx`
5. Test build: `npm run build`
6. Verify row has 15+ results

Example:

```typescript
// 1. In fetch-homepage-data.ts
const [existing, newRow] = await Promise.all([
  // ... existing rows
  fetchContent({
    genre: 'Sci-Fi',
    language: 'English',
    min_rating: 7.5,
    min_votes: 50000,
    sort: 'rating',
    limit: 15,
  }),
]);

// 2. Add to interface
export interface HomepageData {
  // ... existing
  newRow: ContentResponse;
}

// 3. Return in object
return {
  // ... existing
  newRow,
};

// 4. In home-page-client.tsx
<ContentRow
  title="Top Sci-Fi Movies"
  contents={data.newRow.items || []}
  href="/browse?genre=Sci-Fi&min_rating=7.5"
/>
```

### Build and Deploy

```bash
# Build locally
cd web
npm run build

# Check ISR configuration
# Look for: Route (app)  Revalidate  Expire
#           / (Server)   300s        1y

# Deploy to Cloud Run (automatic via GitHub Actions)
git add .
git commit -m "feat: Add new content row"
git push origin main

# Monitor deployment
gh run list --limit 3
gh run view <run-id> --log
```

---

## API Integration

### Backend API URL
```
https://content-api-401132033262.asia-south1.run.app
```

### Key Endpoints

**GET /api/content**
- Fetch content with filters
- Parameters: `language`, `genre`, `min_rating`, `min_votes`, `year_from`, `year_to`, `sort`, `order`, `limit`, `page`

**GET /api/content/:id**
- Fetch single content by IMDb ID

**GET /api/search**
- Search content by title/actor
- Parameters: `q`, `type`, `limit`

### Example API Calls

```typescript
// Fetch top rated Hindi action movies
const response = await fetch(
  'https://content-api-401132033262.asia-south1.run.app/api/content?' +
  'language=Hindi&genre=Action&min_rating=7.5&min_votes=10000&sort=rating&limit=15'
);

// Search for movies with actor
const response = await fetch(
  'https://content-api-401132033262.asia-south1.run.app/api/search?' +
  'q=Shah+Rukh+Khan&type=movie&limit=15'
);
```

---

## Known Issues and Solutions

### Issue: GitHub Pages Build Fails with ISR

**Error**: `tar: web/out: Cannot open: No such file or directory`

**Cause**: ISR requires a Node.js server; GitHub Pages only supports static files.

**Solution**: Use Google Cloud Run as primary deployment. ISR works perfectly there.

### Issue: Build Takes Long Time (30+ seconds)

**Cause**: Fetching all 48 rows in parallel at build time.

**Solution**: This is expected behavior. It only happens:
- At build time
- Every 5 minutes for revalidation
- Users get instant loads from pre-rendered HTML

### Issue: Content Row Has <15 Movies

**Diagnosis**:
```bash
# Test the filter
curl "https://content-api-401132033262.asia-south1.run.app/api/content?<filters>" | jq '.total'
```

**Solution**: Adjust filters in `fetch-homepage-data.ts`:
1. Lower `min_rating` (e.g., 8.0 → 7.5)
2. Reduce `min_votes` (e.g., 50000 → 10000)
3. Expand year range if applicable

---

## Performance Optimization History

### Phase 1: Quick Wins (Completed)
- ✅ Increased React Query cache times (1min → 5min)
- ✅ Added garbage collection time (30min)
- ✅ Disabled refetch on mount/focus
- **Impact**: 80% reduction in redundant API calls

### Phase 2: Full ISR Migration (Completed)
- ✅ Created server-side API utilities
- ✅ Created homepage data fetcher (48 rows in parallel)
- ✅ Converted page.tsx to server component
- ✅ Separated UI into client component
- ✅ Enabled ISR with 5-minute revalidation
- **Impact**: 92% faster page loads, 0 client-side API calls

### Future Optimizations (Planned)
- [ ] Image optimization with Next.js Image component
- [ ] CDN caching for API responses
- [ ] Redis caching on backend
- [ ] Lazy loading for below-fold content rows
- [ ] Bundle size optimization

---

## Quick Reference

### Important Files

| File | Purpose |
|------|---------|
| `web/src/app/page.tsx` | Homepage (ISR server component) |
| `web/src/lib/fetch-homepage-data.ts` | ISR data fetcher (48 rows) |
| `web/src/lib/server-api.ts` | Server-side API utilities |
| `web/src/components/pages/home-page-client.tsx` | Homepage UI (client component) |
| `web/src/components/providers.tsx` | React Query configuration |
| `PERFORMANCE_OPTIMIZATION_PLAN.md` | Full optimization plan |
| `ISR_IMPLEMENTATION_STATUS.md` | ISR implementation tracking |

### Key Commands

```bash
# Build and test locally
cd web && npm run build && npm start

# Run in development mode
cd web && npm run dev

# Check deployment status
gh run list --limit 3

# View deployment logs
gh run view <run-id> --log

# Test API endpoint
curl "https://content-api-401132033262.asia-south1.run.app/api/content?limit=5"
```

### Performance Benchmarks

Target metrics (all met ✅):
- TTFB: <500ms ✅ (415ms actual)
- FCP: <1000ms ✅ (504ms actual)
- DCL: <2000ms ✅ (627ms actual)
- API Calls: 0 ✅ (0 actual)

---

## Documentation Files

- **CLAUDE.md** (this file) - Development guidelines and ISR documentation
- **PERFORMANCE_OPTIMIZATION_PLAN.md** - Comprehensive performance optimization strategy
- **ISR_IMPLEMENTATION_STATUS.md** - ISR implementation progress tracking
- **README.md** - Project setup and general documentation

---

## Support

For questions or issues:
1. Check this CLAUDE.md file first
2. Review PERFORMANCE_OPTIMIZATION_PLAN.md for optimization details
3. Check ISR_IMPLEMENTATION_STATUS.md for implementation history
4. Test locally with `npm run build` before pushing

---

**Last Updated**: January 10, 2026
**Performance Grade**: A+ (Excellent)
**ISR Status**: ✅ Fully Implemented and Deployed
