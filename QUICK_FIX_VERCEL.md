# 🚀 Quick Fix for Vercel Database Errors

## ⚡ TL;DR - Do These 3 Things Now

### 1️⃣ Set Up PostgreSQL Database (Choose ONE)

**Easiest Option - Vercel Postgres:**
- Go to https://vercel.com/dashboard
- Select your project → Storage → Create Database → Postgres
- ✅ Done! DATABASE_URL is automatically added

**OR use Neon (Free):**
- Sign up at https://neon.tech
- Create project → Copy connection string
- Add to Vercel environment variables

### 2️⃣ Add Environment Variables to Vercel

Go to your Vercel project → Settings → Environment Variables:

```bash
# 1. DATABASE_URL (from step 1)
DATABASE_URL="postgresql://user:password@host:5432/database"

# 2. NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="generate-this-with-openssl-rand-base64-32"

# 3. NEXTAUTH_URL (your Vercel app URL)
NEXTAUTH_URL="https://your-app-name.vercel.app"
```

**Make sure to set each for: Production, Preview, and Development**

### 3️⃣ Run Database Migrations

Open your terminal:

```bash
# Set your production DATABASE_URL (copy from Vercel)
# Windows PowerShell:
$env:DATABASE_URL="your-production-database-url"

# macOS/Linux:
export DATABASE_URL="your-production-database-url"

# Navigate to your project
cd fibeger

# Run migrations
npx prisma migrate deploy
```

### 4️⃣ Redeploy

- Go to Vercel Dashboard → Deployments → Redeploy
- OR push a new commit to trigger deployment

### 5️⃣ Test

Visit your app at `https://your-app-name.vercel.app` and try:
- ✅ Sign up
- ✅ Log in
- ✅ Send a message

---

## 📋 Checklist

- [ ] PostgreSQL database created
- [ ] DATABASE_URL added to Vercel
- [ ] NEXTAUTH_SECRET added to Vercel
- [ ] NEXTAUTH_URL added to Vercel
- [ ] Migrations run with `npx prisma migrate deploy`
- [ ] Redeployed on Vercel
- [ ] Tested signup and login

## 🐛 Still Not Working?

### Error: "Environment variable not found: DATABASE_URL"
→ DATABASE_URL not set in Vercel environment variables

### Error: "relation/table does not exist"
→ You didn't run migrations (step 3)

### Error: "Connection timeout"
→ Add `?connection_limit=1` to end of DATABASE_URL

### Error: "NEXTAUTH_SECRET"
→ Generate with: `openssl rand -base64 32` and add to Vercel

---

## 💡 Pro Tips

1. **Use Vercel Postgres** - It's the easiest option and integrates automatically
2. **Connection Pooling** - Add these to your DATABASE_URL for better performance:
   ```
   ?connection_limit=1&pool_timeout=0
   ```
3. **Check Logs** - Vercel Dashboard → Deployments → Click deployment → Runtime Logs

---

**Need detailed instructions?** See [VERCEL_DATABASE_SETUP.md](./VERCEL_DATABASE_SETUP.md)
