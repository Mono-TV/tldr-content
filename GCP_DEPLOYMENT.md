# TLDR Content - Google Cloud Platform Deployment Guide

## Overview

Deploy your Next.js SSR/ISR application to **Google Cloud Run** - a fully managed serverless platform that automatically scales from zero to handle any traffic level.

### Why Cloud Run?
- ✅ **Serverless**: No infrastructure management
- ✅ **Auto-scaling**: Scales to zero when not in use
- ✅ **Cost-effective**: Pay only for actual usage
- ✅ **Fast**: Cold starts ~1-2 seconds
- ✅ **Full control**: Your GCP project, your data
- ✅ **Docker-based**: Standard containerization

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

**Windows:**
Download from: https://cloud.google.com/sdk/docs/install

### 2. Authenticate with GCP
```bash
gcloud auth login
gcloud auth configure-docker
```

### 3. Create or Select GCP Project
```bash
# Create new project
gcloud projects create tldrcontent --name="TLDR Content"

# Or list existing projects
gcloud projects list

# Set active project
gcloud config set project tldrcontent
```

### 4. Enable Required APIs
```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com
```

---

## Method 1: Manual Deployment (Quick Start)

### Step 1: Build Docker Image Locally

```bash
cd web

# Build the image
docker build -t gcr.io/tldrcontent/tldrcontent:latest .

# Test locally (optional)
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="https://content-api-401132033262.asia-south1.run.app" \
  gcr.io/tldrcontent/tldrcontent:latest
```

### Step 2: Push to Google Container Registry

```bash
docker push gcr.io/tldrcontent/tldrcontent:latest
```

### Step 3: Deploy to Cloud Run

```bash
gcloud run deploy tldrcontent \
  --image gcr.io/tldrcontent/tldrcontent:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 60s \
  --set-env-vars "NODE_ENV=production,NEXT_PUBLIC_API_URL=https://content-api-401132033262.asia-south1.run.app"
```

### Step 4: Get Your URL

After deployment completes:
```bash
gcloud run services describe tldrcontent --region us-central1 --format 'value(status.url)'
```

Your app will be live at: `https://tldrcontent-xxx-uc.a.run.app`

---

## Method 2: Automated CI/CD with Cloud Build (Recommended)

### Step 1: Store Environment Variables as Secrets

```bash
# Create Firebase API Key secret
echo -n "your_firebase_api_key" | \
  gcloud secrets create firebase-api-key --data-file=-

# Create other secrets
echo -n "your_project_id" | \
  gcloud secrets create firebase-project-id --data-file=-

echo -n "your_auth_domain" | \
  gcloud secrets create firebase-auth-domain --data-file=-

# List all secrets
gcloud secrets list
```

### Step 2: Grant Cloud Build Permissions

```bash
# Get project number
PROJECT_NUMBER=$(gcloud projects describe tldrcontent --format='value(projectNumber)')

# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding tldrcontent \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

# Grant Service Account User role
gcloud iam service-accounts add-iam-policy-binding \
  ${PROJECT_NUMBER}-compute@developer.gserviceaccount.com \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Grant Secret Accessor role
gcloud projects add-iam-policy-binding tldrcontent \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 3: Connect GitHub Repository

```bash
# Install Cloud Build GitHub app
gcloud alpha builds triggers create github \
  --repo-name=tldr-content \
  --repo-owner=Mono-TV \
  --branch-pattern="^main$" \
  --build-config=web/cloudbuild.yaml \
  --name=tldrcontent-deploy
```

Or use the Cloud Console:
1. Go to: https://console.cloud.google.com/cloud-build/triggers
2. Click "Connect Repository"
3. Select GitHub → Authenticate → Select `Mono-TV/tldr-content`
4. Create trigger:
   - **Name**: tldrcontent-deploy
   - **Event**: Push to branch
   - **Branch**: `^main$`
   - **Build configuration**: Cloud Build configuration file
   - **Location**: `web/cloudbuild.yaml`

### Step 4: Update Cloud Build Config with Secrets

Edit `web/cloudbuild.yaml` and add environment variables from secrets:

```yaml
  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'tldrcontent'
      - '--image'
      - 'gcr.io/$PROJECT_ID/tldrcontent:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--memory'
      - '1Gi'
      - '--cpu'
      - '1'
      - '--min-instances'
      - '0'
      - '--max-instances'
      - '10'
      - '--timeout'
      - '60s'
      - '--update-secrets'
      - 'NEXT_PUBLIC_FIREBASE_API_KEY=firebase-api-key:latest,NEXT_PUBLIC_FIREBASE_PROJECT_ID=firebase-project-id:latest,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=firebase-auth-domain:latest'
      - '--set-env-vars'
      - 'NODE_ENV=production,NEXT_PUBLIC_API_URL=https://content-api-401132033262.asia-south1.run.app'
