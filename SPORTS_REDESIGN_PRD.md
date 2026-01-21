# Sports Page Redesign - Product Requirements Document

## Overview

Transform the sports page from a static category grid to a dynamic, time-aware content discovery experience that prioritizes live and upcoming content.

## Current State

The `/sports` page currently shows:
- 19 sport categories in a grid
- Static presentation (no time awareness)
- Drill-down navigation: Sports → Tournaments → Matches
- Unused components: `SportsPageClient`, `SportsHero`, `SportsRow`

## Target State

A Netflix-style sports homepage that:
- Highlights LIVE content prominently
- Shows upcoming matches (next 24 hours)
- Displays sport-specific rows with recent/upcoming content
- Maintains the "All Sports" grid for discovery

---

## Page Layout Specification

```
┌─────────────────────────────────────────────────────────────────┐
│  🔴 LIVE NOW (Hero Section) - Full width, 60vh               │
│  ┌──────────────┬────────────────────────────────────────────┐  │
│  │ Selected     │  [Live] [Live] [Live] [Live] →             │  │
│  │ Match Info   │  Horizontal scroll                         │  │
│  │ + Watch btn  │                                            │  │
│  └──────────────┴────────────────────────────────────────────┘  │
│  * Falls back to "Featured" if no live content                 │
├─────────────────────────────────────────────────────────────────┤
│  ⏰ STARTING SOON (Next 24 Hours)                              │
│  [Match] [Match] [Match] [Match] [Match] [Match] →             │
│  * Shows countdown timers on cards                              │
│  * Hidden if no upcoming matches                                │
├─────────────────────────────────────────────────────────────────┤
│  🏏 CRICKET                                    [View All →]    │
│  [Match] [Match] [Match] [Match] [Match] →                     │
│  * Sorted by: Live first → Upcoming → Recent                   │
├─────────────────────────────────────────────────────────────────┤
│  ⚽ FOOTBALL                                   [View All →]    │
│  [Match] [Match] [Match] [Match] [Match] →                     │
├─────────────────────────────────────────────────────────────────┤
│  🤼 KABADDI                                    [View All →]    │
│  [Match] [Match] [Match] [Match] [Match] →                     │
├─────────────────────────────────────────────────────────────────┤
│  🎾 TENNIS                                     [View All →]    │
│  [Match] [Match] [Match] [Match] [Match] →                     │
├─────────────────────────────────────────────────────────────────┤
│  🏸 BADMINTON                                  [View All →]    │
│  [Match] [Match] [Match] [Match] [Match] →                     │
├─────────────────────────────────────────────────────────────────┤
│  📂 ALL SPORTS                                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                      │
│  │     │ │     │ │     │ │     │ │     │   Grid of all 19     │
│  │ 🏏  │ │ ⚽  │ │ 🤼  │ │ 🎾  │ │ 🏸  │   sport categories   │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                      │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                      │
│  │ 🏑  │ │ 🎮  │ │ 🏎️  │ │ 🥊  │ │ 🏓  │                      │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Backend API Enhancements

**New Endpoints Required:**

| Endpoint | Purpose | Query Logic |
|----------|---------|-------------|
| `GET /api/sports/live` | Currently live matches | `live: true, asset_status: PUBLISHED` |
| `GET /api/sports/upcoming` | Next 24 hours | `start_date > now AND start_date < now+24h` |
| `GET /api/sports/recent/:sport` | Sport-specific content | Sorted by start_date, live first |

**File to Modify:** `api/server.js`

```javascript
// GET /api/sports/live
// Returns matches that are currently live
app.get('/api/sports/live', async (req, res) => {
  const limit = parseInt(req.query.limit) || 15;

  const results = await db.collection(SPORTS_COLLECTION)
    .find({
      live: true,
      asset_status: 'PUBLISHED',
      title: { $not: /automation|test/i },
    })
    .sort({ start_date: -1 })
    .limit(limit)
    .toArray();

  res.json({ items: results, total: results.length });
});

// GET /api/sports/upcoming
// Returns matches starting in the next 24 hours
app.get('/api/sports/upcoming', async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const now = Math.floor(Date.now() / 1000);
  const next24h = now + (24 * 60 * 60);

  const results = await db.collection(SPORTS_COLLECTION)
    .find({
      start_date: { $gt: now, $lt: next24h },
      asset_status: 'PUBLISHED',
      title: { $not: /automation|test/i },
    })
    .sort({ start_date: 1 }) // Ascending - soonest first
    .limit(limit)
    .toArray();

  res.json({ items: results, total: results.length });
});

