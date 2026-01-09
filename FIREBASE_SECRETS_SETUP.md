# Firebase Authentication - GitHub Secrets Setup

## Issue Found

Firebase authentication was showing "Authentication is not configured" because the environment variables need to be available at **build time**, not just runtime.

## Solution

Updated the deployment to pass Firebase credentials as Docker build arguments, so they're embedded in the Next.js client bundle during build.

---

## Required GitHub Secrets

You need to add these **3 new secrets** to your GitHub repository:

### Go to GitHub Repository Settings

1. Navigate to: https://github.com/Mono-TV/tldr-content/settings/secrets/actions
2. Click **"New repository secret"** for each of the following:

### Secret 1: FIREBASE_API_KEY
- **Name:** `FIREBASE_API_KEY`
- **Value:** Your Firebase API key (from Firebase Console)
  - Example: `AIzaSyC...` (starts with AIza)

### Secret 2: FIREBASE_PROJECT_ID
- **Name:** `FIREBASE_PROJECT_ID`
- **Value:** Your Firebase project ID
  - Example: `tldr-music` or `your-project-id`

### Secret 3: FIREBASE_AUTH_DOMAIN
- **Name:** `FIREBASE_AUTH_DOMAIN`
- **Value:** Your Firebase auth domain
  - Example: `tldr-music.firebaseapp.com`

---

## Where to Find These Values

### Option 1: Firebase Console (Recommended)

1. Go to https://console.firebase.google.com/
2. Select your project
3. Click the gear icon ⚙️ → **Project settings**
4. Scroll down to **"Your apps"** section
5. Find your web app or click **"Add app"** → Web
6. You'll see the Firebase config object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",              // ← FIREBASE_API_KEY
  authDomain: "project.firebaseapp.com",  // ← FIREBASE_AUTH_DOMAIN
  projectId: "your-project-id",   // ← FIREBASE_PROJECT_ID
  // ... other fields
};
```

### Option 2: From Your Code

Check your local `.env.local` file (if you have one):
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
```

---

## After Adding Secrets

### Your GitHub Secrets should include:

**Existing:**
- ✅ `GCP_PROJECT_ID`
- ✅ `GCP_SA_KEY`
- ✅ `API_URL`

**New (Firebase):**
- ⬜ `FIREBASE_API_KEY`
- ⬜ `FIREBASE_PROJECT_ID`
- ⬜ `FIREBASE_AUTH_DOMAIN`

---

## Testing

Once you add the secrets:

1. The next deployment will automatically include Firebase credentials
2. Visit https://content.lumiolabs.in
3. Click **Sign In** (user icon in navbar)
4. Click **"Continue with Google"**
5. Should open Google Sign-In popup (no "Authentication is not configured" error)

---

## Why This Fix Works

**Before:** Firebase env vars were set at runtime via Secret Manager, but Next.js needs them at build time to embed in the client bundle.

**After:** Firebase credentials are passed as Docker build arguments, making them available during the Next.js build process, so they're properly embedded in the client-side JavaScript.

---

## Security Note

These Firebase credentials (API key, project ID, auth domain) are **safe to expose publicly** because:
- They're client-side credentials (embedded in your JavaScript bundle anyway)
- Firebase security is enforced by **Security Rules** on the server-side
- The API key identifies your project but doesn't grant access without proper auth

Your actual security is protected by:
- Firebase Security Rules
- Firebase Authentication
- Authorized domains (already configured)

---

**After adding these 3 secrets, push your code and the next deployment will have working authentication!** 🔐