```

### Step 5: Deploy

Now every push to `main` branch automatically deploys:

```bash
git add .
git commit -m "Configure Cloud Run deployment"
git push origin main
```

Monitor build: https://console.cloud.google.com/cloud-build/builds

---

## Environment Variables Configuration

### Required Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://content-api-401132033262.asia-south1.run.app

# Firebase Configuration (for authentication)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Node Environment
NODE_ENV=production
```

### Adding Environment Variables to Cloud Run

```bash
gcloud run services update tldrcontent \
  --region us-central1 \
  --set-env-vars "NEXT_PUBLIC_API_URL=https://content-api-401132033262.asia-south1.run.app"

# Or from a file
gcloud run services update tldrcontent \
  --region us-central1 \
  --env-vars-file .env.production
```

---

## Custom Domain Setup

### Step 1: Verify Domain Ownership

```bash
gcloud domains verify tldrcontent.com
```

### Step 2: Map Domain to Cloud Run

```bash
gcloud run domain-mappings create \
  --service tldrcontent \
  --domain tldrcontent.com \
  --region us-central1
```

### Step 3: Update DNS Records

Add the DNS records shown in the output to your domain registrar:

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

SSL certificate is automatically provisioned (may take 15 minutes).

---

## Scaling Configuration

### Auto-scaling Settings

```bash
# Update scaling configuration
gcloud run services update tldrcontent \
  --region us-central1 \
  --min-instances 0 \
  --max-instances 100 \
  --cpu 2 \
  --memory 2Gi \
  --concurrency 80
```

### Scaling Parameters Explained

- **min-instances**: Minimum always-running instances (0 = scale to zero)
- **max-instances**: Maximum instances during traffic spikes
- **cpu**: CPU cores per instance (1 or 2)
- **memory**: RAM per instance (256Mi to 8Gi)
- **concurrency**: Max concurrent requests per instance (1-1000)

### Recommended Configurations

**Low Traffic (Free tier)**:
```bash
--min-instances 0 --max-instances 10 --cpu 1 --memory 1Gi --concurrency 80
```

**Medium Traffic**:
```bash
--min-instances 1 --max-instances 50 --cpu 1 --memory 2Gi --concurrency 80
```

**High Traffic**:
```bash
--min-instances 3 --max-instances 100 --cpu 2 --memory 2Gi --concurrency 100
```

---

## Cost Estimates

### Cloud Run Pricing (us-central1)

**Free Tier (Monthly)**:
- 2 million requests
- 360,000 GB-seconds (memory)
- 180,000 vCPU-seconds
- 1 GB network egress

**Paid Pricing**:
- **CPU**: $0.00002400 per vCPU-second
- **Memory**: $0.00000250 per GB-second
- **Requests**: $0.40 per million
- **Network Egress**: $0.12 per GB

### Example Monthly Costs

**Scenario 1: Low Traffic (1M page views)**
- Requests: 1M × $0.40/1M = $0.40
- CPU: ~50,000 vCPU-seconds × $0.000024 = $1.20
- Memory: ~100,000 GB-seconds × $0.0000025 = $0.25
- **Total: ~$2/month** (mostly free tier)

**Scenario 2: Medium Traffic (10M page views)**
- Requests: 10M × $0.40/1M = $4.00
- CPU: ~500,000 vCPU-seconds × $0.000024 = $12.00
- Memory: ~1M GB-seconds × $0.0000025 = $2.50
- Network: ~100GB × $0.12 = $12.00
- **Total: ~$30/month**

**Scenario 3: High Traffic (100M page views)**
- Requests: 100M × $0.40/1M = $40.00
- CPU: ~5M vCPU-seconds × $0.000024 = $120.00
- Memory: ~10M GB-seconds × $0.0000025 = $25.00
- Network: ~1TB × $0.12 = $120.00
- **Total: ~$305/month**

### Additional Costs

- **Container Registry**: $0.026/GB storage + network egress
- **Secret Manager**: $0.06 per 10,000 accesses
- **Cloud Build**: First 120 build-minutes/day free

---

## Monitoring & Logging

### View Logs

```bash
# Real-time logs
gcloud run services logs tail tldrcontent --region us-central1

# Last 100 lines
gcloud run services logs read tldrcontent --region us-central1 --limit 100
```

### Cloud Console Monitoring

Navigate to: https://console.cloud.google.com/run

View metrics:
- Request count
- Request latency (P50, P95, P99)
- Instance count
- CPU utilization
- Memory utilization
- Billable container time

### Set Up Alerts

```bash
# Install alerting (requires Cloud Monitoring)
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=5 \
  --condition-threshold-duration=300s
```

---

## Troubleshooting

### Build Fails