// GET /api/sports/recent/:sport
// Returns recent content for a specific sport (live first, then by date)
app.get('/api/sports/recent/:sport', async (req, res) => {
  const sportName = req.params.sport;
  const limit = parseInt(req.query.limit) || 15;

  const results = await db.collection(SPORTS_COLLECTION)
    .find({
      game_name: sportName,
      asset_status: 'PUBLISHED',
      title: { $not: /automation|test/i },
    })
    .sort({ live: -1, start_date: -1 }) // Live first, then recent
    .limit(limit)
    .toArray();

  res.json({ items: results, total: results.length });
});
```

---

### Phase 2: Frontend Data Fetching

**File to Modify:** `web/src/lib/fetch-sports-data.ts`

**New Functions:**

```typescript
/**
 * Fetch currently live sports content
 */
export async function fetchLiveSports(limit: number = 15): Promise<SportsResponse> {
  console.log('[ISR] Fetching live sports...');

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/sports/live?limit=${limit}`,
      { next: { revalidate: 60 } } // 1-minute cache for live content
    );

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('[Sports] Error fetching live sports:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Fetch upcoming sports content (next 24 hours)
 */
export async function fetchUpcomingSports(limit: number = 20): Promise<SportsResponse> {
  console.log('[ISR] Fetching upcoming sports...');

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/sports/upcoming?limit=${limit}`,
      { next: { revalidate: 300 } } // 5-minute cache
    );

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('[Sports] Error fetching upcoming sports:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Fetch recent content for a specific sport (live first)
 */
export async function fetchRecentSportContent(
  sportName: string,
  limit: number = 15
): Promise<SportsResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/sports/recent/${encodeURIComponent(sportName)}?limit=${limit}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`[Sports] Error fetching recent ${sportName}:`, error);
    return { items: [], total: 0 };
  }
}

/**
 * Sports homepage data interface
 */
export interface SportsHomepageData {
  live: SportsResponse;
  upcoming: SportsResponse;
  cricket: SportsResponse;
  football: SportsResponse;
  kabaddi: SportsResponse;
  tennis: SportsResponse;
  badminton: SportsResponse;
  collections: SportCollection[];
}

/**
 * Fetch all sports homepage data in parallel
 */
export async function fetchSportsHomepageData(): Promise<SportsHomepageData> {
  console.log('[ISR] Fetching sports homepage data...');
  const startTime = Date.now();

  const [
    live,
    upcoming,
    cricket,
    football,
    kabaddi,
    tennis,
    badminton,
    collections,
  ] = await Promise.all([
    fetchLiveSports(15),
    fetchUpcomingSports(20),
    fetchRecentSportContent('Cricket', 15),
    fetchRecentSportContent('Football', 15),
    fetchRecentSportContent('Kabaddi', 15),
    fetchRecentSportContent('Tennis', 15),
    fetchRecentSportContent('Badminton', 15),
    fetchSportCollections(),
  ]);

  const endTime = Date.now();
  console.log(`[ISR] Fetched sports homepage data in ${endTime - startTime}ms`);

  return {
    live,
    upcoming,
    cricket,
    football,
    kabaddi,
    tennis,
    badminton,
    collections,
  };
}
```

---

### Phase 3: New Sports Homepage Component

**New File:** `web/src/components/pages/sports-homepage.tsx`

```typescript
'use client';

import { SportsHero } from '@/components/sports/sports-hero';
import { SportsRow } from '@/components/sports/sports-row';
import { SportsCollectionsGrid } from '@/components/sports/sports-collections-grid';
import type { SportsHomepageData } from '@/lib/fetch-sports-data';
import { SPORT_ICONS, SPORT_DISPLAY_NAMES, sportToSlug } from '@/types/sports';

interface SportsHomepageProps {
  data: SportsHomepageData;
}

