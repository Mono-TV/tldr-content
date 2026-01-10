# Hotstar Cloud Deployment - Quick Start ⚡

Deploy the entire Hotstar ingestion system to Google Cloud in **under 30 minutes** with automated scripts.

---

## 🎯 What You'll Get

- ✅ Managed PostgreSQL database (Cloud SQL)
- ✅ Automated daily sync (Cloud Scheduler + Cloud Run Jobs)
- ✅ Secure credential storage (Secret Manager)
- ✅ Complete logging and monitoring
- ✅ Auto-scaling and high availability
- ✅ ~$17/month operational cost

---

## 📋 Prerequisites

1. **Google Cloud account** with billing enabled
2. **gcloud CLI** installed
   ```bash
   # Install gcloud CLI (if not installed)
   # macOS:
   brew install --cask google-cloud-sdk

   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

3. **Docker** installed
   ```bash
   # macOS:
   brew install docker

   # Or download from: https://www.docker.com/products/docker-desktop
   ```

4. **Authenticated with gcloud**
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

---

## 🚀 One-Command Deployment

### Step 1: Run Automated Setup

```bash
# Navigate to project directory
cd /Users/mono/Documents/Programs/Lumio/tldrcontent

# Run deployment script
./deploy-hotstar-cloud.sh YOUR_PROJECT_ID us-central1
```

**Example:**
```bash
./deploy-hotstar-cloud.sh tldrcontent-prod us-central1
```

The script will:
- ✅ Enable required Google Cloud APIs
- ✅ Create Cloud SQL instance (takes ~5-10 minutes)
- ✅ Set up database and secrets
- ✅ Build and push Docker image
- ✅ Create Cloud Run Jobs
- ✅ Configure Cloud Scheduler
- ✅ Set up IAM permissions

**Total time: ~15 minutes** (most time is waiting for Cloud SQL creation)

---

### Step 2: Run Database Migrations

```bash
# Connect to Cloud SQL
gcloud sql connect tldrcontent-hotstar-db --user=postgres --database=hotstar_source

# You'll be prompted for password (the one you set during deployment)
# Then paste each migration file content:
```

**Migration 1: Create movies table**
```bash
# Copy content from migrations/001_create_hotstar_movies.sql
# Paste into psql prompt
```

**Migration 2: Create sync log**
```bash
# Copy content from migrations/002_create_sync_log.sql
# Paste into psql prompt
```

**Migration 3: Create API tokens table**
```bash
# Copy content from migrations/003_create_api_tokens.sql
# Paste into psql prompt
```

**Verify tables:**
```sql
\dt
-- Should show: hotstar_movies, hotstar_sync_log, hotstar_api_tokens

\q  -- Exit psql
```

---

### Step 3: Run Initial Ingestion

```bash
# Execute initial ingestion job (~2 minutes)
gcloud run jobs execute ingest-hotstar-initial \
  --region=us-central1 \
  --wait

# View real-time logs
gcloud logging read \
  "resource.type=cloud_run_job AND resource.labels.job_name=ingest-hotstar-initial" \
  --limit=100 \
  --format="table(timestamp,textPayload)"
```

**Expected output in logs:**
```
🚀 Starting Hotstar Movie Ingestion...
✅ Database connected
📥 Phase 1: Fetching first 10,000 movies...
  Batch 1/10: Movies 0 to 1,000
  ✓ Saved 1000 movies (Total: 1,000)
...
✅ INGESTION COMPLETE!
  Total Movies:     51,495
  Time Taken:       67.3s (1.1 min)
```

---

### Step 4: Verify Deployment

```bash
# Check job status
gcloud run jobs executions list \
  --job=ingest-hotstar-initial \
  --region=us-central1

# Verify data in database
gcloud sql connect tldrcontent-hotstar-db --user=postgres --database=hotstar_source

# Then run:
SELECT COUNT(*) FROM hotstar_movies;
-- Expected: 51,495

SELECT * FROM hotstar_sync_log ORDER BY started_at DESC LIMIT 1;
-- Should show completed initial sync

\q
```

---

### Step 5: Test Daily Sync

```bash
# Trigger daily sync manually
gcloud run jobs execute sync-hotstar-daily \
  --region=us-central1 \
  --wait

# View logs
gcloud logging read \
  "resource.type=cloud_run_job AND resource.labels.job_name=sync-hotstar-daily" \
  --limit=50
```

**Expected output:**
```
🔄 Starting Hotstar Daily Sync...
✅ Database connected
📅 Time Window:
  From: 2026-01-09 20:30:00
  To:   2026-01-10 20:30:00
📥 Fetching updated movies...
  Found 15 updated movies
  ✓ Added: 5
  ✓ Updated: 10
✅ DAILY SYNC COMPLETE!
  Time Taken:       2.3s
