#!/bin/bash
# Automated deployment script for Hotstar ingestion to Google Cloud
# Usage: ./deploy-hotstar-cloud.sh [PROJECT_ID] [REGION]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}==>${NC} ${1}"
}

print_success() {
    echo -e "${GREEN}✓${NC} ${1}"
}

print_error() {
    echo -e "${RED}✗${NC} ${1}"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} ${1}"
}

# Check arguments
if [ -z "$1" ]; then
    print_error "Usage: ./deploy-hotstar-cloud.sh [PROJECT_ID] [REGION]"
    echo "Example: ./deploy-hotstar-cloud.sh my-project us-central1"
    exit 1
fi

PROJECT_ID=$1
REGION=${2:-us-central1}

print_step "Starting Hotstar Cloud Deployment"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Step 1: Set project
print_step "Setting GCP project..."
gcloud config set project $PROJECT_ID
print_success "Project set to $PROJECT_ID"

# Step 2: Enable APIs
print_step "Enabling required APIs (this may take a few minutes)..."
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  cloudscheduler.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  --quiet

print_success "APIs enabled"

# Step 3: Check if Cloud SQL instance exists
print_step "Checking for existing Cloud SQL instance..."
if gcloud sql instances describe tldrcontent-hotstar-db --quiet 2>/dev/null; then
    print_warning "Cloud SQL instance 'tldrcontent-hotstar-db' already exists. Skipping creation."
else
    print_step "Creating Cloud SQL instance (this will take 5-10 minutes)..."
    print_warning "This is the longest step - grab a coffee! ☕"

    gcloud sql instances create tldrcontent-hotstar-db \
      --database-version=POSTGRES_15 \
      --tier=db-f1-micro \
      --region=$REGION \
      --storage-type=SSD \
      --storage-size=10GB \
      --storage-auto-increase \
      --backup-start-time=03:00 \
      --maintenance-window-day=SUN \
      --maintenance-window-hour=4 \
      --quiet

    print_success "Cloud SQL instance created"

    # Set password
    print_step "Setting database password..."
    read -sp "Enter a secure password for PostgreSQL: " DB_PASSWORD
    echo ""
    gcloud sql users set-password postgres \
      --instance=tldrcontent-hotstar-db \
      --password="$DB_PASSWORD" \
      --quiet

    print_success "Password set"
fi

# Get connection name
INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe tldrcontent-hotstar-db --format='value(connectionName)')
print_success "Instance connection name: $INSTANCE_CONNECTION_NAME"

# Step 4: Create database if not exists
print_step "Creating database 'hotstar_source'..."
if gcloud sql databases describe hotstar_source --instance=tldrcontent-hotstar-db --quiet 2>/dev/null; then
    print_warning "Database 'hotstar_source' already exists. Skipping creation."
else
    gcloud sql databases create hotstar_source \
      --instance=tldrcontent-hotstar-db \
      --quiet
    print_success "Database created"
fi

# Step 5: Store secrets
print_step "Storing secrets in Secret Manager..."

# Database password
if [ -z "$DB_PASSWORD" ]; then
    read -sp "Enter PostgreSQL password: " DB_PASSWORD
    echo ""
fi

if gcloud secrets describe hotstar-db-password --quiet 2>/dev/null; then
    print_warning "Secret 'hotstar-db-password' already exists. Updating..."
    echo -n "$DB_PASSWORD" | gcloud secrets versions add hotstar-db-password --data-file=-
else
    echo -n "$DB_PASSWORD" | gcloud secrets create hotstar-db-password --data-file=-
fi
print_success "Database password stored"

# API secret
if gcloud secrets describe hotstar-api-secret --quiet 2>/dev/null; then
    print_warning "Secret 'hotstar-api-secret' already exists. Skipping."
else
    echo -n "7073910d5c5f50d16d50bfdfb0ebb156dd37bea138f341a8432c92e569881617" | \
      gcloud secrets create hotstar-api-secret --data-file=-
    print_success "API secret stored"
fi

# Grant access
print_step "Granting Cloud Run access to secrets..."
gcloud secrets add-iam-policy-binding hotstar-db-password \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet 2>/dev/null || true

gcloud secrets add-iam-policy-binding hotstar-api-secret \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet 2>/dev/null || true

print_success "IAM permissions granted"

