# Fibeger

A modern social networking and messaging platform built with Next.js, Prisma, and NextAuth.

## Features

- User authentication and authorization
- Friend requests and friend management
- Direct messaging (1-on-1 conversations)
- Group chats
- User profiles with avatars and bios
- Username history tracking
- Feed and social features

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (production) / SQLite (development)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Password Hashing**: bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (for production) or SQLite (for local development)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd fibeger
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the template env file
cp env.template .env

# Edit .env and add your values
```

Required environment variables:
- `DATABASE_URL`: Your database connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for local dev)

See [env.template](./env.template) for detailed configuration options and examples.

4. Set up the database:
```bash
# Run migrations
npx prisma migrate dev

# Or push the schema (for development)
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database

### Local Development (SQLite)
For local development, you can use SQLite:
```env
DATABASE_URL="file:./prisma/dev.db"
```

### Production (PostgreSQL)
For production deployment, use PostgreSQL:
```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

## Deployment

### 🚀 Deploying to Vercel

**Having database errors on Vercel?** → **[START_HERE_VERCEL.md](./START_HERE_VERCEL.md)** ← Start here!

**See all documentation**: [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)

#### Quick Deploy Steps:

1. **Set up PostgreSQL database** (choose one):
   - Vercel Postgres (easiest - auto-configures)
   - [Neon](https://neon.tech) (free tier available)
   - [Supabase](https://supabase.com) (free tier available)

2. **Add environment variables** in Vercel Dashboard → Settings → Environment Variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your Vercel app URL (e.g., `https://your-app.vercel.app`)

3. **Run database migrations** from your local terminal:
   ```bash
   # Set production DATABASE_URL
   export DATABASE_URL="your-production-database-url"  # macOS/Linux
   $env:DATABASE_URL="your-production-database-url"    # Windows PowerShell
   
   # Run migrations
   npx prisma migrate deploy
   ```

4. **Deploy** - Push to GitHub or click "Redeploy" in Vercel

5. **Test** - Visit `https://your-app.vercel.app/api/test-db` to verify database connection

#### 📚 Deployment Documentation:
- **Quick Fix**: [QUICK_FIX_VERCEL.md](./QUICK_FIX_VERCEL.md) - Fast troubleshooting guide
- **Complete Guide**: [VERCEL_DATABASE_SETUP.md](./VERCEL_DATABASE_SETUP.md) - Detailed setup instructions
- **Summary**: [VERCEL_DEPLOYMENT_SUMMARY.md](./VERCEL_DEPLOYMENT_SUMMARY.md) - Overview and troubleshooting
- **Full Checklist**: [VERCEL_CHECKLIST.md](./VERCEL_CHECKLIST.md) - Step-by-step checklist
- **General Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md) - Comprehensive deployment guide

## Project Structure

```
fibeger/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── conversations/# Messaging endpoints
│   │   ├── friends/      # Friend management
│   │   ├── groupchats/   # Group chat endpoints
│   │   └── profile/      # User profile endpoints
│   ├── auth/             # Auth pages (login, signup)
│   ├── components/       # React components
│   ├── context/          # React context providers
│   ├── lib/              # Utility libraries
│   └── [pages]/          # App pages
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Accessibility

This project follows WCAG 2.1 Level AA guidelines. See [ACCESSIBILITY.md](./ACCESSIBILITY.md) and [WCAG_CHANGES.md](./WCAG_CHANGES.md) for more information.

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

[Your License Here]
