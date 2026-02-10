# Google OAuth Setup Guide

## Overview
The system now uses Google Sign-In (OAuth 2.0) with a whitelist-based approach. No passwords needed!

## How It Works
1. **Admin** whitelists landlords by email
2. **Landlords** whitelist tenants by email
3. Users sign in with their **Google accounts**
4. **Inactive accounts** are blocked from logging in
5. All data is **archived** (never deleted)

## Setup Steps

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: **Web application**
   - Name: "BH Management"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production URL (e.g., `https://yourdomain.com`)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
   - Click "Create"

5. Copy the **Client ID** and **Client Secret**

### 2. Update Environment Variables

Edit your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-actual-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-actual-client-secret"
```

### 3. Update Database Schema

Run these commands:

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Seed admin user (update email in seed.ts first!)
npm run db:seed
```

**Important:** Before seeding, edit `prisma/seed.ts` and replace `admin@gmail.com` with your actual Google email address!

### 4. Test the System

1. Start the dev server: `npm run dev`
2. Go to `http://localhost:3000/auth/signin`
3. Click "Sign in with Google"
4. Sign in with the email you used in the seed file
5. You should be redirected to the admin dashboard

## User Management Flow

### Admin Creates Landlords
1. Admin logs in
2. Goes to "Landlords" page
3. Enters landlord's name and **Google email**
4. Landlord is now **whitelisted**
5. Landlord can sign in with Google

### Landlord Creates Tenants
1. Landlord logs in
2. Goes to "Tenants" page
3. Enters tenant's name and **Google email**
4. Tenant is now **whitelisted** and **active**
5. Tenant can sign in with Google

### Deactivating Tenants (Moving Out)
1. Landlord clicks "Deactivate" on tenant
2. Tenant is marked as **inactive**
3. Tenant is removed from their room
4. All tenant data is **preserved** (billing history, etc.)
5. Tenant **cannot log in** until reactivated

### Reactivating Tenants (Moving Back In)
When creating a tenant with an existing (inactive) email:
- System automatically reactivates them
- Assigns them to the new room
- They can log in again

## Security Features

✅ **Whitelist-only access** - Users must be added by admin/landlord
✅ **Active/Inactive status** - Inactive users cannot log in
✅ **Data archiving** - All data preserved for record-keeping
✅ **Google OAuth security** - No password management needed
✅ **Role-based access** - Admin, Landlord, and Tenant permissions

## Error Messages

- **"Not Whitelisted"**: Email not added to system. Contact admin/landlord.
- **"Account Inactive"**: Account deactivated. Contact landlord to reactivate.

## Production Deployment

When deploying to production:

1. Update `.env` with production Google OAuth credentials
2. Update authorized redirect URI in Google Cloud Console
3. Set `NEXTAUTH_URL` to your production domain:
   ```env
   NEXTAUTH_URL="https://yourdomain.com"
   ```
4. Deploy and test sign-in flow

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Check that your redirect URI in Google Cloud Console matches exactly
- Format: `http://localhost:3000/api/auth/callback/google`

### "Not Whitelisted" error
- Make sure user email is added to database
- Check that email matches Google account exactly

### "Account Inactive" error
- User was deactivated by landlord
- Landlord needs to reactivate or create new tenant entry

## Migration Notes

- Old password-based accounts need to be re-created
- All users must have Google accounts
- Update seed.ts with admin's Google email before first run
