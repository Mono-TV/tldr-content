# Hotstar Ingestion - Cloud Deployment Guide

**Platform:** Google Cloud Platform
**Services Used:**
- Cloud SQL (PostgreSQL) - Database
- Cloud Run Jobs - Python scripts execution
- Cloud Scheduler - Daily sync automation
- Secret Manager - Credentials storage
- Artifact Registry - Docker image storage

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Cloud Scheduler (Daily 2 AM)               │
└─────────────────────────────────────────────────────────┘
                         ↓ Triggers
┌─────────────────────────────────────────────────────────┐
│         Cloud Run Job: sync-hotstar-daily               │
│  - Runs sync-hotstar-daily.py                           │
│  - Duration: 5-10 seconds                               │
│  - Memory: 512MB, CPU: 1                                │
└─────────────────────────────────────────────────────────┘
                         ↓ Writes to
┌─────────────────────────────────────────────────────────┐
│         Cloud SQL (PostgreSQL 15)                       │
│  - Database: hotstar_source                             │
│  - Instance: tldrcontent-hotstar-db                     │
│  - Tier: db-f1-micro (or larger)                        │
└─────────────────────────────────────────────────────────┘
                         ↑ Reads from
┌─────────────────────────────────────────────────────────┐
│              Hotstar API                                │
│  (pp-catalog-api.hotstar.com)                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

1. **Google Cloud Project** with billing enabled
2. **gcloud CLI** installed and authenticated
3. **Docker** installed (for building images)
4. **Hotstar API credentials** (from `.env.local`)

---

## 🚀 Step-by-Step Deployment

### Step 1: Set Up Google Cloud Project

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
export REGION="us-central1"  # or your preferred region

# Set as default project
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  cloudscheduler.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com
```

### Step 2: Create Cloud SQL Instance

```bash
# Create PostgreSQL instance
gcloud sql instances create tldrcontent-hotstar-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION \
  --storage-type=SSD \
  --storage-size=10GB \
  --storage-auto-increase \
  --backup-start-time=03:00 \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=4

# Set root password
gcloud sql users set-password postgres \
  --instance=tldrcontent-hotstar-db \
  --password=YOUR_SECURE_PASSWORD

# Create database
gcloud sql databases create hotstar_source \
  --instance=tldrcontent-hotstar-db

# Get connection name (save this!)
gcloud sql instances describe tldrcontent-hotstar-db \
  --format='value(connectionName)'
# Output: PROJECT_ID:REGION:tldrcontent-hotstar-db
```

### Step 3: Store Secrets in Secret Manager

```bash
# Database password
echo -n "YOUR_SECURE_PASSWORD" | \
  gcloud secrets create hotstar-db-password --data-file=-

# Hotstar API secret
echo -n "7073910d5c5f50d16d50bfdfb0ebb156dd37bea138f341a8432c92e569881617" | \
  gcloud secrets create hotstar-api-secret --data-file=-

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding hotstar-db-password \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding hotstar-api-secret \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 4: Run Database Migrations

You can run migrations from your local machine or Cloud Shell:

```bash
# Install Cloud SQL Proxy locally
wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O cloud_sql_proxy
chmod +x cloud_sql_proxy

# Start proxy in background
./cloud_sql_proxy -instances=PROJECT_ID:REGION:tldrcontent-hotstar-db=tcp:5432 &

# Run migrations
export PGPASSWORD="YOUR_SECURE_PASSWORD"
psql -h localhost -U postgres -d hotstar_source < migrations/001_create_hotstar_movies.sql
psql -h localhost -U postgres -d hotstar_source < migrations/002_create_sync_log.sql
psql -h localhost -U postgres -d hotstar_source < migrations/003_create_api_tokens.sql

# Verify tables
psql -h localhost -U postgres -d hotstar_source -c "\dt"

# Stop proxy
pkill cloud_sql_proxy
```

**Or use Cloud Shell (easier):**

