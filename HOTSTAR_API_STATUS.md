# Hotstar API Integration Status

**Date**: January 10, 2025
**Status**: 🔴 403 Forbidden - Authentication/Authorization Issue

---

## Current Configuration

### Stored Credentials (in `.env.local`)
```
Partner ID: 92837456123
Partner Name: 92837456123
Akamai Secret: 7073910d5c5f50d16d50bfdfb0ebb156dd37bea138f341a8432c92e569881617
Token (Test 1): 5e68b9349faa915024840fa33a06b20f30130a227ea9913c4791a14e39a7b24b
```

### Endpoints Tested
- ✅ Pre-Production: `https://pp-catalog-api.hotstar.com`
- ✅ Production: `https://catalog-api.hotstar.com`

### API Endpoints Tested
- `/movie/search` - 403 Forbidden
- `/channel/list` - 403 Forbidden

---

## Issue: 403 Forbidden Error (Akamai Reference #199)

All API requests return **403 Forbidden** with Akamai error reference #199.

**Error Message:**
```
An error occurred while processing your request.
Reference #199.aa952317.1768054117.166a446a
https://errors.edgesuite.net/...
```

### Test Results

| Test | Token | Result | Notes |
|------|-------|--------|-------|
| Match endpoint | Token 1 (7073...) | 403 | First token tested |
| Match endpoint | Token 2 (5e68...) | 403 | Second token tested |
| Movie endpoint | Token 2 | 403 | Different endpoint, same error |
| Movie endpoint | No token | 403 | **Same error without token!** |

**Critical Finding:** API returns 403 even **without** the `hdnea` token header, suggesting the issue is not token-related but access-related.

### Root Cause Analysis

Based on testing, the most likely causes are:

1. **IP Whitelisting Required** ⚠️ (Most Likely)
   - Hotstar may require your IP address to be whitelisted
   - Contact Hotstar support to add your IP to allowlist

2. **Partner Account Not Active**
   - Partner ID `92837456123` might not be authorized for pre-prod
   - Verify account status with Hotstar

3. **Geographic Restrictions**
   - API might only be accessible from specific regions (e.g., India)
   - May need VPN or server in allowed region

4. **Additional Authentication Layer**
   - Beyond HMAC token, might need:
     - API key in different header
     - OAuth token
     - Certificate-based auth

---

## Action Items to Resolve

### 🚨 Priority 1: Contact Hotstar Support

**Contact Hotstar API/Partner Support to:**

1. **Whitelist Your IP Address**
   - Provide your current IP address
   - Request addition to API access allowlist
   - Confirm pre-prod environment access

2. **Verify Partner Account Status**
   ```
   Partner ID: 92837456123
   Partner Name: 92837456123
   Environment: Pre-Production (pp-catalog-api.hotstar.com)
   ```
   - Confirm account is active
   - Verify pre-prod access is enabled
   - Check if additional setup is required

3. **Clarify Authentication Requirements**
   - Is IP whitelisting mandatory?
   - Is the HMAC token format correct?
   - Are there additional headers/credentials needed?
   - Confirmation of working curl example

### Priority 2: Test from Different Location

If possible, test API from:
- Server located in India
- VPN connection to Indian IP
- Different network (to rule out local IP blocking)

### Priority 3: Verify Documentation

Request from Hotstar:
- Latest API documentation (version/date)
- Working curl example with sanitized credentials
- Postman collection if available
- Onboarding checklist for new partners

---

## Working cURL Template (Once Token is Valid)

```bash
curl --location 'https://pp-catalog-api.hotstar.com/movie/search?orderBy=contentId&order=desc&offset=0&size=5&partner=92837456123' \
--header 'x-country-code: in' \
--header 'x-platform-code: ANDROID' \
--header 'x-partner-name: 92837456123' \
--header 'x-region-code: DL' \
--header 'x-client-code: pt' \
--header 'hdnea: <VALID_AKAMAI_TOKEN_HERE>' \
-w "\nHTTP Status: %{http_code}\n"
```

---

## Expected Success Response

When authentication is successful, you should see:

```json
{
  "body": {
    "results": {
      "items": [...],
      "totalResults": 2270,
      "offset": 0,
      "size": 5
    }
  },
  "statusCode": "OK",
  "statusCodeValue": 200
}
```

---

## Files Created

1. ✅ `web/.env.local` - Environment variables (gitignored)
2. ✅ `HOTSTAR_API.md` - Complete API documentation
3. ✅ `HOTSTAR_API_STATUS.md` - This status file

---

## What Works So Far

✅ API endpoints are accessible
✅ Headers are correctly formatted
✅ Request structure is valid
✅ Credentials are stored securely
❌ Authentication token needs verification

---

## Action Items

- [ ] Verify if provided value is secret key or token
- [ ] Generate proper Akamai token if needed
- [ ] Test API with valid token
- [ ] Confirm partner credentials with Hotstar
- [ ] Set up token auto-refresh (tokens expire)

---

## Contact

If you need help:
1. Check Hotstar partner documentation
2. Contact Hotstar API support team
3. Verify account has proper API access

---

**Last Updated**: January 10, 2025
