# 🚀 Quick Start Commands

## Initial Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Generate Prisma Client
npm run db:generate

# 4. Run database migrations
npm run db:migrate

# 5. Create admin user
npm run db:seed

# 6. Start development server
npm run dev
```

## Default Admin Credentials
```
Email: admin@test.com
Password: admin123
```
⚠️ **Change immediately after first login!**

## Development Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run db:studio    # Open Prisma Studio
npm run lint         # Run linter
```

## Database Commands
```bash
npx prisma generate              # Generate Prisma Client
npx prisma migrate dev          # Create & apply migration
npx prisma migrate reset        # Reset database
npx prisma db push              # Push schema without migration
npx prisma db pull              # Pull schema from database
npx prisma studio               # Open database GUI
```

## Common Tasks

### Create New Migration
```bash
npx prisma migrate dev --name description_here
```

### Reset Database (Development Only)
```bash
npx prisma migrate reset
npm run db:seed
```

### Hash a Password
```bash
node -e "console.log(require('bcryptjs').hashSync('password', 10))"
```

### Generate Secret Key
```bash
openssl rand -base64 32
```

## Vercel Deployment
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. After deployment, run migration
npx prisma migrate deploy
```

## Environment Variables Checklist
```
✅ DATABASE_URL
✅ NEXTAUTH_URL
✅ NEXTAUTH_SECRET
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
```

## Testing Flow

### 1. Admin Workflow
```
→ Login as admin@test.com
→ Go to /admin/landlords
→ Create landlord (e.g., landlord@test.com / pass123)
```

### 2. Landlord Workflow
```
→ Login as landlord
→ Go to /landlord/rooms
→ Create room (e.g., Room 101, ₱5000 rent, ₱500 WiFi, ₱12/kWh)
→ Go to /landlord/tenants
→ Create tenant (e.g., tenant@test.com / pass123)
→ Go to /landlord/meter-readings
→ Record reading (upload any image, enter 100 kWh)
→ Check that billing was auto-generated
```

### 3. Tenant Workflow
```
→ Login as tenant
→ Go to /tenant/billing
→ View bill details
→ Upload payment proof (use any receipt image)
→ Select payment method
```

### 4. Verify Payment
```
→ Login back as landlord
→ Go to /landlord/billing
→ Click "View Receipt" to see uploaded proof
→ Click "Verify Payment"
→ Status changes to VERIFIED
```

## Troubleshooting

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Regenerate Prisma Client
npx prisma generate

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues
```bash
# Test connection
npx prisma db pull

# Check .env file
cat .env | grep DATABASE_URL
```

### TypeScript Errors
```bash
# Regenerate types
npx prisma generate

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

## File Structure Quick Reference
```
app/
├── actions/         → Server Actions (all business logic)
├── admin/          → Admin pages
├── landlord/       → Landlord pages
├── tenant/         → Tenant pages
├── auth/           → Authentication pages
└── api/auth/       → NextAuth API

components/         → React components
lib/               → Utilities (auth, prisma, storage)
prisma/            → Database schema
scripts/           → Helper scripts
```

## Useful URLs (Development)
```
App:            http://localhost:3000
Prisma Studio:  npx prisma studio (opens browser)
Sign In:        http://localhost:3000/auth/signin
Admin:          http://localhost:3000/admin
Landlord:       http://localhost:3000/landlord
Tenant:         http://localhost:3000/tenant
```

## Git Commands
```bash
# Initial commit
git init
git add .
git commit -m "Initial commit: BH Management System"

# Push to GitHub
git remote add origin <your-repo-url>
git push -u origin main
```

## Support Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)

## Quick Tips
💡 Use Prisma Studio for quick database inspection
💡 Check Vercel Function logs for serverless debugging
💡 Keep Supabase Storage buckets public for images
💡 Use Neon or Supabase for PostgreSQL (free tier)
💡 Set DATABASE_URL with connection pooler for production
💡 Always test locally before deploying

## Need Help?
📖 Check README.md for comprehensive documentation
🔍 See API_REFERENCE.md for Server Actions details
🚀 Read VERCEL_DEPLOYMENT.md for deployment guide
📋 Review PROJECT_SUMMARY.md for architecture overview
