# ELSxGlobal: Supabase Production Deployment Guide

This folder contains the official, production-ready Supabase Docker Compose architecture. Follow these instructions to deploy your in-house Supabase instance on your production Linux server.

## Prerequisites
- A Linux server (Ubuntu/Debian recommended) with at least 4GB RAM and 2 vCPUs.
- [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on the server.
- A domain name (e.g., `api.elsxglobal.com`) pointed to your server's IP address.

## Step 1: Transfer Files to Server
Upload this entire `supabase-production` folder to your Linux server (e.g., via SCP or Git).

```bash
scp -r ./supabase-production root@your_server_ip:/opt/supabase
```

## Step 2: Configure Secrets
SSH into your server and navigate to the directory:
```bash
cd /opt/supabase
```

Open the `.env` file and generate strong, random strings for the following critical security variables:
- `POSTGRES_PASSWORD`
- `JWT_SECRET` (Must be at least 32 characters!)
- `ANON_KEY` (Generate this at https://jwt.io/ using your `JWT_SECRET`)
- `SERVICE_ROLE_KEY` (Generate this at https://jwt.io/ using your `JWT_SECRET`)

You also need to update:
- `API_EXTERNAL_URL`: Set this to your production API URL (e.g., `https://api.elsxglobal.com`).
- `SITE_URL`: Set this to your frontend Next.js URL (e.g., `https://elsxglobal.com`).

## Step 3: Start the Supabase Stack
Pull the latest images and start the services in detached mode:
```bash
docker compose pull
docker compose up -d
```
Verify all containers are running successfully:
```bash
docker ps
```
You now have a fully functioning in-house Supabase instance! You can access the Supabase Studio dashboard at `http://your_server_ip:8000` (Make sure to restrict access to this port via a firewall or reverse proxy).

---

## Step 4: Apply Database Schema & Functions
Now that your production database is running, you need to push your ELSxGlobal schema and Edge Functions to it.

On your local development machine (where the Supabase CLI is installed), link to your new production server and push:

```bash
# Link to your new production database
npx supabase link --project-ref your_production_project_ref --password "YOUR_POSTGRES_PASSWORD"

# Apply all migrations from supabase/migrations/
npx supabase db push

# Deploy your edge functions (e.g. admin-auth)
npx supabase functions deploy
```

## Step 5: Update Frontend Environment
Finally, update your Next.js `.env` file (both locally and on your frontend hosting platform) to point to your new in-house database:

```env
NEXT_PUBLIC_SUPABASE_URL=https://api.elsxglobal.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_NEW_ANON_KEY
```

Redeploy your Next.js application, and you are 100% self-hosted!