export function SportsHomepage({ data }: SportsHomepageProps) {
  // Use live content for hero, fallback to featured/upcoming
  const heroContent = data.live.items.length > 0
    ? data.live.items
    : data.upcoming.items.length > 0
      ? data.upcoming.items
      : data.cricket.items; // Ultimate fallback

  const hasLive = data.live.items.length > 0;
  const hasUpcoming = data.upcoming.items.length > 0;

  return (
    <div className="min-h-screen">
      {/* Hero Section - Live or Featured */}
      <SportsHero
        items={heroContent}
        isLive={hasLive}
        title={hasLive ? '🔴 Live Now' : 'Featured Sports'}
      />

      {/* Content Rows Container */}
      <div className="-mt-20 relative z-10 pb-20 space-y-8 pl-12 lg:pl-16">

        {/* Starting Soon Row - Only show if upcoming content exists */}
        {hasUpcoming && (
          <SportsRow
            title="⏰ Starting Soon"
            subtitle="Next 24 hours"
            contents={data.upcoming.items}
            showCountdown={true}
            priorityCount={5}
          />
        )}

        {/* Cricket Row */}
        {data.cricket.items.length > 0 && (
          <SportsRow
            title={`${SPORT_ICONS['Cricket']} Cricket`}
            contents={data.cricket.items}
            sportType="Cricket"
            href={`/sports/${sportToSlug('Cricket')}`}
            priorityCount={3}
          />
        )}

        {/* Football Row */}
        {data.football.items.length > 0 && (
          <SportsRow
            title={`${SPORT_ICONS['Football']} Football`}
            contents={data.football.items}
            sportType="Football"
            href={`/sports/${sportToSlug('Football')}`}
          />
        )}

        {/* Kabaddi Row */}
        {data.kabaddi.items.length > 0 && (
          <SportsRow
            title={`${SPORT_ICONS['Kabaddi']} Kabaddi`}
            contents={data.kabaddi.items}
            sportType="Kabaddi"
            href={`/sports/${sportToSlug('Kabaddi')}`}
          />
        )}

        {/* Tennis Row */}
        {data.tennis.items.length > 0 && (
          <SportsRow
            title={`${SPORT_ICONS['Tennis']} Tennis`}
            contents={data.tennis.items}
            sportType="Tennis"
            href={`/sports/${sportToSlug('Tennis')}`}
          />
        )}

        {/* Badminton Row */}
        {data.badminton.items.length > 0 && (
          <SportsRow
            title={`${SPORT_ICONS['Badminton']} Badminton`}
            contents={data.badminton.items}
            sportType="Badminton"
            href={`/sports/${sportToSlug('Badminton')}`}
          />
        )}

        {/* All Sports Grid */}
        <section className="pt-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            📂 All Sports
          </h2>
          <SportsCollectionsGrid collections={data.collections} />
        </section>
      </div>
    </div>
  );
}
```

---

### Phase 4: Update Sports Page Route

**File to Modify:** `web/src/app/sports/page.tsx`

```typescript
import { fetchSportsHomepageData } from '@/lib/fetch-sports-data';
import { SportsHomepage } from '@/components/pages/sports-homepage';

// ISR with 1-minute revalidation (more frequent for live content)
export const revalidate = 60;

export default async function SportsPage() {
  const data = await fetchSportsHomepageData();
  return <SportsHomepage data={data} />;
}
```

---

### Phase 5: Enhanced Components

#### 5.1 SportsHero Enhancement

**Add props for live indicator:**

```typescript
interface SportsHeroProps {
  items: SportsContent[];
  isLive?: boolean;     // NEW: Show live indicator
  title?: string;       // NEW: Custom title
}
```

#### 5.2 SportsRow Enhancement

**Add countdown support:**

```typescript
interface SportsRowProps {
  title: string;
  subtitle?: string;
  contents: SportsContent[];
  isLoading?: boolean;
  sportType?: string;
  cardSize?: 'sm' | 'md' | 'lg';
  priorityCount?: number;
  href?: string;           // NEW: "View All" link
  showCountdown?: boolean; // NEW: Show countdown on cards
}
```

#### 5.3 SportsCard Enhancement

**Add countdown timer:**

```typescript
// In SportsCard component
function CountdownBadge({ startDate }: { startDate: number }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = startDate - now;

      if (diff <= 0) {
        setTimeLeft('Starting...');
        return;
      }

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [startDate]);

  return (
    <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs font-semibold px-2 py-1 rounded">
      ⏰ {timeLeft}
    </div>
  );
}
```

#### 5.4 New: SportsCollectionsGrid Component

**Extract grid from current SportsCollectionsPage:**

```typescript
// web/src/components/sports/sports-collections-grid.tsx
interface SportsCollectionsGridProps {
  collections: SportCollection[];
  compact?: boolean; // For homepage (smaller cards)
}

