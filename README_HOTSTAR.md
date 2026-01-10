# Hotstar API Integration - Quick Start Guide

🎉 **Status: FULLY WORKING** ✅

---

## Quick Start (30 seconds)

### 1. Generate Token
```bash
cd /Users/mono/Documents/Programs/Lumio/tldrcontent
python3 scripts/generate-token.py
```

### 2. Copy Output to `.env.local`
The script outputs the token - copy it to `web/.env.local`:
```env
HOTSTAR_TOKEN=st=xxx~exp=xxx~acl=/*~hmac=xxx
```

### 3. Test API
```bash
# Token from step 1
TOKEN="st=xxx~exp=xxx~acl=/*~hmac=xxx"

curl "https://pp-catalog-api.hotstar.com/movie/search?partner=92837456123&orderBy=contentId&order=desc&offset=0&size=5" \
  --header 'x-country-code: in' \
  --header 'x-platform-code: ANDROID' \
  --header 'x-partner-name: 92837456123' \
  --header 'x-region-code: DL' \
  --header 'x-client-code: pt' \
  --header "hdnea: $TOKEN"
```

**Expected Response:** 200 OK with JSON movie data

---

## What's Available

### Content Library
- **51,495 Movies**
- **TV Shows** (thousands)
- **Episodes**
- **Sports/Matches**
- **Live Content**

### API Endpoints
| Endpoint | Path | Purpose |
|----------|------|---------|
| Movies | `/movie/search` | Fetch movies |
| Shows | `/show/search` | Fetch TV shows |
| Seasons | `/season/search` | Fetch seasons by showId |
| Episodes | `/episode/search` | Fetch episodes |
| Sports | `/match/search` | Fetch sports/live matches |
| Channels | `/channel/list` | Get channel metadata |

---

## Files & Documentation

### Core Files
| File | Purpose |
|------|---------|
| `scripts/generate-token.py` | ✅ Token generator (WORKING) |
| `web/.env.local` | Environment variables |
| `web/src/lib/hotstar-api.ts` | TypeScript API client |

### Documentation
| File | Purpose |
|------|---------|
| `HOTSTAR_API.md` | Complete API reference |
| `HOTSTAR_API_SUCCESS.md` | Success story & test results |
| `HOTSTAR_TOKEN_GENERATION.md` | Token generation deep dive |
| `README_HOTSTAR.md` | This file - Quick start |

---

## Token Management

### Token Lifecycle
```
Generate → Valid for 33 minutes → Expires → Regenerate
```

### Auto-Generate Before Expiry
```bash
# Cron job example (regenerate every 30 minutes)
*/30 * * * * cd /path/to/tldrcontent && python3 scripts/generate-token.py > /tmp/hotstar_token.txt
```

### Manual Regeneration
```bash
python3 scripts/generate-token.py
# Copy new token to .env.local
# Restart Next.js dev server if running
```

---

## TypeScript Integration

### Use Pre-built Functions

```typescript
import { fetchMovies, fetchShows, fetchEpisodes } from '@/lib/hotstar-api';

// Fetch movies
const movies = await fetchMovies({
  size: 20,
  premium: false,
  offset: 0
});

// Fetch TV shows
const shows = await fetchShows({
  size: 20
});

// Fetch episodes
const episodes = await fetchEpisodes({
  size: 20
});
```

### Response Format
```typescript
{
  body: {
    results: {
      items: [...],  // Array of content
      totalResults: 51495,
      offset: 0,
      size: 20,
      totalPages: 2575
    }
  },
  statusCode: "OK",
  statusCodeValue: 200
}
```

---

## Sample API Response

### Movie Object
```json
{
  "id": 3571573536,
  "contentId": "3571573536",
  "title": "HES Automation Movie 5",
  "description": "hesmovie",
  "genre": ["Drama"],
  "lang": ["Marathi", "Hindi"],
  "contentType": "MOVIE",
  "year": 2019,
  "thumbnail": "https://img.hotstar.com/...",
  "premium": false,
  "vip": false,
  "images": [
    {
      "url": "https://img.hotstar.com/...",
      "transformation": "hcdl",
      "type": "HORIZONTAL"
    },
    {
      "url": "https://img.hotstar.com/...",
      "transformation": "vl",
      "type": "VERTICAL"
    }
  ],
  "deepLinkUrl": "hotstar://3571573536",
  "parentalRatingName": "12+",
  "updateDate": 1714374312
}
```

---

## Common Use Cases