```bash
# Connect via Cloud Shell
gcloud sql connect tldrcontent-hotstar-db --user=postgres --database=hotstar_source

# Then paste migration SQL directly, or:
# Upload migration files to Cloud Shell and run them
```

### Step 5: Build and Push Docker Image

```bash
# Create Artifact Registry repository
gcloud artifacts repositories create hotstar-ingestion \
  --repository-format=docker \
  --location=$REGION \
  --description="Hotstar ingestion Docker images"

# Configure Docker authentication
gcloud auth configure-docker $REGION-docker.pkg.dev

# Build Docker image
docker build -f Dockerfile.hotstar -t hotstar-ingestion:latest .

# Tag for Artifact Registry
docker tag hotstar-ingestion:latest \
  $REGION-docker.pkg.dev/$PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest

# Push to registry
docker push $REGION-docker.pkg.dev/$PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest
```

### Step 6: Create Cloud Run Job for Daily Sync

```bash
# Get Cloud SQL connection name
export INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe tldrcontent-hotstar-db --format='value(connectionName)')

# Create Cloud Run Job
gcloud run jobs create sync-hotstar-daily \
  --image=$REGION-docker.pkg.dev/$PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest \
  --region=$REGION \
  --memory=512Mi \
  --cpu=1 \
  --max-retries=3 \
  --task-timeout=10m \
  --set-env-vars="DB_NAME=hotstar_source,DB_USER=postgres,CLOUD_SQL_CONNECTION_NAME=$INSTANCE_CONNECTION_NAME,HOTSTAR_PARTNER_ID=92837456123,HOTSTAR_API_BASE_URL=https://pp-catalog-api.hotstar.com" \
  --set-secrets="DB_PASSWORD=hotstar-db-password:latest,HOTSTAR_AKAMAI_SECRET=hotstar-api-secret:latest" \
  --set-cloudsql-instances=$INSTANCE_CONNECTION_NAME \
  --command="python3" \
  --args="scripts/sync-hotstar-daily.py"
```

### Step 7: Create Cloud Run Job for Initial Ingestion

```bash
# Create one-time ingestion job
gcloud run jobs create ingest-hotstar-initial \
  --image=$REGION-docker.pkg.dev/$PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest \
  --region=$REGION \
  --memory=1Gi \
  --cpu=2 \
  --max-retries=3 \
  --task-timeout=30m \
  --set-env-vars="DB_NAME=hotstar_source,DB_USER=postgres,CLOUD_SQL_CONNECTION_NAME=$INSTANCE_CONNECTION_NAME,HOTSTAR_PARTNER_ID=92837456123,HOTSTAR_API_BASE_URL=https://pp-catalog-api.hotstar.com" \
  --set-secrets="DB_PASSWORD=hotstar-db-password:latest,HOTSTAR_AKAMAI_SECRET=hotstar-api-secret:latest" \
  --set-cloudsql-instances=$INSTANCE_CONNECTION_NAME \
  --command="python3" \
  --args="scripts/ingest-hotstar-movies.py"
```

### Step 8: Run Initial Ingestion (One-time)

```bash
# Execute initial ingestion job
gcloud run jobs execute ingest-hotstar-initial \
  --region=$REGION \
  --wait

# Check logs
gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=ingest-hotstar-initial" \
  --limit=50 \
  --format="table(timestamp,textPayload)"
```

### Step 9: Set Up Cloud Scheduler for Daily Sync

```bash
# Create scheduler job (runs daily at 2 AM IST = 8:30 PM UTC previous day)
gcloud scheduler jobs create http sync-hotstar-daily-trigger \
  --location=$REGION \
  --schedule="30 20 * * *" \
  --time-zone="UTC" \
  --uri="https://$REGION-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/$PROJECT_ID/jobs/sync-hotstar-daily:run" \
  --http-method=POST \
  --oauth-service-account-email=$PROJECT_ID@appspot.gserviceaccount.com

# Test scheduler immediately (don't wait for 2 AM)
gcloud scheduler jobs run sync-hotstar-daily-trigger \
  --location=$REGION
```

