# 🎯 START HERE - Vercel Database Fix

## 🔴 The Problem
You're getting server errors on Vercel when trying to create users or login.

## ✅ The Solution
Your database isn't configured on Vercel. Follow these 3 simple steps:

---

## Step 1: Create PostgreSQL Database (5 minutes)

### Easiest Option - Vercel Postgres:
1. Go to https://vercel.com/dashboard
2. Click on your project
3. Click "Storage" tab
4. Click "Create Database" → Select "Postgres"
5. ✅ Done! DATABASE_URL is automatically added

### Alternative - Neon (Free):
1. Sign up at https://neon.tech
2. Create a project
3. Copy the connection string
4. Continue to Step 2

---

## Step 2: Add Environment Variables (2 minutes)

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these 3 variables:

### 1. DATABASE_URL
- **Value**: Your PostgreSQL connection string from Step 1
- **Set for**: Production, Preview, Development
- **Example**: `postgresql://user:pass@host:5432/db`

### 2. NEXTAUTH_SECRET
- **Generate with**: `openssl rand -base64 32`
- **Set for**: Production, Preview, Development
- **Example**: `dGhpc2lzYXJhbmRvbXNlY3JldGtleQ==`

### 3. NEXTAUTH_URL
- **Value**: Your Vercel app URL
- **Set for**: Production only
- **Example**: `https://your-app-name.vercel.app`

---

## Step 3: Run Database Migrations (2 minutes)

Open your terminal and run:

```bash
# Windows PowerShell:
cd fibeger
$env:DATABASE_URL="your-production-database-url-from-vercel"
npx prisma migrate deploy

# macOS/Linux:
cd fibeger
export DATABASE_URL="your-production-database-url-from-vercel"
npx prisma migrate deploy
```

You should see:
```
✔ Prisma Migrate applied the following migrations:
  20260116191823_init
  20260116193747_add_messaging
```

---

## Step 4: Redeploy & Test (1 minute)

1. **Redeploy**: Vercel Dashboard → Deployments → Click "Redeploy"
2. **Test**: Visit `https://your-app.vercel.app/api/test-db`
   - Should show: ✅ Database connected successfully!
3. **Try signup/login** - Should work now!

---

## ✅ Done!

Your database should now work on Vercel. If you still have issues, see the detailed guides below.

---

## 📚 Need More Help?

- **Quick troubleshooting**: [QUICK_FIX_VERCEL.md](./QUICK_FIX_VERCEL.md)
- **Detailed setup guide**: [VERCEL_DATABASE_SETUP.md](./VERCEL_DATABASE_SETUP.md)
- **Complete overview**: [VERCEL_DEPLOYMENT_SUMMARY.md](./VERCEL_DEPLOYMENT_SUMMARY.md)
- **Printable checklist**: [VERCEL_SETUP_CHECKLIST.txt](./VERCEL_SETUP_CHECKLIST.txt)

---

## 🐛 Common Errors

| Error | Solution |
|-------|----------|
| "Environment variable not found: DATABASE_URL" | DATABASE_URL not set in Vercel (Step 2) |
| "relation 'User' does not exist" | Migrations not run (Step 3) |
| "Connection timeout" | Add `?connection_limit=1` to DATABASE_URL |
| "NEXTAUTH_SECRET is not set" | Generate and add to Vercel (Step 2) |

---

**Total Time**: ~10 minutes  
**Difficulty**: Easy  
**Status**: Your app is ready - just needs database configuration!
