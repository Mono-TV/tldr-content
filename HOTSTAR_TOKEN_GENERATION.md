# Hotstar Token Generation - Complete Guide

## ❓ Your Question: Can you generate a key from a token?

**Answer: NO** ❌

The token generation process is **ONE-WAY** and cannot be reversed:

```
Secret Key → Token Generation → Token
   ↓                                ↑
(from Hotstar)              (for API calls)

You CANNOT reverse this: Token → Secret Key
```

This is by design for security reasons. If you could derive the secret key from a token, anyone intercepting your API requests could steal your secret.

---

## ✅ What You CAN Do: Generate Token from Secret Key

You have the **secret key**: `7073910d5c5f50d16d50bfdfb0ebb156dd37bea138f341a8432c92e569881617`

You can use this to generate tokens using these methods:

### Method 1: Node.js Script (Easiest for Your Project)

**Step 1: Install Package**
```bash
cd /Users/mono/Documents/Programs/Lumio/tldrcontent
npm install akamai-token
```

**Step 2: Run Generator Script**
```bash
node scripts/generate-hotstar-token.js
```

**Step 3: Copy Output**
The script will generate a token like:
```
st=1736054800~exp=1736056800~acl=/*~hmac=abc123def456
```

**Step 4: Add to `.env.local`**
```env
HOTSTAR_TOKEN=st=1736054800~exp=1736056800~acl=/*~hmac=abc123def456
```

### Method 2: Java (From Documentation)

```bash
java AkamaiToken \
  -k 7073910d5c5f50d16d50bfdfb0ebb156dd37bea138f341a8432c92e569881617 \
  -a /* \
  -s now \
  -w 2000
```

**Output:**
```
hdnts=st=1736054800~exp=1736056800~acl=/*~hmac=abc123def456
```

**Extract token** (everything after `hdnts=`):
```
st=1736054800~exp=1736056800~acl=/*~hmac=abc123def456
```

### Method 3: Python (From Documentation)

```bash
python akamai_token_v2.py \
  -k 7073910d5c5f50d16d50bfdfb0ebb156dd37bea138f341a8432c92e569881617 \
  -a /* \
  -s now \
  -w 2000
```

---

## 🔑 Understanding the Two Values You Have

### 1. Secret Key (for generating tokens)
```
7073910d5c5f50d16d50bfdfb0ebb156dd37bea138f341a8432c92e569881617
```
- **What it is:** Master secret provided by Hotstar
- **Used for:** Generating new tokens
- **Keep secret:** Never expose in API requests or client-side code
- **Stored in:** `.env.local` as `HOTSTAR_AKAMAI_SECRET`

### 2. Token (for API authentication)
```
5e68b9349faa915024840fa33a06b20f30130a227ea9913c4791a14e39a7b24b
```
- **What it is:** Generated authentication token (or could be another secret?)
- **Used for:** API request header `hdnea`
- **Expires:** After specified window (usually 2000 seconds)
- **Stored in:** `.env.local` as `HOTSTAR_TOKEN`

⚠️ **Note:** The second value you provided might be:
1. A pre-generated token (needs Akamai format verification)
2. Another secret key
3. A different authentication method

Standard Akamai tokens look like: `st=xxx~exp=xxx~acl=/*~hmac=xxx`

---

## 📋 Token Generation Parameters Explained

| Parameter | Value | Description |
|-----------|-------|-------------|
| `-k` or `key` | Your secret | The master secret key from Hotstar |
| `-a` or `acl` | `/*` | Access Control List - which paths the token can access |
| `-s` or `startTime` | `now` | When token becomes valid (current timestamp) |
| `-w` or `window` | `2000` | How long token is valid (2000 seconds = ~33 minutes) |

**Token Format Output:**
```
st=<start_timestamp>~exp=<expiry_timestamp>~acl=/*~hmac=<signature>
```

Example:
```
st=1736054800~exp=1736056800~acl=/*~hmac=a1b2c3d4e5f6
```

---

## 🔄 Token Lifecycle

1. **Generate Token**
   ```bash
   node scripts/generate-hotstar-token.js
   ```

2. **Token is Valid** (for 2000 seconds = 33 minutes)
   - API calls succeed with `hdnea: <token>`

3. **Token Expires** (after 2000 seconds)
   - API returns 403 Forbidden
   - Need to generate new token

4. **Regenerate Token**
   - Run generator script again
   - Update `.env.local` with new token

---

## 🚀 Quick Setup (Your Project)

**1. Install Akamai Token Package:**
```bash
cd /Users/mono/Documents/Programs/Lumio/tldrcontent
npm install akamai-token
```

**2. Generate Token:**
```bash
node scripts/generate-hotstar-token.js
```

**3. Test Token:**
```bash
# Copy the generated token, then test:
curl --location 'https://pp-catalog-api.hotstar.com/movie/search?partner=92837456123&orderBy=contentId&order=desc&offset=0&size=5' \
  --header 'x-country-code: in' \
  --header 'x-platform-code: ANDROID' \
  --header 'x-partner-name: 92837456123' \
  --header 'x-region-code: DL' \
  --header 'x-client-code: pt' \
  --header 'hdnea: <PASTE_GENERATED_TOKEN_HERE>'
```

**Expected Result:**
- ✅ 200 OK with JSON response (success!)
- ❌ 403 Forbidden (still blocked - likely IP whitelisting issue)

---

## ⚠️ Current Status

Based on testing, even with valid tokens, you're getting **403 Forbidden**. This suggests:

1. **IP Whitelisting Required** (most likely)
   - Your IP needs to be whitelisted by Hotstar
   - Contact Hotstar support with your IP address

2. **Partner Account Issue**
   - Verify Partner ID `92837456123` is active
   - Confirm pre-prod access is enabled

3. **Geographic Restrictions**
   - API might only work from India
   - Try VPN or Indian server

---

## 📚 Documentation Files Created

| File | Purpose |
|------|---------|
| `HOTSTAR_API.md` | Complete API reference with all endpoints |
| `HOTSTAR_API_STATUS.md` | Current integration status and troubleshooting |
| `HOTSTAR_TOKEN_GENERATION.md` | This file - Token generation guide |
| `scripts/generate-hotstar-token.js` | Node.js token generator script |
| `scripts/README.md` | Documentation for all scripts |
| `web/src/lib/hotstar-api.ts` | TypeScript API client utilities |
| `web/.env.local` | Environment variables (gitignored) |

---

## 🎯 Summary

**What you asked:** "Is there a method to generate key using token?"

**Answer:**
- ❌ **NO** - You cannot generate a secret key from a token (security feature)
- ✅ **YES** - You CAN generate tokens from your secret key using:
  - Node.js: `node scripts/generate-hotstar-token.js`
  - Java: `java AkamaiToken -k <secret> -a /* -s now -w 2000`
  - Python: `python akamai_token_v2.py -k <secret> -a /* -s now -w 2000`

**Your secret key:** `7073910d5c5f50d16d50bfdfb0ebb156dd37bea138f341a8432c92e569881617`

**Next steps:**
1. Install: `npm install akamai-token`
2. Generate: `node scripts/generate-hotstar-token.js`
3. Test with generated token
4. If still 403: Contact Hotstar for IP whitelisting

---

**Last Updated:** January 10, 2026
