# TLDR Content - Google Cloud Platform Deployment Guide

## Overview

Deploy your Next.js SSR/ISR application to **Google Cloud Run** using **GitHub Actions** (100% free CI/CD).

### Why This Stack?
- ✅ **GitHub Actions**: Unlimited free CI/CD for public repos
- ✅ **Cloud Run**: Serverless, auto-scaling, pay-per-use
- ✅ **Cost-effective**: ~$2-5/month for moderate traffic
- ✅ **Full control**: Your GCP project, your infrastructure
- ✅ **Zero vendor lock-in**: Standard Docker containers

---

## Cost Breakdown (Total Transparency)

### CI/CD Costs: $0/month
- **GitHub Actions**: Unlimited free for public repositories ✅
- **Your repo is public** → No CI/CD costs ever

### Runtime Costs: Cloud Run

**Free Tier (Monthly)**:
- 2 million requests
- 360,000 GB-seconds
- 180,000 vCPU-seconds
- 1 GB network egress

**Estimated Monthly Costs**:

| Traffic | Requests | Cost Estimate |
|---------|----------|---------------|
| **Low** (1M views) | 3M requests | **$0-2/month** (free tier) |
| **Medium** (10M views) | 30M requests | **$25-35/month** |
| **High** (100M views) | 300M requests | **$250-350/month** |

**Note**: Cloud Run scales to zero when not in use, so you only pay for actual traffic.

---

## Prerequisites

### 1. Install Google Cloud CLI

**macOS:**
```bash
brew install --cask google-cloud-sdk
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 2. Authenticate with GCP
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 3. Enable Required APIs
```bash
gcloud services enable \
  run.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com
```

---

## Setup: GitHub Actions CI/CD (FREE)

### Step 1: Create GCP Service Account

```bash
# Set your project ID
export PROJECT_ID="your-project-id"

# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployer"

# Grant necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### Step 2: Create Service Account Key

```bash
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@${PROJECT_ID}.iam.gserviceaccount.com

# Display the key content (copy this)
cat key.json
```

⚠️ **Security**: Delete `key.json` after copying to GitHub Secrets.

### Step 3: Store Secrets in GitHub

Go to: `https://github.com/Mono-TV/tldr-content/settings/secrets/actions`

Add these secrets:

1. **GCP_PROJECT_ID**: Your GCP project ID (e.g., `tldrcontent-12345`)
2. **GCP_SA_KEY**: Paste the entire contents of `key.json`
3. **API_URL**: `https://content-api-401132033262.asia-south1.run.app`

Optional (if using Firebase):
4. **FIREBASE_API_KEY**: Your Firebase API key
5. **FIREBASE_PROJECT_ID**: Your Firebase project ID
6. **FIREBASE_AUTH_DOMAIN**: Your Firebase auth domain

### Step 4: Create Secrets in GCP Secret Manager

```bash
# For Firebase credentials (if needed)
echo -n "your_firebase_api_key" | \
  gcloud secrets create firebase-api-key --data-file=-

echo -n "your_firebase_project_id" | \
  gcloud secrets create firebase-project-id --data-file=-

echo -n "your_firebase_auth_domain" | \
  gcloud secrets create firebase-auth-domain --data-file=-

# Grant access to Cloud Run service account
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

gcloud secrets add-iam-policy-binding firebase-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding firebase-project-id \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding firebase-auth-domain \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 5: Deploy!

```bash
git add .github/workflows/deploy-cloud-run.yml
git commit -m "Add GitHub Actions deployment"
git push origin main
```

✅ GitHub Actions will automatically:
1. Build Docker image
2. Push to Google Container Registry
3. Deploy to Cloud Run
4. Output the service URL

Monitor deployment: https://github.com/Mono-TV/tldr-content/actions

---

## Manual Deployment (Alternative)

If you prefer manual control:

### Build & Deploy

```bash
cd web

# Build Docker image
docker build -t gcr.io/$PROJECT_ID/tldrcontent:latest .

# Push to GCR
docker push gcr.io/$PROJECT_ID/tldrcontent:latest

# Deploy to Cloud Run
gcloud run deploy tldrcontent \
  --image gcr.io/$PROJECT_ID/tldrcontent:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,NEXT_PUBLIC_API_URL=https://content-api-401132033262.asia-south1.run.app"
```

---

## Custom Domain Setup

### Step 1: Map Domain

```bash
gcloud run domain-mappings create \
  --service tldrcontent \
  --domain your-domain.com \
  --region us-central1
```

### Step 2: Update DNS

Add these records to your domain registrar:

```
Type: A
Name: @
Value: 216.239.32.21

Type: AAAA
Name: @
Value: 2001:4860:4802:32::15

Type: CNAME
Name: www
Value: ghs.googlehosted.com
```

SSL certificate auto-provisions in ~15 minutes.

---

## Scaling Configuration

### Current Settings (Optimized for Low Cost)

```yaml
Memory: 1Gi
CPU: 1
Min instances: 0  # Scale to zero when idle
Max instances: 10
Concurrency: 80
```

### Recommended Configurations

**Startup/Low Traffic** (Free tier friendly):
```bash
gcloud run services update tldrcontent \
  --region us-central1 \
  --min-instances 0 \
  --max-instances 10 \
  --cpu 1 \
  --memory 1Gi \
  --concurrency 80
