# TLDR Content - Project Boundaries & Validation

This document defines the strict project boundaries for the TLDR Content application and explains the validation mechanisms in place to ensure all deployments and configurations stay within these boundaries.

## 🔒 Project Boundaries

This application is **strictly confined** to the following GCP and Firebase projects:

### Google Cloud Platform (GCP)
- **Project ID:** `tldr-music`
- **Project Number:** `401132033262`
- **Region:** `us-central1`
- **Cloud Run Service:** `tldrcontent`
- **Service URL:** https://tldrcontent-401132033262.us-central1.run.app

### Firebase
- **Project ID:** `content-lumiolabs-internal`
- **Project Number:** `865621748276`
- **Auth Domain:** `content-lumiolabs-internal.firebaseapp.com`

### Domains
- **Production:** https://content.lumiolabs.in
- **Cloud Run Direct:** https://tldrcontent-401132033262.us-central1.run.app

## 🛡️ Validation Mechanisms

Multiple layers of validation ensure deployments stay within project boundaries:

### 1. GitHub Actions Workflow Validation

**File:** `.github/workflows/deploy-cloud-run.yml`

**What it does:**
- Validates GCP project ID before every deployment
- Validates GCP project number to prevent project ID spoofing
- Validates Firebase project configuration in secrets
- **Fails the deployment** if any validation check fails

**Checks:**
```bash
✅ GCP Project ID must be: tldr-music
✅ GCP Project Number must be: 401132033262
✅ Firebase Project ID must be: content-lumiolabs-internal
```

**When it runs:** On every push to `main` branch that affects `web/**` files

### 2. Local Validation Script

**File:** `scripts/validate-project.sh`

**What it does:**
- Checks local `gcloud` configuration
- Validates Firebase configuration in `web/.env.local`
- Validates project configuration file (`.project-config.json`)
- Provides clear error messages and fix instructions

**Usage:**
```bash
# Run validation manually
./scripts/validate-project.sh

# Expected output on success:
✅ All validations passed!
✅ GCP Project: tldr-music (401132033262)
✅ Firebase Project: content-lumiolabs-internal
```

**When to run:**
- Before committing code changes
- Before manual deployments
- When switching between projects

### 3. Runtime Configuration Validation

**File:** `web/src/lib/validate-config.ts`

**What it does:**
- Validates Firebase configuration at application startup
- Prevents app from running with wrong Firebase project
- Logs validation errors in development
- **Throws errors** in production to prevent misconfigurations

**Integration:**
- Automatically runs when `firebase.ts` is imported
- Validates environment variables against allowed projects
- Cannot be bypassed or disabled

### 4. Project Configuration File

**File:** `.project-config.json`

**What it does:**
- Single source of truth for project boundaries
- Machine-readable configuration for automation tools
- Documents all project IDs, URLs, and boundaries

## 🚫 What Happens If Wrong Project is Detected?

### During GitHub Actions Deployment:
```
❌ ERROR: Wrong GCP project detected!
This repository must ONLY deploy to: tldr-music
Attempted deployment to: <wrong-project>

Deployment FAILED ⛔
```

### During Local Validation:
```bash
❌ ERROR: Wrong GCP project!
This repository MUST use: tldr-music
You are currently using: <wrong-project>

To fix this, run:
  gcloud config set project tldr-music
```

### During Application Runtime:
```
❌ Firebase configuration validation failed!
Expected project: content-lumiolabs-internal
Current project: <wrong-project>

Error: Invalid Firebase configuration.
This app must use project: content-lumiolabs-internal
```

## ✅ How to Ensure Correct Configuration

### For Local Development:

1. **Set GCP Project:**
   ```bash
   gcloud config set project tldr-music
   gcloud config set compute/region us-central1
   ```

2. **Verify Configuration:**
   ```bash
   ./scripts/validate-project.sh
   ```

3. **Check Environment Variables:**
   ```bash
   cat web/.env.local
   # Should show:
   # NEXT_PUBLIC_FIREBASE_PROJECT_ID=content-lumiolabs-internal
   ```

### For GitHub Actions:

GitHub Secrets must be configured with:
```
GCP_PROJECT_ID=tldr-music
FIREBASE_PROJECT_ID=content-lumiolabs-internal
FIREBASE_API_KEY=<from Firebase console>
FIREBASE_AUTH_DOMAIN=content-lumiolabs-internal.firebaseapp.com
```

Validation runs automatically on every push.

### For New Team Members:

1. Clone the repository
2. Run `./scripts/validate-project.sh` to check configuration
3. Follow the script's instructions to fix any issues
4. Ensure `.env.local` has correct Firebase project ID

## 📋 Validation Checklist

Before committing or deploying, ensure:

- [ ] `gcloud config get-value project` returns `tldr-music`
- [ ] `web/.env.local` has `NEXT_PUBLIC_FIREBASE_PROJECT_ID=content-lumiolabs-internal`
- [ ] `./scripts/validate-project.sh` passes all checks
- [ ] GitHub Actions secrets are correctly configured
- [ ] No hardcoded project IDs pointing to other projects

## 🔧 Maintenance

### Updating Project Boundaries (If Ever Needed):

If project boundaries need to change, update these files:

1. `.project-config.json` - Update project IDs and numbers
2. `.github/workflows/deploy-cloud-run.yml` - Update `ALLOWED_*` environment variables
3. `scripts/validate-project.sh` - Update `ALLOWED_*` constants
4. `web/src/lib/validate-config.ts` - Update `ALLOWED_CONFIG` object
5. `PROJECT-BOUNDARIES.md` - Update this documentation

**⚠️ WARNING:** Changing project boundaries requires review and approval from project maintainers.

## 🆘 Troubleshooting

### "Wrong GCP project detected" error:

**Solution:**
```bash
gcloud config set project tldr-music
./scripts/validate-project.sh
```

### "Wrong Firebase project in .env.local" error:

**Solution:**
```bash
cd web
# Update NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local
echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID=content-lumiolabs-internal" >> .env.local
```

### GitHub Actions deployment failing validation:

**Solution:**
1. Check GitHub repository secrets
2. Ensure `GCP_SA_KEY` is from the `tldr-music` project
3. Verify `FIREBASE_PROJECT_ID` secret is set to `content-lumiolabs-internal`

## 📞 Support

If you encounter validation errors you cannot resolve:

1. Run `./scripts/validate-project.sh` for detailed error messages
2. Check this document for troubleshooting steps
3. Review `.project-config.json` for correct configuration
4. Contact the project maintainer

## 📝 Summary

**Key Principle:** This application operates **exclusively** within:
- GCP Project: `tldr-music` (401132033262)
- Firebase Project: `content-lumiolabs-internal` (865621748276)

**Enforcement:** Multiple automated validation layers prevent accidental deployments to wrong projects.

**Validation Points:**
1. ✅ GitHub Actions (pre-deployment)
2. ✅ Local validation script (pre-commit)
3. ✅ Runtime configuration (application startup)
4. ✅ Project configuration file (documentation & automation)

All validations are **mandatory** and **cannot be bypassed**.
