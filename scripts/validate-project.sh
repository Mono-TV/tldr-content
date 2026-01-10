#!/bin/bash

# TLDR Content - Project Validation Script
# This script ensures all deployments are confined to the correct GCP and Firebase projects

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project boundaries - DO NOT MODIFY
ALLOWED_GCP_PROJECT_ID="tldr-music"
ALLOWED_GCP_PROJECT_NUMBER="401132033262"
ALLOWED_FIREBASE_PROJECT_ID="content-lumiolabs-internal"
ALLOWED_FIREBASE_PROJECT_NUMBER="865621748276"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TLDR Content - Project Validation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check GCP project
check_gcp_project() {
  echo -e "${YELLOW}Checking GCP project configuration...${NC}"

  # Check if gcloud is installed
  if ! command -v gcloud &> /dev/null; then
    echo -e "${YELLOW}⚠️  gcloud CLI not found. Skipping GCP validation.${NC}"
    return 0
  fi

  # Get current project
  CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "none")

  if [ "$CURRENT_PROJECT" = "none" ] || [ -z "$CURRENT_PROJECT" ]; then
    echo -e "${YELLOW}⚠️  No GCP project configured. Run: gcloud config set project $ALLOWED_GCP_PROJECT_ID${NC}"
    return 1
  fi

  echo "  Current GCP Project: $CURRENT_PROJECT"
  echo "  Expected Project: $ALLOWED_GCP_PROJECT_ID"

  if [ "$CURRENT_PROJECT" != "$ALLOWED_GCP_PROJECT_ID" ]; then
    echo -e "${RED}❌ ERROR: Wrong GCP project!${NC}"
    echo -e "${RED}This repository MUST use: $ALLOWED_GCP_PROJECT_ID${NC}"
    echo -e "${RED}You are currently using: $CURRENT_PROJECT${NC}"
    echo ""
    echo -e "${YELLOW}To fix this, run:${NC}"
    echo "  gcloud config set project $ALLOWED_GCP_PROJECT_ID"
    return 1
  fi

  # Validate project number
  CURRENT_PROJECT_NUMBER=$(gcloud projects describe "$CURRENT_PROJECT" --format='value(projectNumber)' 2>/dev/null || echo "unknown")

  if [ "$CURRENT_PROJECT_NUMBER" != "$ALLOWED_GCP_PROJECT_NUMBER" ]; then
    echo -e "${RED}❌ ERROR: GCP project number mismatch!${NC}"
    echo -e "${RED}Expected: $ALLOWED_GCP_PROJECT_NUMBER${NC}"
    echo -e "${RED}Got: $CURRENT_PROJECT_NUMBER${NC}"
    return 1
  fi

  echo -e "${GREEN}✅ GCP project validated: $CURRENT_PROJECT ($CURRENT_PROJECT_NUMBER)${NC}"
  return 0
}

# Function to check Firebase configuration
check_firebase_config() {
  echo ""
  echo -e "${YELLOW}Checking Firebase configuration...${NC}"

  # Check .env.local file
  if [ -f "web/.env.local" ]; then
    FIREBASE_PROJECT_ID=$(grep "NEXT_PUBLIC_FIREBASE_PROJECT_ID" web/.env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "")

    if [ -z "$FIREBASE_PROJECT_ID" ]; then
      echo -e "${YELLOW}⚠️  NEXT_PUBLIC_FIREBASE_PROJECT_ID not found in web/.env.local${NC}"
      return 1
    fi

    echo "  Current Firebase Project: $FIREBASE_PROJECT_ID"
    echo "  Expected Project: $ALLOWED_FIREBASE_PROJECT_ID"

    if [ "$FIREBASE_PROJECT_ID" != "$ALLOWED_FIREBASE_PROJECT_ID" ]; then
      echo -e "${RED}❌ ERROR: Wrong Firebase project in .env.local!${NC}"
      echo -e "${RED}Expected: $ALLOWED_FIREBASE_PROJECT_ID${NC}"
      echo -e "${RED}Got: $FIREBASE_PROJECT_ID${NC}"
      echo ""
      echo -e "${YELLOW}To fix this, update web/.env.local with:${NC}"
      echo "  NEXT_PUBLIC_FIREBASE_PROJECT_ID=$ALLOWED_FIREBASE_PROJECT_ID"
      return 1
    fi

    echo -e "${GREEN}✅ Firebase project validated: $FIREBASE_PROJECT_ID${NC}"
  else
    echo -e "${YELLOW}⚠️  web/.env.local not found. Skipping Firebase validation.${NC}"
    return 0
  fi

  return 0
}

# Function to check project config file
check_project_config() {
  echo ""
  echo -e "${YELLOW}Checking project configuration file...${NC}"

  if [ ! -f ".project-config.json" ]; then
    echo -e "${YELLOW}⚠️  .project-config.json not found${NC}"
    return 1
  fi

  # Validate GCP project in config
  CONFIG_GCP_PROJECT=$(grep -o '"projectId": "[^"]*"' .project-config.json | head -1 | cut -d '"' -f4)
  CONFIG_FIREBASE_PROJECT=$(grep -o '"projectId": "[^"]*"' .project-config.json | tail -1 | cut -d '"' -f4)

  echo "  GCP Project in config: $CONFIG_GCP_PROJECT"
  echo "  Firebase Project in config: $CONFIG_FIREBASE_PROJECT"

  ERRORS=0

  if [ "$CONFIG_GCP_PROJECT" != "$ALLOWED_GCP_PROJECT_ID" ]; then
    echo -e "${RED}❌ ERROR: Wrong GCP project in .project-config.json!${NC}"
    ERRORS=$((ERRORS + 1))
  fi

  if [ "$CONFIG_FIREBASE_PROJECT" != "$ALLOWED_FIREBASE_PROJECT_ID" ]; then
    echo -e "${RED}❌ ERROR: Wrong Firebase project in .project-config.json!${NC}"
    ERRORS=$((ERRORS + 1))
  fi

  if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Project configuration file validated${NC}"
    return 0
  fi

  return 1
}

# Run all checks
VALIDATION_FAILED=0

check_gcp_project || VALIDATION_FAILED=1
check_firebase_config || VALIDATION_FAILED=1
check_project_config || VALIDATION_FAILED=1

echo ""
echo -e "${BLUE}========================================${NC}"

if [ $VALIDATION_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All validations passed!${NC}"
  echo -e "${GREEN}This repository is correctly configured for:${NC}"
  echo -e "  ${GREEN}• GCP Project: $ALLOWED_GCP_PROJECT_ID ($ALLOWED_GCP_PROJECT_NUMBER)${NC}"
  echo -e "  ${GREEN}• Firebase Project: $ALLOWED_FIREBASE_PROJECT_ID${NC}"
  echo -e "${BLUE}========================================${NC}"
  exit 0
else
  echo -e "${RED}❌ Validation failed!${NC}"
  echo -e "${RED}Please fix the errors above before deploying.${NC}"
  echo -e "${BLUE}========================================${NC}"
  exit 1
fi
