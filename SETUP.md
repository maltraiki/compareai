# Vercel Postgres Setup Guide

## Steps to Setup Database:

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click on "Storage" tab

2. **Create Postgres Database**
   - Click "Browse Marketplace" or "Create Database"
   - Select **Postgres** from the marketplace
   - Choose the free tier (Hobby)
   - Select your region (closest to your users)
   - Click "Create"

3. **Get Connection String**
   - Once created, click on your Postgres database
   - Go to **".env.local"** tab
   - You'll see several connection strings:
     - `POSTGRES_URL` (standard connection)
     - `POSTGRES_PRISMA_URL` (for Prisma - USE THIS ONE!)
     - `POSTGRES_URL_NON_POOLING` (direct connection)

4. **Add to Vercel Environment Variables**
   - Go to **Settings → Environment Variables**
   - Add new variable:
     - Name: `DATABASE_URL`
     - Value: [Copy the `POSTGRES_PRISMA_URL` value]
   - Make sure your `GEMINI_API_KEY` is also set

5. **Deploy**
   - Push your code to deploy
   - Vercel will automatically use the environment variables

## Important Notes:
- Use `POSTGRES_PRISMA_URL` for Prisma ORM (not `POSTGRES_URL`)
- The free tier includes:
  - 60 seconds compute time per month
  - 256MB storage
  - Perfect for small projects

## Local Development:
For local testing, you can use the same Vercel Postgres by copying the connection string to your local `.env` file, or use a local PostgreSQL instance.