### Step 10: Verify Deployment

```bash
# Check if initial ingestion completed
gcloud run jobs executions list \
  --job=ingest-hotstar-initial \
  --region=$REGION

# Check daily sync status
gcloud run jobs executions list \
  --job=sync-hotstar-daily \
  --region=$REGION

# View logs
gcloud logging read "resource.type=cloud_run_job" \
  --limit=100 \
  --format="table(timestamp,resource.labels.job_name,textPayload)"

# Connect to database and verify
gcloud sql connect tldrcontent-hotstar-db --user=postgres --database=hotstar_source

# Then run:
# SELECT COUNT(*) FROM hotstar_movies;
# SELECT * FROM hotstar_sync_log ORDER BY started_at DESC LIMIT 5;
```

---

## 💰 Cost Estimation

### Monthly Costs (Approximate)

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| **Cloud SQL** (db-f1-micro) | Always-on | ~$15 |
| **Cloud SQL Storage** (10GB SSD) | 10GB | ~$2 |
| **Cloud Run Jobs** (Daily Sync) | 30 runs × 10 sec | <$0.01 |
| **Cloud Run Jobs** (Initial) | 1 run × 2 min | <$0.01 |
| **Cloud Scheduler** | 1 job × 30 days | <$0.10 |
| **Artifact Registry** | 500MB image | <$0.01 |
| **Secret Manager** | 2 secrets | <$0.01 |
| **Egress** (API calls) | ~52 requests/month | Free |
| **TOTAL** | | **~$17/month** |

### Cost Optimization Options

1. **Use db-g1-small** ($25/month) for better performance
2. **Enable auto-pause** for Cloud SQL (only pay when active)
3. **Use Spot instances** for Cloud Run Jobs (not recommended for critical jobs)

---

## 🔍 Monitoring & Alerts

### View Logs

```bash
# All Cloud Run Job logs
gcloud logging read "resource.type=cloud_run_job" \
  --limit=100 \
  --format=json

# Daily sync logs only
gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=sync-hotstar-daily" \
  --limit=50

# Errors only
gcloud logging read "resource.type=cloud_run_job AND severity>=ERROR" \
  --limit=50
```

### Set Up Alerts

```bash
# Create alert for failed jobs
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Hotstar Sync Failed" \
  --condition-display-name="Job Execution Failed" \
  --condition-threshold-value=1 \
  --condition-threshold-duration=60s \
  --condition-filter='resource.type="cloud_run_job" AND metric.type="run.googleapis.com/job/completed_execution_count" AND metric.labels.result="failed"'
```

---

## 🔧 Maintenance

### Update Docker Image

```bash
# Make changes to scripts
# Then rebuild and push

docker build -f Dockerfile.hotstar -t hotstar-ingestion:latest .
docker tag hotstar-ingestion:latest \
  $REGION-docker.pkg.dev/$PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest
docker push $REGION-docker.pkg.dev/$PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest

# Update Cloud Run Jobs (they'll use new image on next run)
gcloud run jobs update sync-hotstar-daily \
  --image=$REGION-docker.pkg.dev/$PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest \
  --region=$REGION

gcloud run jobs update ingest-hotstar-initial \
  --image=$REGION-docker.pkg.dev/$PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest \
  --region=$REGION
```

### Manual Sync Trigger

```bash
# Trigger daily sync manually
gcloud run jobs execute sync-hotstar-daily \
  --region=$REGION \
  --wait

# View execution logs
gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=sync-hotstar-daily" \
  --limit=100 \
  --format="table(timestamp,textPayload)"
```

### Database Backup

```bash
# Cloud SQL automatically backs up daily
# To create on-demand backup:
gcloud sql backups create \
  --instance=tldrcontent-hotstar-db \
  --description="Manual backup before major update"

# List backups
gcloud sql backups list \
  --instance=tldrcontent-hotstar-db

# Restore from backup
gcloud sql backups restore BACKUP_ID \
  --backup-instance=tldrcontent-hotstar-db \
  --backup-id=BACKUP_ID
```

