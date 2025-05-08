# DuckDB Google Analytics App

An application for analyzing Google Analytics 4 data using DuckDB.

## Deployment Guide

### 1. Prerequisites

#### Google Cloud Setup

1. Install Google Cloud CLI
   ```bash
   # For macOS (using Homebrew)
   brew install google-cloud-sdk
   ```

2. Initialize Google Cloud environment
   ```bash
   # Login to Google Cloud
   gcloud auth login

   # Set project
   gcloud config set project YOUR_PROJECT_ID
   ```

3. Enable required APIs
   ```bash
   gcloud services enable cloudfunctions.googleapis.com \
                        cloudscheduler.googleapis.com \
                        storage.googleapis.com
   ```

4. Create Cloud Storage bucket

   ```bash
   # Create production bucket in Tokyo region
   gcloud storage buckets create gs://YOUR_PROJECT_ID-ga-data --location=asia-northeast1
   ```

5. Set environment variables
   ```bash
   # For local development
   export BUCKET_NAME=your-project-id-ga-data

   # For Cloud Functions deployment
   gcloud functions deploy ga-data-function \
     --gen2 \
     --runtime=nodejs20 \
     --region=asia-northeast1 \
     --source=. \
     --entry-point=gaDataFunction \
     --trigger-http \
     --set-env-vars BUCKET_NAME=your-project-id-ga-data
   ```

6. Create and configure service account
   ```bash
   # Create service account for Cloud Functions
   gcloud iam service-accounts create ga-data-function --display-name="GA Data Function Service Account"

   # Grant necessary permissions
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:ga-data-function@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/storage.objectViewer"

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:ga-data-function@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/storage.objectCreator"
   ```

7. Set up billing
   - Visit Google Cloud Console (https://console.cloud.google.com/billing)
   - Enable billing for your project
   - This is required for using Cloud Functions and Cloud Scheduler

### 2. Deploy Backend

```bash
$ cd backend
$ npm install
# TODO: Add Cloud Functions deployment steps
```

### 3. Deploy Frontend

```bash
$ cd frontend
$ npm install
$ npm run build
# TODO: Add frontend deployment steps
```

## Development Setup

TODO: Add development environment setup instructions

## Application Architecture

TODO: Add application architecture diagram and explain the following components:
- Cloud Functions (Backend)
- Cloud Storage (Data storage)
- Cloud Scheduler (Scheduled tasks)
- Frontend (React + DuckDB WASM)
