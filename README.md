# DuckDB Google Analytics App

An application for analyzing Google Analytics 4 data using DuckDB.

## Deployment Guide

### 1. Prerequisites

#### Cloudflare R2 Setup

1. Enable R2 in Cloudflare Dashboard
   - Log in to Cloudflare Dashboard
   - Select "R2" from the left sidebar
   - Click "Enable R2" or "Get started"
   - Choose a plan (available from Free tier)

2. Create R2 Buckets
   ```bash
   # Create production bucket
   wrangler r2 bucket create ga-data

   # Create preview bucket
   wrangler r2 bucket create ga-data-preview
   ```

3. Set Environment Variables (Secrets)
   ```bash
   # R2 configuration
   wrangler secret put R2_BUCKET_NAME
   wrangler secret put R2_ENDPOINT
   wrangler secret put R2_ACCESS_KEY_ID
   wrangler secret put R2_SECRET_ACCESS_KEY
   ```

### 2. Deploy Backend

```bash
$ cd backend
$ npm install
$ npx wrangler deploy
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

TODO: Add application architecture diagram 