---

## 🐛 Troubleshooting

### Job Fails to Connect to Database

**Check:**
1. Cloud SQL instance is running
2. Cloud Run Job has `--set-cloudsql-instances` flag
3. Secrets are properly configured
4. Database exists (`hotstar_source`)

```bash
# Test connection
gcloud sql connect tldrcontent-hotstar-db --user=postgres

# Check Cloud Run Job configuration
gcloud run jobs describe sync-hotstar-daily --region=$REGION
```

### Job Times Out

**Solution:** Increase timeout

```bash
gcloud run jobs update sync-hotstar-daily \
  --task-timeout=30m \
  --region=$REGION
```

### Out of Memory

**Solution:** Increase memory

```bash
gcloud run jobs update sync-hotstar-daily \
  --memory=1Gi \
  --region=$REGION
```

### Scheduler Not Triggering

**Check:**
1. Scheduler job exists
2. Correct timezone set
3. IAM permissions correct

```bash
# List scheduler jobs
gcloud scheduler jobs list --location=$REGION

# Check last run
gcloud scheduler jobs describe sync-hotstar-daily-trigger --location=$REGION

# Manually trigger
gcloud scheduler jobs run sync-hotstar-daily-trigger --location=$REGION
```

---

## 📊 Database Access

### Connect from Local Machine

```bash
# Start Cloud SQL Proxy
./cloud_sql_proxy -instances=PROJECT_ID:REGION:tldrcontent-hotstar-db=tcp:5432 &

# Connect with psql
psql -h localhost -U postgres -d hotstar_source

# Or use environment variable
export PGPASSWORD="YOUR_PASSWORD"
psql -h localhost -U postgres -d hotstar_source -c "SELECT COUNT(*) FROM hotstar_movies;"
```

### Connect from Cloud Shell

```bash
# Direct connection (easiest)
gcloud sql connect tldrcontent-hotstar-db --user=postgres --database=hotstar_source
```

---

## 🎯 Quick Command Reference

```bash
# Deploy new version
docker build -f Dockerfile.hotstar -t hotstar-ingestion:latest .
docker tag hotstar-ingestion:latest $REGION-docker.pkg.dev/$PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest
docker push $REGION-docker.pkg.dev/$PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest
gcloud run jobs update sync-hotstar-daily --image=$REGION-docker.pkg.dev/$PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest --region=$REGION

# Trigger sync now
gcloud run jobs execute sync-hotstar-daily --region=$REGION --wait

# View logs
gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=sync-hotstar-daily" --limit=50

# Check database
gcloud sql connect tldrcontent-hotstar-db --user=postgres --database=hotstar_source

# List backups
gcloud sql backups list --instance=tldrcontent-hotstar-db

# Pause database (save costs)
gcloud sql instances patch tldrcontent-hotstar-db --activation-policy=NEVER

# Resume database
gcloud sql instances patch tldrcontent-hotstar-db --activation-policy=ALWAYS
```

---

## ✅ Deployment Checklist

- [ ] Google Cloud project created
- [ ] APIs enabled
- [ ] Cloud SQL instance created
- [ ] Database created (`hotstar_source`)
- [ ] Migrations run (3 tables created)
- [ ] Secrets stored in Secret Manager
- [ ] Docker image built and pushed
- [ ] Cloud Run Jobs created (initial + daily)
- [ ] Initial ingestion completed
- [ ] Cloud Scheduler configured
- [ ] First scheduled sync verified
- [ ] Monitoring/alerts set up
- [ ] Backup schedule verified

---

**Deployment Time:** ~30 minutes
**Monthly Cost:** ~$17
**Maintenance:** Fully automated

🎉 **Your Hotstar ingestion is now running in the cloud!**