```

---

## 🎉 You're Done!

Your Hotstar ingestion is now:
- ✅ Running in the cloud
- ✅ Syncing daily at 2 AM IST
- ✅ Storing data in managed PostgreSQL
- ✅ Fully automated and monitored

---

## 📊 What Happens Daily

**Every day at 2:00 AM IST:**
1. Cloud Scheduler triggers `sync-hotstar-daily` job
2. Job connects to Cloud SQL
3. Fetches movies updated in last 24 hours
4. Adds new movies, updates existing ones
5. Logs everything to Cloud Logging
6. **Every Monday:** Also checks for deleted movies

**You don't need to do anything!** Just check logs occasionally.

---

## 🔍 Monitoring Commands

### View Recent Logs
```bash
gcloud logging read \
  "resource.type=cloud_run_job" \
  --limit=100 \
  --format="table(timestamp,resource.labels.job_name,textPayload)"
```

### Check Scheduler Status
```bash
gcloud scheduler jobs describe sync-hotstar-daily-trigger \
  --location=us-central1
```

### View Database Stats
```bash
gcloud sql connect tldrcontent-hotstar-db --user=postgres --database=hotstar_source

# Then:
SELECT
  sync_type,
  started_at,
  status,
  items_added,
  items_updated,
  duration_seconds
FROM hotstar_sync_log
ORDER BY started_at DESC
LIMIT 10;
```

### Check Costs
```bash
# View current month billing
gcloud billing accounts list
gcloud alpha billing accounts describe ACCOUNT_ID
```

Or visit: https://console.cloud.google.com/billing

---

## 🛠️ Common Operations

### Update Scripts

When you make changes to Python scripts:

```bash
# Rebuild and push Docker image
docker build -f Dockerfile.hotstar -t hotstar-ingestion:latest .
docker tag hotstar-ingestion:latest \
  us-central1-docker.pkg.dev/YOUR_PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest

# Update jobs (next run will use new image)
gcloud run jobs update sync-hotstar-daily \
  --image=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest \
  --region=us-central1
```

### Pause Syncing

```bash
# Pause Cloud Scheduler
gcloud scheduler jobs pause sync-hotstar-daily-trigger \
  --location=us-central1

# Resume later
gcloud scheduler jobs resume sync-hotstar-daily-trigger \
  --location=us-central1
```

### Save Costs (Pause Database)

```bash
# Stop database when not in use
gcloud sql instances patch tldrcontent-hotstar-db \
  --activation-policy=NEVER

# Resume when needed
gcloud sql instances patch tldrcontent-hotstar-db \
  --activation-policy=ALWAYS
```

---

## 🐛 Troubleshooting

### Deployment Script Fails

**Check:**
1. gcloud CLI installed: `gcloud version`
2. Authenticated: `gcloud auth list`
3. Project set: `gcloud config get-value project`
4. Billing enabled: Visit console.cloud.google.com/billing

### Job Fails to Start

```bash
# Check job configuration
gcloud run jobs describe sync-hotstar-daily --region=us-central1

# View error logs
gcloud logging read \
  "resource.type=cloud_run_job AND severity>=ERROR" \
  --limit=50
```

### Database Connection Issues

```bash
# Check Cloud SQL status
gcloud sql instances describe tldrcontent-hotstar-db

# Should show: state: RUNNABLE

# If stopped, start it:
gcloud sql instances patch tldrcontent-hotstar-db \
  --activation-policy=ALWAYS
```

---

## 💰 Cost Breakdown

**Monthly costs (approximate):**

| Service | Cost |
|---------|------|
| Cloud SQL (db-f1-micro, always-on) | $15 |
| Cloud SQL Storage (10GB SSD) | $2 |
| Cloud Run Jobs (30 runs × 10s) | <$0.01 |
| Cloud Scheduler | $0.10 |
| Artifact Registry | <$0.01 |
| Secret Manager | <$0.01 |
| **Total** | **~$17/month** |

**To reduce costs:**
- Use Cloud SQL auto-pause (only pay when active)
- Schedule sync less frequently (e.g., every 3 days)
- Use smaller Cloud SQL instance

---

## 📚 Reference

**Full Documentation:**
- `CLOUD_DEPLOYMENT_GUIDE.md` - Complete manual deployment steps
- `HOTSTAR_SETUP_GUIDE.md` - Local setup guide
- `HOTSTAR_IMPLEMENTATION_COMPLETE.md` - Full implementation details

**Management Console:**
- Cloud SQL: https://console.cloud.google.com/sql
- Cloud Run: https://console.cloud.google.com/run
- Cloud Scheduler: https://console.cloud.google.com/cloudscheduler
- Logs: https://console.cloud.google.com/logs

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Cloud SQL instance running
- [ ] Database `hotstar_source` created
- [ ] 3 tables created (movies, sync_log, api_tokens)
- [ ] 51,495+ movies in database
- [ ] Initial ingestion completed successfully
- [ ] Daily sync job exists
- [ ] Cloud Scheduler configured (2 AM IST)
- [ ] First manual sync tested successfully
- [ ] Logs visible in Cloud Logging

---

**Questions or issues?**
Check `CLOUD_DEPLOYMENT_GUIDE.md` for detailed troubleshooting.

**Deployment time:** 15-30 minutes
**Maintenance:** Zero (fully automated)
**Cost:** ~$17/month

🎉 **Enjoy your cloud-powered Hotstar ingestion!**
