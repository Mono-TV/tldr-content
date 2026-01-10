# Hotstar (JioHotstar) API Integration Guide

## 🔒 Security Notice
All credentials are stored in `web/.env.local` which is gitignored. Never commit API keys, secrets, or tokens to version control.

---

## API Configuration

### Base URLs
- **Pre-Production**: `https://pp-catalog-api.hotstar.com`
- **Production**: `https://catalog-api.hotstar.com`
- **Dev/QA**: `https://qa-catalog-api.hotstar.com`

### Partner Credentials
- **Partner ID**: `92837456123`
- **Partner Name**: `92837456123`

### Authentication
Hotstar API uses **Akamai HMAC token authentication**. Tokens must be generated before each request.

---

## Token Generation

**⚠️ Important:** You CANNOT generate a secret key from a token. The flow is ONE-WAY:
```
Secret Key (from Hotstar) → Token Generator → Token (for API requests)
```

### Prerequisites
1. **Secret Key** (provided by Hotstar Content Platform team)
2. **Akamai Token Generator Library**
   - Java: https://github.com/akamai/AkamaiOPEN-edgegrid-java
   - Python: https://github.com/akamai/AkamaiOPEN-edgegrid-python
   - Node.js: https://github.com/akamai/AkamaiOPEN-edgegrid-node

### Method 1: Node.js (Recommended for Next.js projects)

**Install Package:**
```bash
npm install akamai-token
```

**Generate Token:**
```bash
node scripts/generate-hotstar-token.js
```

Or use the script programmatically:
```javascript
const AkamaiToken = require('akamai-token');

const config = {
  key: process.env.HOTSTAR_AKAMAI_SECRET,
  acl: '/*',
  startTime: 'now',
  window: 2000, // 33 minutes
};

const at = new AkamaiToken(config);
const token = at.generateToken();
console.log('Token:', token);
```

### Method 2: Java

```bash
java AkamaiToken -k <secret> -a /* -s now -w 2000
```

### Method 3: Python

```bash
python akamai_token_v2.py -k <secret> -a /* -s now -w 2000
```

### Token Parameters

- `-k <secret>`: Your Hotstar-provided secret key
- `-a /*`: ACL (Access Control List) - all paths
- `-s now`: Start time - current timestamp
- `-w 2000`: Window - token valid for 2000 seconds (~33 minutes)

### Extract Token (Java/Python methods)

The output will be like: `hdnts=st=1567324pp~exp=1567524057~acl=/*~hmac=e3ed3d`

Extract the part AFTER `hdnts=`: `st=1567324pp~exp=1567524057~acl=/*~hmac=e3ed3d`

### Token Expiry

Tokens expire after the specified window (default: 2000 seconds). You'll need to:
1. Regenerate tokens before they expire
2. Implement auto-refresh in production
3. Use longer windows for development (max depends on Hotstar policy)

---

## Working cURL Commands

### 1. Fetch Movies (Pre-Prod)
```bash
curl --location 'https://pp-catalog-api.hotstar.com/movie/search?orderBy=contentId&order=desc&offset=0&size=20&premium=false&partner=92837456123' \
--header 'x-country-code: in' \
--header 'x-platform-code: ANDROID' \
--header 'x-partner-name: 92837456123' \
--header 'x-region-code: DL' \
--header 'x-client-code: pt' \
--header 'hdnea: YOUR_GENERATED_TOKEN'
```

### 2. Fetch TV Shows
```bash
curl --location 'https://pp-catalog-api.hotstar.com/show/search?orderBy=contentId&order=desc&offset=0&size=20&premium=false&partner=92837456123' \
--header 'x-country-code: in' \
--header 'x-platform-code: ANDROID' \
--header 'x-partner-name: 92837456123' \
--header 'x-region-code: DL' \
--header 'x-client-code: pt' \
--header 'hdnea: YOUR_GENERATED_TOKEN'
```

