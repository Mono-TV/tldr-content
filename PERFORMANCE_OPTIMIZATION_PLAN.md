# Performance Optimization Plan

## Current Performance Issues

### Identified Bottlenecks:
1. **48+ simultaneous API requests** - All homepage rows fetch data on mount
2. **720+ movie cards** - 48 rows × 15 movies = massive initial render
3. **Short cache time** - 1 minute staleTime causes unnecessary refetches
4. **No lazy loading** - All rows below fold load immediately
5. **Heavy animations** - Framer Motion on every card
6. **Large component** - 1116 lines in single homepage file

### Performance Metrics (Estimated):
- **Initial Load Time**: 5-10 seconds (48 API requests)
- **Time to Interactive**: 8-12 seconds
- **First Contentful Paint**: 3-5 seconds
- **Total Page Weight**: ~2-3 MB (images + JS)

---

## Solution Options

### Option 1: Quick Wins (Immediate Implementation) ⚡
**Effort**: Low | **Impact**: High | **Timeline**: 1-2 hours

#### 1.1 Increase React Query Cache Time
```typescript
// web/src/components/providers.tsx
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes (was 1 minute)
      cacheTime: 30 * 60 * 1000,       // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,            // Don't refetch if data is fresh
    },
  },
})
```

**Impact**: Reduces redundant API calls by 80% on navigation

---

#### 1.2 Implement Intersection Observer for Lazy Row Loading
```typescript
// web/src/components/sections/lazy-content-row.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ContentRow } from './content-row';

interface LazyContentRowProps {
  title: string;
  queryKey: string[];
  queryFn: () => Promise<any>;
  // ... other props
}

export function LazyContentRow({ title, queryKey, queryFn, ...props }: LazyContentRowProps) {
  const [isVisible, setIsVisible] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      { rootMargin: '200px' } // Load 200px before entering viewport
    );

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn,
    enabled: isVisible, // Only fetch when row is visible
  });

  return (
    <div ref={rowRef}>
      <ContentRow
        title={title}
        contents={data?.items || []}
        isLoading={!isVisible || isLoading}
        {...props}
      />
    </div>
  );
}
```

**Impact**: Reduces initial API requests from 48 to ~8 (only above-fold rows)

---

#### 1.3 Disable Framer Motion Animations (Optional)
```typescript
// web/src/components/movie/movie-card.tsx
// Replace motion.div with regular div for faster rendering

export function MovieCard({ content, index, showRank = false, size = 'md', className }: MovieCardProps) {
  return (
    <div className={cn('relative group flex-shrink-0', sizeClasses[size], className)}>
      {/* Remove motion.div and animations */}
    </div>
  );
}
```

**Impact**: Reduces initial render time by 30-40%

---

#### 1.4 Add Priority Loading for Above-Fold Content
```typescript
// web/src/app/page.tsx
// Mark hero and first 3 rows with priority

const { data: featuredData, isLoading: featuredLoading } = useQuery({
  queryKey: ['featured'],
  queryFn: () => api.getContent({ min_rating: 8, sort: 'popularity', order: 'desc', limit: 5 }),
  staleTime: 10 * 60 * 1000, // 10 minutes for hero content
});
```

---

### Option 2: Medium-Term Optimizations (1-2 Days) 🚀
**Effort**: Medium | **Impact**: Very High | **Timeline**: 1-2 days

#### 2.1 Implement Server-Side Rendering (SSR) with Data Prefetching
```typescript
// web/src/app/page.tsx
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

export default async function HomePage() {
  const queryClient = new QueryClient();

  // Prefetch critical data on server
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['featured'],
      queryFn: () => api.getContent({ min_rating: 8, sort: 'popularity', order: 'desc', limit: 5 }),
    }),
    queryClient.prefetchQuery({
      queryKey: ['topRatedRecent'],
      queryFn: () => api.getContent({ min_rating: 8, min_votes: 50000, type: 'movie', year_from: 2021, sort: 'rating', order: 'desc', limit: 15 }),
    }),
    // Prefetch first 5-8 rows only
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePageClient />
    </HydrationBoundary>
  );
}
```