export function SportsCollectionsGrid({ collections, compact = false }: SportsCollectionsGridProps) {
  return (
    <div className={cn(
      "grid gap-4",
      compact
        ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8"
        : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    )}>
      {collections.map((collection) => (
        <SportCollectionCard
          key={collection.name}
          collection={collection}
          compact={compact}
        />
      ))}
    </div>
  );
}
```

---

## ISR Cache Strategy

| Content Type | Revalidation | Rationale |
|--------------|--------------|-----------|
| Live content | 60 seconds | Near real-time for live status |
| Upcoming | 5 minutes | Balance freshness vs server load |
| Sport rows | 5 minutes | Standard content refresh |
| Collections | 5 minutes | Static-ish metadata |
| Main page | 60 seconds | Reflects live/upcoming changes |

---

## Files to Create/Modify

### New Files:
1. `web/src/components/pages/sports-homepage.tsx` - New homepage component
2. `web/src/components/sports/sports-collections-grid.tsx` - Extracted grid component
3. `web/src/components/sports/countdown-badge.tsx` - Countdown timer component

### Modified Files:
1. `api/server.js` - Add 3 new endpoints
2. `web/src/lib/fetch-sports-data.ts` - Add new fetch functions
3. `web/src/app/sports/page.tsx` - Use new homepage component
4. `web/src/components/sports/sports-hero.tsx` - Add isLive prop
5. `web/src/components/sports/sports-row.tsx` - Add href, showCountdown props
6. `web/src/components/sports/sports-card.tsx` - Add countdown display

---

## Implementation Order

1. **Backend First** (30 min)
   - Add `/api/sports/live` endpoint
   - Add `/api/sports/upcoming` endpoint
   - Add `/api/sports/recent/:sport` endpoint
   - Deploy API

2. **Data Layer** (20 min)
   - Add `fetchLiveSports()`
   - Add `fetchUpcomingSports()`
   - Add `fetchRecentSportContent()`
   - Add `fetchSportsHomepageData()`
   - Add `SportsHomepageData` interface

3. **Components** (45 min)
   - Create `SportsCollectionsGrid`
   - Create `CountdownBadge`
   - Update `SportsHero` with isLive prop
   - Update `SportsRow` with href, countdown props
   - Update `SportsCard` with countdown display

4. **Homepage** (30 min)
   - Create `SportsHomepage` component
   - Update `/sports/page.tsx` to use it
   - Update loading state

5. **Testing & Polish** (15 min)
   - Test with live content (if available)
   - Test upcoming content
   - Test fallback behavior
   - Deploy and verify

---

## Success Metrics

- [ ] Live matches appear in hero section when available
- [ ] Upcoming matches show countdown timers
- [ ] Sport rows show live content first, then recent
- [ ] "View All" links work for each sport
- [ ] All Sports grid appears at bottom
- [ ] Page refreshes every 60 seconds for live content
- [ ] Graceful fallback when no live/upcoming content
- [ ] Mobile responsive layout

---

## Visual Mockup Reference

```
LIVE NOW (when live content exists)
┌─────────────────────────────────────────────────┐
│ 🔴 LIVE                                         │
│                                                 │
│ India vs Australia                              │
│ Cricket • 3rd Test Day 2                        │
│                                                 │
│ [▶ Watch Live]                                 │
│                                                 │
│     [LIVE] [LIVE] [LIVE] [Upcoming] →          │
└─────────────────────────────────────────────────┘

STARTING SOON
┌─────────────────────────────────────────────────┐
│ ⏰ Starting Soon • Next 24 hours                │
│                                                 │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │ ⏰ 2h 30m│ │ ⏰ 4h 15m│ │ ⏰ 8h    │  →      │
│ │          │ │          │ │          │         │
│ │ Chelsea  │ │ RCB vs   │ │ Nadal vs │         │
│ │ vs       │ │ MI       │ │ Djokovic │         │
│ │ Arsenal  │ │          │ │          │         │
│ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────┘
```

---

**Document Version:** 1.0
**Created:** January 21, 2026
**Status:** Ready for Implementation
