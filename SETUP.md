# 🚀 Quick Setup Guide

Follow these steps to get your BH Management System up and running.

## Step 1: Database Setup

### Option A: Using Neon (Recommended for Vercel)

1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Paste it as `DATABASE_URL` in `.env`

### Option B: Using Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings → Database
4. Copy the connection string (transaction pooler)
5. Paste it as `DATABASE_URL` in `.env`

### Option C: Local PostgreSQL

```bash
# Install PostgreSQL
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql

# Create database
createdb bh_management

# Your DATABASE_URL will be:
DATABASE_URL="postgresql://postgres:password@localhost:5432/bh_management"
```

## Step 2: Supabase Storage Setup

1. Go to [supabase.com](https://supabase.com)
2. Create a project (can be same as database project)
3. Go to Storage section
4. Create two buckets:
   - `meter-photos`
   - `payment-receipts`
5. For each bucket:
   - Click bucket → Settings
   - Set "Public bucket" ON
   - Save

6. Get credentials:
   - Go to Project Settings → API
   - Copy:
     - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL="your-database-url-here"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## Step 4: Install and Run

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

## Step 5: Create Admin User

Open Prisma Studio:

```bash
npx prisma studio
```

Or run SQL directly:

```sql
INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Admin',
  'admin@test.com',
  '$2a$10$XaL.Zqk3H1Ovy9K0rZ8TfOvXqJqp3K2L0c5VmLZYVqL7F5fZf5vFK',
  'ADMIN',
  NOW(),
  NOW()
);
```

**Login credentials**: 
- Email: `admin@test.com`
- Password: `admin123`

⚠️ **IMPORTANT**: Change these credentials immediately after first login!

## Step 6: Test the System

1. **Login as Admin**
   - Go to http://localhost:3000
   - Login with admin credentials
   - Create a landlord account

2. **Login as Landlord**
   - Logout and login with landlord credentials
   - Create a room with pricing
   - Create a tenant and assign to room
   - Record a meter reading (use any test image)
   - Check that billing was auto-generated

3. **Login as Tenant**
   - Logout and login with tenant credentials
   - View billing
   - Upload a payment proof (use any receipt image)

4. **Verify Payment (as Landlord)**
   - Login back as landlord
   - Go to Billing
   - Verify the payment

## 🎉 You're Done!

Your system is now fully functional.

## Production Deployment (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables (same as `.env`)
5. Deploy
6. Run migration:
   ```bash
   npx prisma migrate deploy
   ```
7. Access your live app!

## Need Help?

Check the main [README.md](./README.md) for detailed documentation.