```bash
# View build logs
gcloud builds list --limit=5
gcloud builds log BUILD_ID

# Common issues:
# 1. Missing package.json dependencies
# 2. Build timeout (increase in cloudbuild.yaml)
# 3. Out of memory (use machineType: E2_HIGHCPU_8)
```

### Deployment Fails

```bash
# Check service status
gcloud run services describe tldrcontent --region us-central1

# View revision details
gcloud run revisions list --service tldrcontent --region us-central1

# Common issues:
# 1. Missing environment variables
# 2. Port not set to 3000
# 3. Container exits immediately (check logs)
```

### Slow Performance

```bash
# Check if cold starts are the issue
# Increase min-instances to keep instances warm:
gcloud run services update tldrcontent \
  --region us-central1 \
  --min-instances 1

# Or increase CPU/memory:
gcloud run services update tldrcontent \
  --region us-central1 \
  --cpu 2 \
  --memory 2Gi
```

### Out of Memory Errors

```bash
# Increase memory allocation
gcloud run services update tldrcontent \
  --region us-central1 \
  --memory 2Gi

# Or reduce concurrency
gcloud run services update tldrcontent \
  --region us-central1 \
  --concurrency 40
```

---

## Rollback & Version Management

### List Revisions

```bash
gcloud run revisions list --service tldrcontent --region us-central1
```

### Rollback to Previous Revision

```bash
# Get revision name
gcloud run revisions list --service tldrcontent --region us-central1

# Route traffic to previous revision
gcloud run services update-traffic tldrcontent \
  --region us-central1 \
  --to-revisions REVISION_NAME=100
```

### Gradual Traffic Migration

```bash
# Split traffic 50/50 between two revisions
gcloud run services update-traffic tldrcontent \
  --region us-central1 \
  --to-revisions NEW_REVISION=50,OLD_REVISION=50

# Gradually increase new revision
gcloud run services update-traffic tldrcontent \
  --region us-central1 \
  --to-revisions NEW_REVISION=75,OLD_REVISION=25
```

---

## Security Best Practices

### 1. Use Secret Manager (Not Environment Variables)

```bash
# Store sensitive data in Secret Manager
echo -n "sensitive_value" | gcloud secrets create my-secret --data-file=-

# Reference in Cloud Run
gcloud run services update tldrcontent \
  --region us-central1 \
  --update-secrets MY_SECRET=my-secret:latest
```

### 2. Restrict Service Account Permissions

```bash
# Create custom service account with minimal permissions
gcloud iam service-accounts create tldrcontent-sa \
  --display-name="TLDR Content Service Account"

# Grant only necessary roles
gcloud projects add-iam-policy-binding tldrcontent \
  --member="serviceAccount:tldrcontent-sa@tldrcontent.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

# Use in Cloud Run
gcloud run services update tldrcontent \
  --region us-central1 \
  --service-account tldrcontent-sa@tldrcontent.iam.gserviceaccount.com
```

### 3. Enable Cloud Armor (DDoS Protection)

```bash
# Create security policy
gcloud compute security-policies create tldrcontent-policy \
  --description "TLDR Content DDoS protection"

# Add rate limiting rule
gcloud compute security-policies rules create 1000 \
  --security-policy tldrcontent-policy \
  --expression "true" \
  --action "rate-based-ban" \
  --rate-limit-threshold-count 1000 \
  --rate-limit-threshold-interval-sec 60 \
  --ban-duration-sec 600
```

---

## CI/CD Workflow Summary

```
1. Developer pushes to main branch
   ↓
2. Cloud Build trigger fires
   ↓
3. Build Docker image (web/Dockerfile)
   ↓
4. Push to Container Registry
   ↓
5. Deploy to Cloud Run
   ↓
6. Health check passes
   ↓
7. Traffic switches to new revision
   ↓
8. Old revision remains for rollback
```

---

## Quick Commands Reference

```bash
# Deploy
gcloud run deploy tldrcontent --image gcr.io/tldrcontent/tldrcontent:latest --region us-central1

# View logs
gcloud run services logs tail tldrcontent --region us-central1

# Update environment
gcloud run services update tldrcontent --set-env-vars KEY=VALUE --region us-central1

# Scale
gcloud run services update tldrcontent --min-instances 1 --max-instances 50 --region us-central1

# Rollback
gcloud run services update-traffic tldrcontent --to-revisions REVISION=100 --region us-central1

# Delete service
gcloud run services delete tldrcontent --region us-central1
```

---

## Support & Resources

- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **Next.js Docker**: https://nextjs.org/docs/deployment#docker-image
- **GCP Console**: https://console.cloud.google.com
- **Pricing Calculator**: https://cloud.google.com/products/calculator

---

**Last Updated**: January 9, 2026
**Version**: 1.0 (Cloud Run Deployment)