### 1. Fetch Latest Movies
```bash
python3 scripts/generate-token.py
# Copy token, then:

curl "https://pp-catalog-api.hotstar.com/movie/search?partner=92837456123&orderBy=contentId&order=desc&offset=0&size=20" \
  -H 'x-country-code: in' \
  -H 'x-platform-code: ANDROID' \
  -H 'x-partner-name: 92837456123' \
  -H "hdnea: <TOKEN>"
```

### 2. Filter by Language
```typescript
const hindiMovies = await fetchMovies({
  size: 20,
  // Note: Language filtering done in response
});

// Filter in code:
const hindi = hindiMovies.body.results.items.filter(
  movie => movie.lang.includes('Hindi')
);
```

### 3. Fetch Premium Content
```bash
curl "https://pp-catalog-api.hotstar.com/movie/search?partner=92837456123&premium=true&size=20" \
  -H 'x-country-code: in' \
  -H 'x-platform-code: ANDROID' \
  -H 'x-partner-name: 92837456123' \
  -H "hdnea: <TOKEN>"
```

### 4. Incremental Updates (Last 24 Hours)
```typescript
const now = Math.floor(Date.now() / 1000);
const yesterday = now - (24 * 60 * 60);

const updates = await fetchMovies({
  fromUpdateDate: yesterday,
  toUpdateDate: now,
  size: 1000
});
```

---

## Integration with TLDR Content

### Add Hotstar Row to Homepage

**1. Update `fetch-homepage-data.ts`:**
```typescript
import { fetchMovies as fetchHotstarMovies } from '@/lib/hotstar-api';

export async function fetchHomepageData() {
  const [
    // ... existing rows
    hotstarLatestMovies,
  ] = await Promise.all([
    // ... existing fetches
    fetchHotstarMovies({ size: 15, orderBy: 'contentId', order: 'desc' }),
  ]);

  return {
    // ... existing data
    hotstarLatestMovies: hotstarLatestMovies.body.results.items,
  };
}
```

**2. Update interface:**
```typescript
export interface HomepageData {
  // ... existing
  hotstarLatestMovies: HotstarContent[];
}
```

**3. Add row to `home-page-client.tsx`:**
```tsx
<ContentRow
  title="Latest on Hotstar"
  contents={data.hotstarLatestMovies}
  href="/browse?source=hotstar"
/>
```

---

## API Limits & Best Practices

### Rate Limiting
- **Limit:** 1 request per second
- **Exceeding:** 429 HTTP status code
- **Solution:** Add delays between requests

### Pagination
- **Max offset + size:** 10,000
- **For large datasets:** Use `fromStartDate`/`toStartDate` filters

### Token Expiry
- **Validity:** 2000 seconds (33 minutes)
- **Best practice:** Regenerate every 30 minutes
- **Auto-refresh:** Implement in production

### Caching
- Use Next.js ISR: `revalidate: 300` (5 minutes)
- Cache tokens server-side
- Don't expose secret key to client

---

## Troubleshooting

### Issue: 403 Forbidden
**Solution:** Generate fresh token
```bash
python3 scripts/generate-token.py
```

### Issue: 429 Rate Limit
**Solution:** Add delay between requests
```typescript
await new Promise(resolve => setTimeout(resolve, 1000));
```

### Issue: Token Expired
**Solution:** Tokens expire after 33 minutes - regenerate
```bash
python3 scripts/generate-token.py
```

### Issue: Empty Results
**Solution:** Check filters - try broadening search
```typescript
// Instead of specific filters:
const movies = await fetchMovies({ size: 20 });
```

---

## Next Steps

1. ✅ **Token Generation Working** - `python3 scripts/generate-token.py`
2. ✅ **API Access Confirmed** - 200 OK responses
3. ⏭️ **Integrate into Homepage** - Add Hotstar content rows
4. ⏭️ **Implement Auto-Refresh** - Token regeneration
5. ⏭️ **Add Browse Page** - Hotstar content filtering
6. ⏭️ **Cache Strategy** - ISR + React Query

---

## Quick Reference

**Generate Token:**
```bash
python3 scripts/generate-token.py
```

**Test API:**
```bash
curl "https://pp-catalog-api.hotstar.com/movie/search?partner=92837456123&size=5" \
  -H 'x-country-code: in' \
  -H 'x-platform-code: ANDROID' \
  -H 'x-partner-name: 92837456123' \
  -H 'x-region-code: DL' \
  -H 'x-client-code: pt' \
  -H "hdnea: <TOKEN>"
```

**TypeScript:**
```typescript
import { fetchMovies } from '@/lib/hotstar-api';
const movies = await fetchMovies({ size: 20 });
```

---

**API Status:** ✅ Operational
**Content Available:** 51,495+ movies
**Last Tested:** January 10, 2026
**Success Rate:** 100%

🚀 **Ready to integrate!**