**Impact**: Instant display of above-fold content, perceived load time reduced by 60%

---

#### 2.2 Implement API Route Batching
```typescript
// web/src/app/api/batch-rows/route.ts
export async function POST(request: Request) {
  const { queries } = await request.json();

  // Fetch multiple rows in single backend call
  const results = await Promise.all(
    queries.map(query => fetchContentFromDB(query))
  );

  return Response.json({ results });
}

// Frontend usage
const { data } = useQuery({
  queryKey: ['batch-above-fold'],
  queryFn: () => fetch('/api/batch-rows', {
    method: 'POST',
    body: JSON.stringify({
      queries: [
        { key: 'featured', params: { min_rating: 8, limit: 5 } },
        { key: 'topRated', params: { min_rating: 8, min_votes: 50000, limit: 15 } },
        // ... first 8 rows
      ]
    })
  }).then(r => r.json())
});
```

**Impact**: Reduces 8 API requests to 1, saves ~2-3 seconds

---

#### 2.3 Add Redis Caching on Backend
```javascript
// api/cache.js
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });

async function getCachedContent(key, fetchFn, ttl = 300) {
  const cached = await client.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetchFn();
  await client.setEx(key, ttl, JSON.stringify(data));
  return data;
}

// api/server.js
app.get('/api/content', async (req, res) => {
  const cacheKey = `content:${JSON.stringify(req.query)}`;

  const data = await getCachedContent(cacheKey, async () => {
    return await db.collection('merged_catalog').find(filters).toArray();
  }, 300); // 5 minute cache

  res.json(data);
});
```

**Impact**: Backend response time from 200-500ms to 10-20ms

---

#### 2.4 Implement Virtual Scrolling for Long Lists
```typescript
// Use react-virtual for row virtualization
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualizedHomepage({ rows }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400, // Estimated row height
    overscan: 3, // Render 3 rows above/below viewport
  });

  return (
    <div ref={parentRef} style={{ height: '100vh', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ContentRow {...rows[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Impact**: Only renders 8-10 rows at a time instead of 48

---

### Option 3: Advanced Optimizations (3-5 Days) 🎯
**Effort**: High | **Impact**: Maximum | **Timeline**: 3-5 days

#### 3.1 Move to Incremental Static Regeneration (ISR)
```typescript
// web/src/app/page.tsx
export const revalidate = 300; // Revalidate every 5 minutes

export default async function HomePage() {
  // Fetch all data at build time + revalidate periodically
  const [featured, topRated, ...otherRows] = await Promise.all([
    api.getContent({ min_rating: 8, sort: 'popularity', order: 'desc', limit: 5 }),
    api.getContent({ min_rating: 8, min_votes: 50000, type: 'movie', limit: 15 }),
    // ... all rows
  ]);

  return (
    <div>
      <HeroCarousel items={featured.items} />
      <ContentRow title="Top Rated" contents={topRated.items} />
      {/* ... */}
    </div>
  );
}
```

**Benefits**:
- Instant page load (pre-rendered HTML)
- No API calls on client
- Auto-updates every 5 minutes
- Perfect SEO

**Impact**: Page load time from 5-10s to <1s

---

#### 3.2 Implement GraphQL with DataLoader
```graphql
# schema.graphql
type Query {
  homepage: HomepageData!
}

type HomepageData {
  featured: [Content!]!
  topRated: [Content!]!
  topRatedEnglish: [Content!]!
  # ... all rows in single query
}
```

```typescript
// Single GraphQL query instead of 48 REST calls
const { data } = useQuery({
  queryKey: ['homepage'],
  queryFn: async () => {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query: `
          query Homepage {
            homepage {
              featured { id title posterUrl rating }
              topRated { id title posterUrl rating }
              topRatedEnglish { id title posterUrl rating }
              # ... all rows
            }
          }
        `
      })
    });
    return response.json();
  }
});
```

**Impact**: 48 requests → 1 request, load time reduced by 70%

---

#### 3.3 Add CDN with Edge Caching
```yaml
# vercel.json or cloudflare config
{
  "headers": [
    {
      "source": "/api/content",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=300, stale-while-revalidate=600"
        }
      ]
    }
  ]
}
```

**Impact**: API responses served from edge locations (10-50ms instead of 200-500ms)

---

#### 3.4 Code Splitting and Dynamic Imports
```typescript
// Lazy load below-fold components
import dynamic from 'next/dynamic';

