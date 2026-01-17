# Vercel Database Setup - SOLUTION

## The Problem
You're getting server errors on Vercel when creating users or logging in because:
1. The `DATABASE_URL` environment variable is not set in Vercel, OR
2. The database migrations haven't been run on your production database

## The Solution (Step-by-Step)

### Step 1: Set Up a PostgreSQL Database

Choose ONE option:

#### Option A: Vercel Postgres (Easiest - Recommended)
1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project
3. Click on "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Follow the prompts to create the database
7. **Vercel will automatically add the `DATABASE_URL` to your environment variables!**

#### Option B: Neon (Free Tier Available)
1. Go to https://neon.tech
2. Sign up / Log in
3. Create a new project
4. Copy the connection string (it looks like: `postgresql://user:password@host.region.neon.tech/dbname`)
5. Go to your Vercel project settings → Environment Variables
6. Add `DATABASE_URL` with the connection string

#### Option C: Supabase (Free Tier Available)
1. Go to https://supabase.com
2. Sign up / Log in
3. Create a new project
4. Go to Settings → Database
5. Copy the "Connection string" (choose "Connection pooling" for serverless)
6. Go to your Vercel project settings → Environment Variables
7. Add `DATABASE_URL` with the connection string

### Step 2: Set Required Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

1. **DATABASE_URL** (if not already added by Vercel Postgres)
   ```
   postgresql://user:password@host:5432/database?sslmode=require
   ```
   - Add this for: Production, Preview, and Development

2. **NEXTAUTH_SECRET** (Required for authentication)
   ```bash
   # Generate a secret on your local machine:
   openssl rand -base64 32
   ```
   - Copy the output and add it to Vercel
   - Add this for: Production, Preview, and Development

3. **NEXTAUTH_URL** (Required for authentication)
   ```
   https://your-app-name.vercel.app
   ```
   - Replace `your-app-name` with your actual Vercel app URL
   - Add this for: Production only
   - For Preview, you can leave it blank or use the preview URL format

### Step 3: Run Database Migrations

You MUST run migrations on your production database. Choose ONE method:

#### Method A: From Your Local Machine (Easiest)

1. Open your terminal
2. Set the production DATABASE_URL temporarily:
   ```bash
   # On Windows (PowerShell):
   $env:DATABASE_URL="your-production-database-url"
   
   # On macOS/Linux:
   export DATABASE_URL="your-production-database-url"
   ```

3. Run the migration:
   ```bash
   cd fibeger
   npx prisma migrate deploy
   ```

4. You should see output like:
   ```
   ✔ Prisma Migrate applied the following migrations:
     20260116191823_init
     20260116193747_add_messaging
   ```

#### Method B: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Link your project:
   ```bash
   cd fibeger
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env.production
   ```

4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Step 4: Redeploy on Vercel

After setting environment variables and running migrations:

1. Go to your Vercel project dashboard
2. Click "Deployments" tab
3. Click the "..." menu on the latest deployment
4. Click "Redeploy"

OR simply push a new commit to your repository (if you have automatic deployments enabled).

### Step 5: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Try to sign up with a new account
3. Try to log in
4. Test other features (messages, friends, groups)

## Verifying Environment Variables Are Set

To check if your environment variables are set in Vercel:

1. Go to Vercel Dashboard → Your Project
2. Click Settings → Environment Variables
3. You should see:
   - ✅ DATABASE_URL (should be hidden for security)
   - ✅ NEXTAUTH_SECRET (should be hidden for security)
   - ✅ NEXTAUTH_URL

## Common Issues & Solutions

### Issue 1: "PrismaClientInitializationError: Environment variable not found: DATABASE_URL"
**Solution**: The DATABASE_URL is not set in Vercel. Go to Settings → Environment Variables and add it.

### Issue 2: "Error querying the database: table does not exist"
**Solution**: You haven't run migrations. Follow Step 3 above.

### Issue 3: "Connection timeout"
**Solution**: 
- Add `?connection_limit=1` to your DATABASE_URL
- Example: `postgresql://user:pass@host/db?connection_limit=1&pool_timeout=0`

### Issue 4: "NextAuth configuration error"
**Solution**: Make sure NEXTAUTH_SECRET is set. Generate one with `openssl rand -base64 32`

### Issue 5: Build succeeds but runtime errors
**Solution**: 
1. Check Vercel Function Logs (Project → Deployments → Click deployment → Runtime Logs)
2. Look for database connection errors
3. Verify DATABASE_URL is correct and database is accessible from Vercel

## Quick Verification Script

After deployment, you can verify your database connection by adding this test endpoint temporarily:

Create `fibeger/app/api/test-db/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    // Try to query the database
    const userCount = await prisma.user.count();
    return NextResponse.json({ 
      success: true, 
      message: "Database connected successfully",
      userCount 
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
```

Then visit `https://your-app.vercel.app/api/test-db` to check if the database is working.

## Database Connection String Examples

### Vercel Postgres
```
postgres://user:password@region-pooler.vercel.com:5432/verceldb?sslmode=require
```

### Neon
```
postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/dbname?sslmode=require
```

### Supabase
```
postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres?pgbouncer=true
```

## Need Help?

If you're still having issues:

1. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on your deployment
   - Check "Runtime Logs" and "Build Logs"

2. **Check Environment Variables**:
   - Verify DATABASE_URL is set for Production
   - Verify NEXTAUTH_SECRET is set
   - Verify NEXTAUTH_URL matches your deployment URL

3. **Test Database Connection**:
   - Use a database client (like Prisma Studio or pgAdmin)
   - Try connecting with your DATABASE_URL from your local machine
   - If it fails, the problem is with the database setup

4. **Common Vercel-specific issues**:
   - Make sure your database allows connections from Vercel's IP ranges
   - Most managed PostgreSQL services (Neon, Supabase, Vercel Postgres) allow all connections by default
   - If using a custom database, check firewall rules

---

**Status**: Follow these steps and your database should work on Vercel!
**Last Updated**: January 16, 2026