# Step 6: Create Artifact Registry repository
print_step "Creating Artifact Registry repository..."
if gcloud artifacts repositories describe hotstar-ingestion --location=$REGION --quiet 2>/dev/null; then
    print_warning "Repository 'hotstar-ingestion' already exists. Skipping."
else
    gcloud artifacts repositories create hotstar-ingestion \
      --repository-format=docker \
      --location=$REGION \
      --description="Hotstar ingestion Docker images" \
      --quiet
    print_success "Artifact Registry repository created"
fi

# Step 7: Build and push Docker image
print_step "Building Docker image..."
gcloud auth configure-docker $REGION-docker.pkg.dev --quiet

docker build -f Dockerfile.hotstar -t hotstar-ingestion:latest .
print_success "Docker image built"

print_step "Pushing to Artifact Registry..."
docker tag hotstar-ingestion:latest \
  $REGION-docker.pkg.dev/$PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest

docker push $REGION-docker.pkg.dev/$PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest
print_success "Docker image pushed"

# Step 8: Create Cloud Run Jobs
print_step "Creating Cloud Run Job: sync-hotstar-daily..."
if gcloud run jobs describe sync-hotstar-daily --region=$REGION --quiet 2>/dev/null; then
    print_warning "Job 'sync-hotstar-daily' already exists. Updating..."
    gcloud run jobs update sync-hotstar-daily \
      --image=$REGION-docker.pkg.dev/$PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest \
      --region=$REGION \
      --quiet
else
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
      --args="scripts/sync-hotstar-daily.py" \
      --quiet
fi
print_success "Daily sync job created"

print_step "Creating Cloud Run Job: ingest-hotstar-initial..."
if gcloud run jobs describe ingest-hotstar-initial --region=$REGION --quiet 2>/dev/null; then
    print_warning "Job 'ingest-hotstar-initial' already exists. Updating..."
    gcloud run jobs update ingest-hotstar-initial \
      --image=$REGION-docker.pkg.dev/$PROJECT_ID/hotstar-ingestion/hotstar-ingestion:latest \
      --region=$REGION \
      --quiet
else
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
      --args="scripts/ingest-hotstar-movies.py" \
      --quiet
fi
print_success "Initial ingestion job created"

# Step 9: Set up Cloud Scheduler
print_step "Setting up Cloud Scheduler for daily sync..."
if gcloud scheduler jobs describe sync-hotstar-daily-trigger --location=$REGION --quiet 2>/dev/null; then
    print_warning "Scheduler job already exists. Updating..."
    gcloud scheduler jobs update http sync-hotstar-daily-trigger \
      --location=$REGION \
      --schedule="30 20 * * *" \
      --quiet
else
    gcloud scheduler jobs create http sync-hotstar-daily-trigger \
      --location=$REGION \
      --schedule="30 20 * * *" \
      --time-zone="UTC" \
      --uri="https://$REGION-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/$PROJECT_ID/jobs/sync-hotstar-daily:run" \
      --http-method=POST \
      --oauth-service-account-email=$PROJECT_ID@appspot.gserviceaccount.com \
      --quiet
fi
print_success "Cloud Scheduler configured (daily at 2 AM IST)"

# Summary
echo ""
echo "=================================================="
print_success "Hotstar Cloud Deployment Complete!"
echo "=================================================="
echo ""
echo "📊 Deployment Summary:"
echo "  • Cloud SQL Instance: tldrcontent-hotstar-db"
echo "  • Database: hotstar_source"
echo "  • Region: $REGION"
echo "  • Daily Sync: 2:00 AM IST (via Cloud Scheduler)"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Run migrations (one-time setup):"
echo "   gcloud sql connect tldrcontent-hotstar-db --user=postgres --database=hotstar_source"
echo "   Then paste migration SQL from migrations/*.sql files"
echo ""
echo "2. Run initial ingestion (~2 minutes):"
echo "   gcloud run jobs execute ingest-hotstar-initial --region=$REGION --wait"
echo ""
echo "3. Test daily sync:"
echo "   gcloud run jobs execute sync-hotstar-daily --region=$REGION --wait"
echo ""
echo "4. View logs:"
echo "   gcloud logging read \"resource.type=cloud_run_job\" --limit=50"
echo ""
echo "=================================================="
echo ""