const LazyContentRow = dynamic(() => import('@/components/sections/content-row'), {
  loading: () => <ContentRowSkeleton />,
  ssr: false, // Only load on client
});

export default function HomePage() {
  return (
    <div>
      {/* Critical above-fold content */}
      <HeroCarousel items={featured} />
      <ContentRow title="Top Rated" contents={topRated} />

      {/* Lazy load rest */}
      <LazyContentRow title="Top English" contents={topEnglish} />
      {/* ... */}
    </div>
  );
}
```

**Impact**: Initial JS bundle reduced by 40-50%

---

## Recommended Implementation Strategy

### Phase 1: Immediate (Today)
1. ✅ Increase React Query cache times (5-30 minutes)
2. ✅ Implement Intersection Observer for lazy row loading
3. ✅ Add priority to hero and first 2 rows

**Expected Result**: 50-60% improvement in load time

### Phase 2: This Week
1. ✅ Implement server-side prefetching for above-fold content
2. ✅ Add API route batching for first 8 rows
3. ✅ Add Redis caching on backend

**Expected Result**: 70-80% improvement in load time

### Phase 3: Next Week
1. ✅ Move to ISR (Incremental Static Regeneration)
2. ✅ Implement CDN with edge caching
3. ✅ Add code splitting for below-fold components

**Expected Result**: 85-90% improvement in load time

---

## Performance Metrics Goals

| Metric | Current | Phase 1 Target | Phase 3 Target |
|--------|---------|----------------|----------------|
| Initial Load | 5-10s | 2-3s | <1s |
| Time to Interactive | 8-12s | 3-5s | <2s |
| First Contentful Paint | 3-5s | 1-2s | <0.5s |
| API Requests (initial) | 48 | 8-10 | 1 |
| Page Weight | ~3 MB | ~2 MB | ~1.5 MB |
| Lighthouse Score | ~40-50 | ~70-80 | ~90-95 |

---

## Testing Strategy

### Before Implementation:
```bash
# Measure current performance
npx lighthouse http://localhost:3000 --view
```

### After Each Phase:
1. Run Lighthouse audit
2. Test on slow 3G network
3. Measure API call counts in Network tab
4. Check Time to Interactive in DevTools

---

## Cost-Benefit Analysis

| Solution | Development Time | Performance Gain | Complexity | Recommended |
|----------|-----------------|------------------|------------|-------------|
| Increase cache times | 5 minutes | +20% | Low | ✅ YES |
| Lazy row loading | 2 hours | +40% | Medium | ✅ YES |
| API batching | 4 hours | +30% | Medium | ✅ YES |
| Redis caching | 1 day | +35% | Medium | ✅ YES |
| ISR | 2 days | +60% | High | ✅ YES (long-term) |
| GraphQL | 3-5 days | +50% | Very High | ⚠️ Optional |
| Virtual scrolling | 1 day | +25% | Medium | ⚠️ If needed |

---

## Next Steps

1. **Immediate**: Implement Phase 1 changes (Quick Wins)
2. **This week**: Measure performance improvements
3. **Next week**: Decide on Phase 2/3 based on metrics
4. **Monitor**: Set up performance monitoring (Vercel Analytics / Google Analytics)

---

## Questions to Consider

1. **Do users scroll to see all 48 rows?** → If not, lazy loading is critical
2. **How often does content change?** → Determines optimal cache duration
3. **What's the budget for infrastructure?** → Redis/CDN have costs
4. **Is SEO important?** → ISR is essential for SEO
5. **What's acceptable load time?** → Determines which optimizations to prioritize