### 3. Fetch Episodes
```bash
curl --location 'https://pp-catalog-api.hotstar.com/episode/search?orderBy=contentId&order=desc&offset=0&size=20&premium=false&partner=92837456123' \
--header 'x-country-code: in' \
--header 'x-platform-code: ANDROID' \
--header 'x-partner-name: 92837456123' \
--header 'x-region-code: DL' \
--header 'x-client-code: pt' \
--header 'hdnea: YOUR_GENERATED_TOKEN'
```

### 4. Fetch Sports/Matches
```bash
curl --location 'https://pp-catalog-api.hotstar.com/match/search?orderBy=startDate&order=desc&offset=0&size=10&live=false&partner=92837456123' \
--header 'x-country-code: in' \
--header 'x-platform-code: ANDROID' \
--header 'x-partner-name: 92837456123' \
--header 'x-region-code: DL' \
--header 'x-client-code: pt' \
--header 'hdnea: YOUR_GENERATED_TOKEN'
```

### 5. Fetch Seasons (by Show ID)
```bash
curl --location 'https://pp-catalog-api.hotstar.com/season/search?showId=30&offset=0&size=100&order=desc&partner=92837456123' \
--header 'x-country-code: in' \
--header 'x-platform-code: ANDROID' \
--header 'x-partner-name: 92837456123' \
--header 'x-region-code: DL' \
--header 'x-client-code: pt' \
--header 'hdnea: YOUR_GENERATED_TOKEN'
```

### 6. Fetch Channel List
```bash
curl --location 'https://pp-catalog-api.hotstar.com/channel/list?offset=0&size=1000&orderBy=esUpdateDate&order=desc&partner=92837456123' \
--header 'x-country-code: in' \
--header 'x-platform-code: ANDROID' \
--header 'x-partner-name: 92837456123' \
--header 'x-region-code: DL' \
--header 'x-client-code: pt' \
--header 'hdnea: YOUR_GENERATED_TOKEN'
```

---

## API Endpoints Reference

| Endpoint | Method | Path | Description |
|----------|--------|------|-------------|
| Movies | GET | `/movie/search` | Fetch movies with filters |
| Shows | GET | `/show/search` | Fetch TV shows |
| Seasons | GET | `/season/search` | Fetch seasons by showId |
| Episodes | GET | `/episode/search` | Fetch episodes |
| Sports | GET | `/match/search` | Fetch sports VoD & live matches |
| Channels | GET | `/channel/list` | Get channel metadata |

---

## Query Parameters

### Common Parameters
| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `orderBy` | string | Sort field: `contentId`, `startDate` | Yes |
| `order` | string | Sort order: `asc`, `desc` | Yes |
| `offset` | integer | Pagination offset (max: 10,000) | Yes |
| `size` | integer | Results per page (max: 1000) | Yes |
| `partner` | string | Partner ID | Yes |
| `premium` | boolean | Filter premium content | No |

### Time-based Filters
| Parameter | Type | Description |
|-----------|------|-------------|
| `fromStartDate` | epoch (seconds) | Filter content from this date |
| `toStartDate` | epoch (seconds) | Filter content until this date |
| `fromUpdateDate` | epoch (seconds) | Fetch incrementally updated content |
| `toUpdateDate` | epoch (seconds) | Updated content filter end date |

---

## Request Headers (Required)

```
x-country-code: in
x-platform-code: ANDROID
x-partner-name: 92837456123
x-region-code: DL
x-client-code: pt
hdnea: <generated_token>
```

---

## API Limitations

1. **Rate Limit**: 1 request per second
   - Exceeding = 429 HTTP status code

2. **Pagination**: Max offset + size = 10,000
   - Use `fromStartDate`/`toStartDate` for large datasets

3. **Max Results**: 1000 items per request

4. **Incremental Updates**:
   - Use `fromUpdateDate`/`toUpdateDate` filters
   - Recommended polling: Every 4 hours
   - For live sports: More frequent polling

