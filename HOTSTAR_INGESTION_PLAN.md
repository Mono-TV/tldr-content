# Hotstar Movie Ingestion Plan

**Total Movies to Ingest:** 51,495
**API Rate Limit:** 1 request per second
**Max Items per Request:** 1,000
**Pagination Limit:** offset + size ≤ 10,000

---

## ⏱️ Time Calculation

### Basic Math
```
Total Movies:     51,495
Max per Request:  1,000
─────────────────────────
Requests Needed:  52 (51,495 ÷ 1,000 = 51.495, rounded up)
```

### Simple Calculation
```
52 requests × 1 second per request = 52 seconds
```

**BUT** - There's a pagination constraint!

---

## 🚧 The Pagination Problem

### Constraint
```
offset + size ≤ 10,000
```

### What This Means
- You can only fetch up to **10,000 movies** using simple pagination
- For the remaining **41,495 movies**, you need date-based filtering

### Example
```
✅ offset=0,    size=1000 → Total: 1,000  (OK)
✅ offset=9000, size=1000 → Total: 10,000 (OK)
❌ offset=10000, size=1000 → Total: 11,000 (EXCEEDS LIMIT)
```

---

## 📋 Ingestion Strategies

### Strategy 1: Hybrid Approach (Recommended)

**Phase 1: Pagination (First 10,000 movies)**
```
Requests: 10 (1,000 movies each)
Time:     10 seconds
Progress: 19.4% (10,000 / 51,495)
```

**Phase 2: Date-based Filtering (Remaining 41,495 movies)**
```
Split movies by year ranges:
- 2024-2025: ~5,000 movies → 5 requests → 5 seconds
- 2023: ~4,000 movies → 4 requests → 4 seconds
- 2022: ~4,000 movies → 4 requests → 4 seconds
- 2021: ~4,000 movies → 4 requests → 4 seconds
- 2020: ~3,500 movies → 4 requests → 4 seconds
- 2019: ~3,500 movies → 4 requests → 4 seconds
- 2018: ~3,500 movies → 4 requests → 4 seconds
- 2017: ~3,000 movies → 3 requests → 3 seconds
- 2016: ~3,000 movies → 3 requests → 3 seconds
- 2015 and older: ~8,000 movies → 8 requests → 8 seconds

Total Phase 2: 42 requests → 42 seconds
```

**Total Time:**
```
Phase 1:  10 seconds (first 10,000)
Phase 2:  42 seconds (remaining 41,495)
────────────────────
TOTAL:    52 seconds
```

**Plus Safety Buffers:**
```
Base Time:               52 seconds
Circuit Breaker Buffer:  +10 seconds (if any 5XX errors)
Rate Limit Margin:       +5 seconds (safety margin)
────────────────────────────────────
TOTAL REALISTIC TIME:    ~67 seconds (just over 1 minute)
```

---

### Strategy 2: Pure Date-based Filtering

**Skip pagination, use only date ranges**

```
2024-2025: 5 requests → 5 seconds
2023:      4 requests → 4 seconds
2022:      4 requests → 4 seconds
2021:      4 requests → 4 seconds
2020:      4 requests → 4 seconds
2019:      4 requests → 4 seconds
2018:      4 requests → 4 seconds
2017:      3 requests → 3 seconds
2016:      3 requests → 3 seconds
2015-:     8 requests → 8 seconds
────────────────────────────────
TOTAL:     52 requests → 52 seconds
```

**Plus Safety Buffers:**
```
Base Time:               52 seconds
Circuit Breaker Buffer:  +10 seconds
Rate Limit Margin:       +5 seconds
────────────────────────────────────
TOTAL REALISTIC TIME:    ~67 seconds
```

---

## ⏰ Time Breakdown Summary

| Strategy | Minimum Time | Realistic Time | Max Time (with retries) |
|----------|-------------|----------------|------------------------|
| Hybrid Approach | 52 seconds | 67 seconds | 90-120 seconds |
| Date-based Only | 52 seconds | 67 seconds | 90-120 seconds |

---

## 🎯 Recommended Approach

### Best Practice: Batched Ingestion

