# IMDb Matching Strategies for Hotstar Movies

**Goal**: Achieve 100% confidence IMDb ID matching for all 33,955 Hotstar movies.

---

## Available Metadata for Matching

### From Hotstar (Cloud SQL)
| Field | Type | Reliability | Notes |
|-------|------|-------------|-------|
| `title` | VARCHAR | High | May include transliterations |
| `year` | INTEGER | High | Release year |
| `duration` | INTEGER | Medium | Runtime in seconds |
| `actors` | JSONB | Medium | Array of actor names |
| `directors` | JSONB | Medium | Array of director names |
| `lang` | JSONB | High | Language codes |
| `description` | TEXT | Medium | Plot summary |
| `content_id` | VARCHAR | High | Hotstar's unique ID |

### From IMDb (for verification)
| Field | Type | Notes |
|-------|------|-------|
| `imdb_id` | VARCHAR | tt0000000 format |
| `title` | VARCHAR | Primary title |
| `original_title` | VARCHAR | Native language title |
| `year` | INTEGER | Release year |
| `runtime` | INTEGER | Duration in minutes |
| `cast` | ARRAY | Structured cast data |
| `directors` | ARRAY | Director names |

---

## Matching Strategies (Ordered by Confidence)

### Strategy 1: TMDB External IDs API (100% Confidence)
**Best approach for guaranteed accuracy**

TMDB provides a direct mapping from their movie IDs to IMDb IDs via their API.

```
GET https://api.themoviedb.org/3/movie/{tmdb_id}/external_ids
Response: { "imdb_id": "tt1234567", ... }
```

**Workflow**:
1. Search TMDB by title + year + language
2. Verify match using cast/director overlap
3. Retrieve `external_ids` to get IMDb ID directly

**Pros**: Direct, authoritative mapping
**Cons**: Requires TMDB API calls, rate limits

---

### Strategy 2: IMDb Advanced Title Search (95%+ Confidence)
**Direct IMDb search with multiple validation points**

IMDb provides search endpoints that can be queried:

```
https://www.imdb.com/search/title/?title={title}&release_date={year},{year}&title_type=feature
```

**Matching Criteria**:
| Factor | Weight | Validation |
|--------|--------|------------|
| Exact title match | 40% | Case-insensitive, normalized |
| Year match | 25% | ±1 year tolerance |
| Director match | 20% | At least 1 overlap |
| Cast overlap | 15% | At least 2 actors |

**Confidence Thresholds**:
- **100%**: Exact title + exact year + director match + 3+ cast match
- **95%+**: Exact title + exact year + director match
- **90%+**: Exact title + year ±1 + 2+ cast match
- **<90%**: Requires manual review

---

### Strategy 3: OMDb API (100% Confidence when found)
**Free API with direct IMDb ID lookup**

```
GET http://www.omdbapi.com/?t={title}&y={year}&apikey=xxxxx
Response: { "imdbID": "tt1234567", ... }
```

**Pros**: Direct IMDb IDs, includes runtime for verification
**Cons**: 1000 requests/day limit (free tier), may not have all Indian content

---

### Strategy 4: Wikidata SPARQL Query (100% Confidence)
**Linked data approach using Wikidata's movie database**

```sparql
SELECT ?imdb WHERE {
  ?movie wdt:P31 wd:Q11424 .        # instance of film
  ?movie wdt:P1476 ?title .          # title
  ?movie wdt:P577 ?date .            # publication date
  ?movie wdt:P345 ?imdb .            # IMDb ID
  FILTER(YEAR(?date) = 2020)
  FILTER(CONTAINS(LCASE(?title), "movie name"))
}
```

**Pros**: Reliable, covers international films well
**Cons**: Coverage varies, query complexity

---

### Strategy 5: Fuzzy Multi-Signal Matching (90-99% Confidence)
**Algorithmic matching when direct APIs fail**

```python
def calculate_match_score(hotstar_movie, imdb_candidate):
    score = 0
    
    # Title similarity (Levenshtein/Jaro-Winkler)
    title_sim = jaro_winkler(normalize(hotstar.title), normalize(imdb.title))
    score += title_sim * 40
    
    # Year match
    if hotstar.year == imdb.year:
        score += 25
    elif abs(hotstar.year - imdb.year) == 1:
        score += 15
    
    # Director overlap
    director_overlap = len(set(hotstar.directors) & set(imdb.directors))
    score += min(director_overlap * 10, 20)
    
    # Cast overlap
    cast_overlap = len(set(hotstar.actors) & set(imdb.cast))
    score += min(cast_overlap * 5, 15)
    
    # Runtime match (±5 min tolerance)
    if abs(hotstar.duration/60 - imdb.runtime) <= 5:
        score += 10
    
    return score  # Max 100
```