5. **Circuit Breaker**:
   - On 5XX errors or response time >5s
   - Retry after 1 minute

---

## Response Format

### Success Response (200 OK)
```json
{
  "body": {
    "results": {
      "items": [...],
      "totalResults": 2270,
      "offset": 0,
      "size": 20,
      "nextOffsetURL": "...",
      "totalPageResults": 20,
      "totalPages": 114
    }
  },
  "statusCode": "OK",
  "statusCodeValue": 200
}
```

### Key Response Fields

**Content Item:**
```json
{
  "id": 35331,
  "contentId": "1260128510",
  "title": "Movie Title",
  "description": "...",
  "contentType": "MOVIE|SHOW|EPISODE|MATCH",
  "genre": ["Action", "Drama"],
  "lang": ["English", "Hindi"],
  "premium": true,
  "vip": true,
  "startDate": 1682296200,
  "endDate": 4102424940,
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
  "thumbnail": "https://img.hotstar.com/...",
  "deepLinkUrl": "hotstar://1260128510",
  "locators": [...],
  "actors": ["Actor 1", "Actor 2"],
  "directors": ["Director Name"],
  "langObjs": [...],
  "parentalRating": 2,
  "parentalRatingName": "U/A 13+",
  "updateDate": 1676006130
}
```

---

## Environment Variables (.env.local)

```env
# Hotstar API Configuration
HOTSTAR_PARTNER_ID=92837456123
HOTSTAR_PARTNER_NAME=92837456123
HOTSTAR_API_BASE_URL=https://pp-catalog-api.hotstar.com
HOTSTAR_API_BASE_URL_PROD=https://catalog-api.hotstar.com
HOTSTAR_AKAMAI_SECRET=YOUR_SECRET_KEY_HERE
HOTSTAR_TOKEN=YOUR_GENERATED_TOKEN_HERE

# Request Headers
HOTSTAR_COUNTRY_CODE=in
HOTSTAR_PLATFORM_CODE=ANDROID
HOTSTAR_REGION_CODE=DL
HOTSTAR_CLIENT_CODE=pt
```

---

## Testing API Access

### Quick Test
```bash
# Replace YOUR_GENERATED_TOKEN with actual token
curl --location 'https://pp-catalog-api.hotstar.com/movie/search?orderBy=contentId&order=desc&offset=0&size=1&partner=92837456123' \
--header 'x-country-code: in' \
--header 'x-platform-code: ANDROID' \
--header 'x-partner-name: 92837456123' \
--header 'x-region-code: DL' \
--header 'x-client-code: pt' \
--header 'hdnea: YOUR_GENERATED_TOKEN' \
-w "\nHTTP Status: %{http_code}\n"
```

### Expected Response
- **200 OK**: Success
- **403 Forbidden**: Invalid/expired token or incorrect partner credentials
- **429 Too Many Requests**: Rate limit exceeded
- **5XX**: Server error (implement circuit breaker)

---

## Integration Checklist

- [ ] Obtain Akamai secret key from Hotstar
- [ ] Set up Akamai token generation (Java/Python/Node.js)
- [ ] Add credentials to `.env.local`
- [ ] Test API with working token
- [ ] Implement token auto-generation/refresh
- [ ] Add rate limiting (1 req/sec)
- [ ] Implement incremental update polling
- [ ] Add error handling & circuit breaker
- [ ] Test all endpoints (movies, shows, episodes, sports)

---

## Next Steps

1. **Get Akamai Secret**: Contact Hotstar partner team
2. **Generate Token**: Use Akamai library with secret
3. **Test API**: Run cURL commands with valid token
4. **Build Integration**: Create API client utility
5. **Implement Polling**: Set up incremental updates every 4 hours

---

**Last Updated**: January 10, 2025
**API Version**: JioHotstar Catalog API v1
**Documentation**: See `Jiohotstar Catalog API Doc.pdf`
