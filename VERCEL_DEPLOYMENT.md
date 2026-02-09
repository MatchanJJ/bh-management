# Vercel Deployment Configuration

## Environment Variables

Set these in your Vercel dashboard:

### Database
```
DATABASE_URL=your-neon-or-supabase-postgres-url
```

### NextAuth
```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-generated-secret
```

### Supabase Storage
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Build Configuration

Vercel will automatically detect Next.js and use:
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

## Post-Deployment Steps

1. **Run Database Migration**
   ```bash
   npx prisma migrate deploy
   ```

2. **Generate Prisma Client** (if needed)
   ```bash
   npx prisma generate
   ```

3. **Create Admin User**
   Use Prisma Studio or run SQL directly in your database:
   ```sql
   INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid(),
     'Admin',
     'admin@yourdomain.com',
     '$2a$10$XaL.Zqk3H1Ovy9K0rZ8TfOvXqJqp3K2L0c5VmLZYVqL7F5fZf5vFK',
     'ADMIN',
     NOW(),
     NOW()
   );
   ```
   Default password: `admin123` (change immediately!)

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: All other branches and pull requests

## Custom Domain

1. Go to Vercel dashboard → Your project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to your custom domain

## Performance Tips

- Vercel Edge Network automatically caches static assets
- Server Actions run on Vercel Serverless Functions
- Database should be in same region as Vercel deployment for best performance

## Monitoring

Monitor your app in Vercel dashboard:
- Analytics: Track performance and usage
- Logs: View runtime errors and logs
- Speed Insights: Measure Core Web Vitals

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Ensure `DATABASE_URL` is accessible from Vercel
- Verify all dependencies are in `package.json`

### Runtime Errors
- Check Vercel Function logs
- Verify Supabase Storage buckets are public
- Ensure database migrations are applied

### Database Connection Issues
- Use connection pooler URL for Neon/Supabase
- Check if IP allowlist includes Vercel IPs
- Verify SSL/TLS settings

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Admin user created
- [ ] Supabase buckets created and public
- [ ] Custom domain configured (optional)
- [ ] Default admin password changed
- [ ] Test all workflows (Admin, Landlord, Tenant)