**Confidence Mapping**:
- Score ≥ 95: 100% confidence
- Score 85-94: 95% confidence  
- Score 75-84: 90% confidence
- Score < 75: Manual review required

---

## Implementation Plan for 100% Confidence

### Phase 1: Direct API Matching (~70% of movies)

**Step 1.1**: TMDB Bulk Search
```python
for movie in hotstar_movies:
    # Search TMDB
    results = tmdb.search.movies(query=movie.title, year=movie.year, language=movie.lang)
    
    if results and verify_match(movie, results[0]):
        imdb_id = tmdb.get_external_ids(results[0].id)['imdb_id']
        save_match(movie.content_id, imdb_id, confidence=100, source='tmdb')
```

**Step 1.2**: OMDb Fallback
```python
for unmatched in get_unmatched_movies():
    response = omdb.search(title=movie.title, year=movie.year)
    if response.get('imdbID'):
        save_match(movie.content_id, response['imdbID'], confidence=100, source='omdb')
```

### Phase 2: Enhanced Matching (~20% of movies)

**Step 2.1**: Title Normalization
```python
def normalize_title(title):
    # Remove special characters
    title = re.sub(r'[^\w\s]', '', title)
    # Transliterate if needed (Hindi/Telugu/Tamil to Latin)
    title = transliterate(title)
    # Remove common suffixes
    title = re.sub(r'\s+(movie|film|hindi|dubbed)$', '', title, flags=re.I)
    return title.lower().strip()
```

**Step 2.2**: Multi-Language Search
```python
# Search with original title AND transliterated title
for movie in unmatched:
    titles_to_try = [
        movie.title,
        transliterate_to_latin(movie.title),
        get_english_title(movie.title)  # If available in metadata
    ]
    
    for title in titles_to_try:
        results = search_all_sources(title, movie.year)
        if best_match := find_best_match(results, movie):
            save_match(movie.content_id, best_match.imdb_id)
            break
```

### Phase 3: Cast/Director Weighted Matching (~8% of movies)

**Step 3.1**: Primary Person Matching
```python
def match_by_cast(movie):
    # Get top-billed actors
    lead_actors = movie.actors[:3]
    
    for actor in lead_actors:
        # Search IMDb by actor + year
        actor_films = imdb.get_filmography(actor, year=movie.year)
        
        for film in actor_films:
            if title_similarity(movie.title, film.title) > 0.8:
                if verify_other_cast(movie, film):
                    return film.imdb_id
    
    return None
```

**Step 3.2**: Director-First Approach (for auteur films)
```python
def match_by_director(movie):
    if not movie.directors:
        return None
    
    director = movie.directors[0]
    director_films = imdb.get_filmography(director, role='director', year=movie.year)
    
    # Find matching title
    for film in director_films:
        if title_similarity(movie.title, film.title) > 0.85:
            return film.imdb_id
```

### Phase 4: Manual Review Queue (~2% of movies)

**Step 4.1**: Generate Review Interface
```python
def create_review_queue():
    unmatched = get_unmatched_movies()
    
    for movie in unmatched:
        candidates = get_all_candidates(movie)
        
        yield {
            'hotstar': movie,
            'candidates': candidates[:5],
            'auto_suggestion': candidates[0] if candidates else None,
            'review_reason': classify_difficulty(movie)
        }
```

**Review Reasons**:
- `title_mismatch`: Title doesn't match any candidates
- `multiple_matches`: Several equally valid candidates
- `no_candidates`: No results found anywhere
- `year_conflict`: Year differs significantly
- `regional_content`: Rare regional language film

---

## Handling Edge Cases

### 1. Transliterated Titles
Many Hotstar titles are in English transliteration of Indian languages:
- "Pushpa: The Rise" vs "పుష్ప: ది రైజ్"
- "Baahubali" vs "बाहुबली"

**Solution**: Use Unicode transliteration libraries:
```python
from indic_transliteration import sanscript

latin_title = sanscript.transliterate(
    original_title, 
    sanscript.DEVANAGARI, 
    sanscript.ITRANS
)
```

### 2. Dubbed Versions
Same movie exists in multiple languages on Hotstar:
- "RRR" (Telugu original)
- "RRR" (Hindi dubbed)
- "RRR" (Tamil dubbed)

**Solution**: All should map to the same IMDb ID (original film):
```sql
-- Group by original title, map all to same IMDb
UPDATE hotstar_movies h
SET imdb_id = (
    SELECT imdb_id FROM hotstar_movies 
    WHERE title = h.title AND imdb_id IS NOT NULL 
    LIMIT 1
)
WHERE imdb_id IS NULL 
  AND title IN (SELECT title FROM hotstar_movies WHERE imdb_id IS NOT NULL);
```

