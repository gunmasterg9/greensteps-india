#!/bin/bash

# GreenSteps India - Manual Google Cloud Run Deployment Script
# This helper script automates building and deploying using Google Cloud Build.

# Check if Project ID is passed as argument
if [ -z "$1" ]; then
    echo "❌ Usage: ./deploy.sh <GCP_PROJECT_ID>"
    exit 1
fi

PROJECT_ID=$1
REGION="asia-south1" # Default region (Mumbai)

echo "🟢 Setting GCP Project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

echo "📦 Enabling required Google APIs (Cloud Build, Cloud Run, Artifact Registry)..."
gcloud services enable \
    runs.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com

echo "🛠️ 1. Building and Deploying Backend Service to Cloud Run..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/greensteps-api ./backend

gcloud run deploy greensteps-api \
    --image gcr.io/$PROJECT_ID/greensteps-api \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production,PORT=5000,JWT_SECRET=productionsecretkeychangeinprod"

# Get backend service URL
BACKEND_URL=$(gcloud run services describe greensteps-api --region $REGION --format='value(status.url)')
echo "✅ Backend Service deployed successfully! URL: $BACKEND_URL"

echo "🛠️ 2. Building and Deploying Frontend Web Service..."
# Build arg sets the VITE_API_URL dynamically for Vite compilation inside Cloud Build
gcloud builds submit \
    --config=cloudbuild-frontend.yaml \
    --substitutions=_API_URL="$BACKEND_URL/api/v1" \
    ./frontend

echo "✅ Frontend Web Server deployed! View service list using: gcloud run services list"
