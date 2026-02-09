# 🏠 House/Room Rent Management System

A comprehensive boarding house and room rental management system built with Next.js, designed for landlords to manage properties, track electricity usage, and handle tenant billing with transparency and simplicity.

## ✨ Features

### 👤 Role-Based Access Control
- **Admin**: Create and manage landlord accounts
- **Landlord**: Manage rooms, tenants, meter readings, and billing
- **Tenant**: View billing details and submit payment proofs

### 🔑 Core Functionality
- ✅ Room management with flexible pricing (rent, WiFi, electricity rates)
- ✅ Monthly electricity meter reading with photo evidence
- ✅ Automatic billing generation based on meter readings
- ✅ Manual payment verification system (Cash/Online)
- ✅ Payment proof upload with receipt photos
- ✅ Transparent billing breakdowns
- ✅ Real-time dashboard with statistics

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon, Supabase, or local)
- Supabase account (for image storage)

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd bh-management
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL="your-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 3. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Optional: Open Prisma Studio
npx prisma studio
```

### 5. Supabase Storage Setup

Create two storage buckets in your Supabase project:
- `meter-photos` (for electricity meter readings)
- `payment-receipts` (for payment proofs)

Set bucket policies to public for read access.

### 6. Create Initial Admin User

Run this SQL in your database:

```sql
INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
  'admin-001',
  'System Admin',
  'admin@example.com',
  '$2a$10$YourHashedPasswordHere',
  'ADMIN',
  NOW(),
  NOW()
);
```

To hash a password, use:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Admin Workflow
1. Sign in with admin credentials
2. Navigate to "Landlords" section
3. Create landlord accounts with email/password

### Landlord Workflow
1. **Setup Rooms**
   - Go to "Rooms" → Create rooms with pricing details
   - Set monthly rent, WiFi fee, and electricity rate per kWh

2. **Add Tenants**
   - Go to "Tenants" → Create tenant accounts
   - Assign tenants to vacant rooms

3. **Record Meter Readings** (Monthly)
   - Go to "Meter Readings"
   - Select room and month
   - Upload meter photo and enter current reading
   - System auto-calculates usage and generates billing

4. **Verify Payments**
   - Go to "Billing"
   - Review uploaded payment proofs
   - Verify legitimate payments
   - Mark billing as VERIFIED

### Tenant Workflow
1. Sign in with tenant credentials
2. View dashboard for room details
3. Go to "My Billing" to see all bills
4. For pending bills:
   - Click "Upload Payment Proof"
   - Select payment method (Cash/Online)
   - Upload receipt photo
   - Submit for landlord verification

## 🗺️ Project Structure

```
bh-management/
├── app/
│   ├── actions/           # Server Actions
│   │   ├── billing-actions.ts
│   │   ├── meter-actions.ts
│   │   ├── payment-actions.ts
│   │   ├── room-actions.ts
│   │   ├── upload-actions.ts
│   │   └── user-actions.ts
│   ├── admin/             # Admin pages
│   ├── landlord/          # Landlord pages
│   ├── tenant/            # Tenant pages
│   ├── auth/              # Authentication pages
│   └── api/auth/          # NextAuth API route
├── components/            # Reusable components
├── lib/                   # Utilities
│   ├── auth.ts           # NextAuth config
│   ├── auth-utils.ts     # Auth helpers
│   ├── prisma.ts         # Prisma client
│   └── storage.ts        # Supabase storage
├── prisma/
│   └── schema.prisma     # Database schema
├── middleware.ts         # Route protection
└── types/                # TypeScript types
```

## 🔐 Security Features

- ✅ Role-based access control with middleware
- ✅ Server-side authorization checks
- ✅ Password hashing with bcryptjs
- ✅ JWT-based session management
- ✅ Protected API routes
- ✅ Environment variable security

## 🧮 Billing Calculation

```
Monthly Bill = Monthly Rent + WiFi Fee + Electricity Cost

Where:
- Electricity Cost = Usage (kWh) × Rate per kWh
- Usage = Current Reading - Previous Reading
```

## 📸 Image Storage

Images are stored in Supabase Storage:
- **Meter Photos**: Evidence of electricity readings
- **Payment Receipts**: Proof of payment submission

Only URLs are stored in the database for optimal performance.

## 🔄 Billing Flow

```
1. Landlord uploads meter photo + reading
   ↓
2. System calculates usage & cost
   ↓
3. Billing record auto-generated (PENDING)
   ↓
4. Tenant uploads payment proof
   ↓
5. Status changes to PAID
   ↓
6. Landlord verifies payment
   ↓
7. Status changes to VERIFIED ✅
```

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard.

### Database Migration in Production

```bash
npx prisma migrate deploy
```

## 🤝 Contributing

This is a capstone/portfolio project. Feel free to fork and customize for your needs.

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🐛 Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if PostgreSQL is running
- Ensure database exists

### Image Upload Issues
- Verify Supabase credentials
- Check bucket permissions (public read access)
- Ensure file size < 5MB

### Authentication Issues
- Regenerate NEXTAUTH_SECRET
- Clear browser cookies
- Check if user exists in database

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and Prisma**