### 3. Different Titles Across Regions
- "Zindagi Na Milegi Dobara" (India) vs "You Only Live Once" (International)

**Solution**: Use TMDB's `alternative_titles` API:
```python
alt_titles = tmdb.movies.alternative_titles(tmdb_id)
all_titles = [t['title'] for t in alt_titles['titles']]
```

### 4. Remakes with Same Name
- "Drishyam" (2013, Malayalam)
- "Drishyam" (2015, Hindi)
- "Drishyam 2" (2021, Malayalam)

**Solution**: Year + Language as mandatory discriminator:
```python
def match_remake(movie):
    candidates = search_by_title(movie.title)
    
    # Filter by year first
    year_matches = [c for c in candidates if c.year == movie.year]
    
    # Then by language
    if len(year_matches) > 1:
        lang_matches = [c for c in year_matches 
                       if c.language == movie.lang[0]]
        return lang_matches[0] if lang_matches else year_matches[0]
```

### 5. TV Movie vs Theatrical
Some content might be TV movies on IMDb but regular movies on Hotstar.

**Solution**: Accept both `title_type=feature` and `title_type=tv_movie` in searches.

---

## Database Schema for Matching

```sql
-- Add matching columns to hotstar_movies
ALTER TABLE hotstar_movies ADD COLUMN IF NOT EXISTS imdb_id VARCHAR(20);
ALTER TABLE hotstar_movies ADD COLUMN IF NOT EXISTS match_confidence INTEGER;
ALTER TABLE hotstar_movies ADD COLUMN IF NOT EXISTS match_source VARCHAR(50);
ALTER TABLE hotstar_movies ADD COLUMN IF NOT EXISTS match_date TIMESTAMP;
ALTER TABLE hotstar_movies ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE;
ALTER TABLE hotstar_movies ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_hotstar_imdb ON hotstar_movies(imdb_id);
CREATE INDEX IF NOT EXISTS idx_hotstar_needs_review ON hotstar_movies(needs_review);

-- Matching audit log
CREATE TABLE IF NOT EXISTS imdb_match_log (
    id SERIAL PRIMARY KEY,
    hotstar_content_id VARCHAR(50),
    imdb_id VARCHAR(20),
    confidence INTEGER,
    source VARCHAR(50),
    match_method VARCHAR(100),
    match_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Rate Limits & Considerations

| API | Rate Limit | Notes |
|-----|------------|-------|
| TMDB | 40 req/10 sec | Free, comprehensive |
| OMDb | 1,000/day (free) | Direct IMDb IDs |
| Wikidata | No hard limit | SPARQL queries |
| IMDb | Unofficial | Use with caution |

**Estimated Time for Full Matching**:
- ~34,000 movies
- TMDB: ~15 hours (at 40 req/10 sec)
- OMDb: 34 days (at 1000/day) - supplementary only
- Parallel processing recommended

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Match Rate | 100% | Movies with valid IMDb ID |
| Confidence ≥ 95% | 98% | High-confidence matches |
| Manual Review | < 2% | Movies requiring human verification |
| False Positives | 0% | Incorrect matches (verified sample) |

---

## Recommended Implementation Order

1. **Week 1**: Set up TMDB API integration, match ~70% of movies
2. **Week 2**: OMDb fallback + title normalization, match ~15% more
3. **Week 3**: Cast/director matching for remaining ~13%
4. **Week 4**: Manual review queue for final ~2%
5. **Ongoing**: Verification sampling + new content matching

---

## Verification Process

For 100% confidence, every match should be verified:

```python
def verify_match(hotstar_movie, imdb_id):
    imdb_data = fetch_imdb_details(imdb_id)
    
    checks = {
        'title': title_similarity(hotstar_movie.title, imdb_data.title) > 0.8,
        'year': abs(hotstar_movie.year - imdb_data.year) <= 1,
        'runtime': abs(hotstar_movie.duration/60 - imdb_data.runtime) <= 10,
        'cast': len(set(hotstar_movie.actors) & set(imdb_data.cast)) >= 1,
    }
    
    passed = sum(checks.values())
    
    if passed >= 3:
        return True, 100
    elif passed >= 2:
        return True, 95
    else:
        return False, 0
```

---

## Next Steps

1. [ ] Obtain TMDB API key
2. [ ] Create matching script with all strategies
3. [ ] Run Phase 1 matching
4. [ ] Build review UI for edge cases
5. [ ] Validate sample of matches
6. [ ] Document final match rates