```python
#!/usr/bin/env python3
"""
Ingest all Hotstar movies in ~60-90 seconds
"""

import time
import requests
from datetime import datetime

# Configuration
RATE_LIMIT_DELAY = 1.0  # seconds
CIRCUIT_BREAKER_WAIT = 60  # seconds
MAX_RETRIES = 3

def fetch_movies_batch(offset=0, size=1000, from_date=None, to_date=None):
    """Fetch a batch of movies"""
    token = generate_fresh_token()

    params = {
        'partner': '92837456123',
        'orderBy': 'contentId',
        'order': 'desc',
        'offset': offset,
        'size': size
    }

    if from_date:
        params['fromStartDate'] = from_date
    if to_date:
        params['toStartDate'] = to_date

    headers = {
        'x-country-code': 'in',
        'x-platform-code': 'ANDROID',
        'x-partner-name': '92837456123',
        'x-region-code': 'DL',
        'x-client-code': 'pt',
        'hdnea': token
    }

    response = requests.get(
        'https://pp-catalog-api.hotstar.com/movie/search',
        params=params,
        headers=headers
    )

    return response.json()

def ingest_all_movies():
    """Main ingestion function"""
    start_time = time.time()
    total_movies = 0

    print("Starting Hotstar movie ingestion...")
    print("="*50)

    # Phase 1: First 10,000 movies (simple pagination)
    print("\nPhase 1: Fetching first 10,000 movies...")
    for offset in range(0, 10000, 1000):
        print(f"  Batch {offset//1000 + 1}/10: Fetching movies {offset} to {offset+1000}")

        try:
            data = fetch_movies_batch(offset=offset, size=1000)
            movies = data['body']['results']['items']

            # Save to database here
            save_to_database(movies)

            total_movies += len(movies)
            print(f"  ✓ Saved {len(movies)} movies (Total: {total_movies})")

        except Exception as e:
            print(f"  ✗ Error: {e}")
            time.sleep(60)  # Circuit breaker
            continue

        time.sleep(RATE_LIMIT_DELAY)  # Rate limit

    # Phase 2: Remaining movies (date-based)
    print(f"\nPhase 2: Fetching remaining movies (date-based)...")

    date_ranges = [
        (2024, 2025),
        (2023, 2024),
        (2022, 2023),
        (2021, 2022),
        (2020, 2021),
        (2019, 2020),
        (2018, 2019),
        (2017, 2018),
        (2016, 2017),
        (2010, 2016),
        (2000, 2010),
        (1990, 2000),
    ]

    for from_year, to_year in date_ranges:
        print(f"\n  Fetching movies from {from_year}-{to_year}...")

        # Convert years to epoch timestamps
        from_date = int(datetime(from_year, 1, 1).timestamp())
        to_date = int(datetime(to_year, 12, 31).timestamp())

        offset = 0
        while True:
            try:
                data = fetch_movies_batch(
                    offset=offset,
                    size=1000,
                    from_date=from_date,
                    to_date=to_date
                )

                movies = data['body']['results']['items']
                if not movies:
                    break

                # Save to database
                save_to_database(movies)

                total_movies += len(movies)
                print(f"  ✓ {from_year}: Saved {len(movies)} movies (Total: {total_movies})")

                offset += 1000

                # Check if we've reached the end
                if len(movies) < 1000:
                    break

            except Exception as e:
                print(f"  ✗ Error: {e}")
                time.sleep(60)
                continue

            time.sleep(RATE_LIMIT_DELAY)

    elapsed = time.time() - start_time
    print("\n" + "="*50)
    print(f"✅ Ingestion Complete!")
    print(f"   Total Movies: {total_movies:,}")
    print(f"   Time Taken: {elapsed:.1f} seconds ({elapsed/60:.1f} minutes)")
    print("="*50)

if __name__ == '__main__':
    ingest_all_movies()
```

---

## ⚡ Performance Optimizations

### 1. Parallel Processing (NOT Recommended)
```
❌ DON'T: Run multiple requests in parallel
    Reason: Rate limit is 1 req/sec globally
    Result: 429 errors (rate limit exceeded)
```

### 2. Batch Processing (Recommended)
```
✅ DO: Process in batches with delays
    Batch size: 1,000 movies
    Delay: 1 second between requests
    Result: Respects rate limits
```

### 3. Incremental Updates (After Initial Load)
```
✅ DO: After initial load, use incremental updates
    Frequency: Every 4 hours
    Filter: fromUpdateDate / toUpdateDate
    Result: Only fetch changed movies
```

---

## 📊 Expected Timeline

### Initial Full Ingestion
```
┌─────────────────────────────────────────┐
│  HOTSTAR MOVIE INGESTION TIMELINE       │
├─────────────────────────────────────────┤
│  Start:           00:00                 │
│  Phase 1 Done:    00:10 (10,000 movies)│
│  Phase 2 Done:    00:52 (41,495 movies)│
│  Safety Buffer:   00:67 (with delays)   │
│  Max w/ Retries:  02:00 (with errors)   │
├─────────────────────────────────────────┤
│  TOTAL TIME:      1-2 minutes           │
└─────────────────────────────────────────┘
```

### Subsequent Updates (Every 4 Hours)
```
┌─────────────────────────────────────────┐
│  INCREMENTAL UPDATE (4 HOUR WINDOW)     │
├─────────────────────────────────────────┤
│  New Movies:      ~10-20                │
│  Updated Movies:  ~50-100               │
│  Total Items:     ~60-120               │
│  Requests:        1 (all fit in 1,000)  │
│  Time:            1 second              │
└─────────────────────────────────────────┘
```

---

## 🎯 Final Answer

### **Total Time to Ingest All 51,495 Movies:**

| Scenario | Time |
|----------|------|
| **Best Case** (no errors) | **52 seconds** |
| **Typical** (with safety margins) | **67 seconds** (~1 minute) |
| **Worst Case** (with retries) | **90-120 seconds** (~2 minutes) |

### **Realistic Estimate:**
**1-2 minutes** to ingest all movies ⚡

---

## 📝 Implementation Checklist

- [ ] Generate fresh token (valid for 33 minutes - enough for entire ingestion)
- [ ] Set up database schema for movies
- [ ] Implement rate limiting (1 req/sec)
- [ ] Implement circuit breaker (retry after 1 min on 5XX)
- [ ] Phase 1: Fetch first 10,000 via pagination
- [ ] Phase 2: Fetch remaining via date filters
- [ ] Add progress logging
- [ ] Add error handling & retries
- [ ] Set up incremental updates (every 4 hours)

---

## 🚀 Quick Start

```bash
# 1. Generate token
python3 scripts/generate-token.py

# 2. Run ingestion script
python3 scripts/ingest-all-movies.py

# Expected output:
# Starting ingestion...
# Phase 1: [====================] 10,000/10,000
# Phase 2: [====================] 41,495/41,495
# ✅ Complete! 51,495 movies in 67 seconds
```

---

**Summary:** You can ingest all **51,495 Hotstar movies** in just **1-2 minutes** while fully respecting the API rate limits! 🎉