```

**Growing Traffic** (Keep 1 instance warm):
```bash
gcloud run services update tldrcontent \
  --region us-central1 \
  --min-instances 1 \
  --max-instances 50 \
  --cpu 1 \
  --memory 2Gi \
  --concurrency 80
```

**High Traffic** (Production scale):
```bash
gcloud run services update tldrcontent \
  --region us-central1 \
  --min-instances 3 \
  --max-instances 100 \
  --cpu 2 \
  --memory 2Gi \
  --concurrency 100
```

---

## Monitoring & Logging

### View Logs

```bash
# Real-time logs
gcloud run services logs tail tldrcontent --region us-central1

# Last 100 lines
gcloud run services logs read tldrcontent --region us-central1 --limit 100
```

### Cloud Console

Navigate to: https://console.cloud.google.com/run

Metrics available:
- Request count & latency
- Instance count
- CPU & memory utilization
- Error rates
- Billable time

### Set Up Alerts

```bash
# Create alert for high error rate
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate Alert" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=5
```

---

## Rollback & Version Management

### List Revisions

```bash
gcloud run revisions list --service tldrcontent --region us-central1
```

### Instant Rollback

```bash
# Get previous revision name
PREV_REVISION=$(gcloud run revisions list --service tldrcontent --region us-central1 --format="value(name)" --limit=2 | tail -1)

# Route all traffic to it
gcloud run services update-traffic tldrcontent \
  --region us-central1 \
  --to-revisions $PREV_REVISION=100
```

### Gradual Traffic Split (Blue-Green Deployment)

```bash
# Split 90/10 between new and old
gcloud run services update-traffic tldrcontent \
  --region us-central1 \
  --to-revisions NEW_REVISION=90,OLD_REVISION=10
```

---

## Troubleshooting

### GitHub Actions Build Fails

Check: https://github.com/Mono-TV/tldr-content/actions

Common issues:
- Missing GitHub Secrets (GCP_PROJECT_ID, GCP_SA_KEY)
- Invalid service account key JSON
- Missing GCP API enablement

### Deployment Fails

```bash
# Check service status
gcloud run services describe tldrcontent --region us-central1

# Common issues:
# 1. Missing environment variables
# 2. Port not exposed (should be 3000)
# 3. Container exits immediately (check logs)
```

### Slow Performance

```bash
# Keep 1 instance warm to avoid cold starts
gcloud run services update tldrcontent \
  --region us-central1 \
  --min-instances 1

# Or increase resources
gcloud run services update tldrcontent \
  --region us-central1 \
  --cpu 2 \
  --memory 2Gi
```

### Out of Memory

```bash
# Increase memory
gcloud run services update tldrcontent \
  --region us-central1 \
  --memory 2Gi

# Or reduce concurrency
gcloud run services update tldrcontent \
  --region us-central1 \
  --concurrency 40
```

---

## Cost Optimization Tips

### 1. Use Min Instances = 0
Scales to zero when idle → no charges during off-hours.

### 2. Enable CDN Caching
```bash
# Add Cloud CDN for static assets
gcloud compute backend-services update tldrcontent-backend \
  --enable-cdn
```

### 3. Optimize Docker Image
Current Dockerfile already optimized with:
- Multi-stage build
- Alpine Linux base
- Next.js standalone output

### 4. Monitor Usage
```bash
# Check current month's costs
gcloud billing projects describe $PROJECT_ID \
  --format="value(billingAccountName)"
```

---

## Security Best Practices

### 1. Use Secret Manager (Not Env Vars)

Sensitive data should be in Secret Manager, not environment variables:

```bash
# Store secret
echo -n "sensitive_value" | gcloud secrets create my-secret --data-file=-

# Reference in deployment
gcloud run services update tldrcontent \
  --set-secrets MY_SECRET=my-secret:latest
```

### 2. Least Privilege Service Account

Create custom service account with minimal permissions:

```bash
gcloud iam service-accounts create tldrcontent-runtime \
  --display-name="TLDR Content Runtime"

# Grant only necessary roles
gcloud run services update tldrcontent \
  --service-account tldrcontent-runtime@$PROJECT_ID.iam.gserviceaccount.com
```

### 3. Enable Binary Authorization

Ensure only verified images are deployed:

```bash
gcloud run services update tldrcontent \
  --binary-authorization=default
```

---

## Quick Commands Reference

```bash
# Deploy
gcloud run deploy tldrcontent --image gcr.io/$PROJECT_ID/tldrcontent:latest --region us-central1

# Logs
gcloud run services logs tail tldrcontent --region us-central1

# Update env vars
gcloud run services update tldrcontent --set-env-vars KEY=VALUE --region us-central1

# Scale
gcloud run services update tldrcontent --min-instances 1 --max-instances 50 --region us-central1

# Rollback
gcloud run services update-traffic tldrcontent --to-revisions REVISION=100 --region us-central1

# Delete
gcloud run services delete tldrcontent --region us-central1
```

---

## Workflow Summary

```
1. Push code to main branch
   ↓
2. GitHub Actions triggers (FREE)
   ↓
3. Build Docker image
   ↓
4. Push to GCR
   ↓
5. Deploy to Cloud Run
   ↓
6. Health check passes
   ↓
7. Live at your URL!
```

---

## Support & Resources

- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **GitHub Actions**: https://docs.github.com/actions
- **GCP Console**: https://console.cloud.google.com
- **Pricing Calculator**: https://cloud.google.com/products/calculator

---

**Last Updated**: January 9, 2026
**Version**: 2.0 (GitHub Actions + Cloud Run)
