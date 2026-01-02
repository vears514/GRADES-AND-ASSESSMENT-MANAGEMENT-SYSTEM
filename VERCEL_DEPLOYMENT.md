# Vercel Deployment Configuration

## vercel.json Configuration

The `vercel.json` file has been created with the correct Next.js output directory (.next).

### Key Settings:
- **buildCommand**: `npm run build` - Builds the Next.js app
- **outputDirectory**: `.next` - Tells Vercel where the build output is
- **framework**: `nextjs` - Specifies Next.js framework

## Environment Variables Setup

### For Vercel Deployment:

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your GradeHub project
3. Go to **Settings > Environment Variables**
4. Add the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyABHS1sA2fprqrnkD1iR2GelXh4oN3nWOs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gradehub-beltran.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gradehub-beltran
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gradehub-beltran.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=313204491488
NEXT_PUBLIC_FIREBASE_APP_ID=1:313204491488:web:2cfaa051c44baa9e03bc85
```

**Note**: All these variables are public (prefixed with `NEXT_PUBLIC_`) and safe to expose in Vercel.

## Local Development

Ensure your `.env.local` file exists with the same variables:

```bash
cat .env.local
```

Expected output:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyABHS1sA2fprqrnkD1iR2GelXh4oN3nWOs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gradehub-beltran.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gradehub-beltran
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gradehub-beltran.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=313204491488
NEXT_PUBLIC_FIREBASE_APP_ID=1:313204491488:web:2cfaa051c44baa9e03bc85
```

## Build Output Structure

After `npm run build`, your project structure will be:

```
.next/
├── static/          # Static assets
├── server/          # Server-side code
├── standalone/      # Standalone build
└── cache/           # Build cache
```

## Deployment Steps

### Via Vercel CLI:

```bash
npm install -g vercel
vercel login
vercel deploy --prod
```

### Via GitHub Integration:

1. Push to GitHub
2. Vercel automatically deploys on push to main branch
3. Deployments appear at: https://vercel.com/dashboard

### Via Vercel Web Dashboard:

1. Go to https://vercel.com/dashboard
2. Import repository
3. Select GradeHub project
4. Add environment variables (see above)
5. Click Deploy

## Build Output Explained

From your build output:

```
├ ƒ /api/auth/login                      (Dynamic API route)
├ ƒ /api/auth/register                   (Dynamic API route)
├ ƒ /api/grades/encode                   (Dynamic API route)
├ ○ /api/grades/verification             (Static API route)
├ ○ /dashboard                           (Static page)
├ ○ /dashboard/faculty/corrections       (Static page)
├ ○ /dashboard/faculty/grades            (Static page)
├ ○ /dashboard/registrar/reports         (Static page)
├ ○ /dashboard/registrar/verification    (Static page)
├ ○ /dashboard/student/grades            (Static page)
├ ○ /login                               (Static page)
└ ○ /register                            (Static page)
```

**Legend**:
- `ƒ` = Dynamic (server-rendered)
- `○` = Static (prerendered)

## Troubleshooting

### Build Fails with "No Output Directory"

**Solution**: Ensure `vercel.json` exists with:
```json
{
  "outputDirectory": ".next",
  "buildCommand": "npm run build"
}
```

### Environment Variables Not Loaded

1. Check `.env.local` exists locally
2. Add variables to Vercel project settings
3. Restart deployment: `vercel deploy --prod`

### Firebase Not Initializing

1. Verify `NEXT_PUBLIC_FIREBASE_*` variables are set
2. Check Firebase project is active
3. Ensure `.env.local` has correct values

### 404 Pages Not Found

Ensure build completes:
```bash
npm run build
# Should show all routes with no errors
```

## Production URLs

After deployment:
- **Production**: https://your-gradehub.vercel.app
- **Preview**: Automatic for pull requests
- **Dashboard**: https://vercel.com/dashboard

## Security Notes

✅ **Safe to expose**:
- `NEXT_PUBLIC_FIREBASE_API_KEY` (browser SDK key)
- All `NEXT_PUBLIC_*` variables

❌ **Never expose**:
- Firebase service account keys
- Admin credentials
- Database passwords
- API keys without NEXT_PUBLIC_ prefix

## Performance Insights

Check deployment performance:
1. Vercel Dashboard > Analytics
2. Web Vitals (LCP, FID, CLS)
3. Build times
4. Function execution times

## Next Steps

1. ✅ Create vercel.json
2. ✅ Configure Next.js
3. ✅ Add environment variables to Vercel
4. 📝 Deploy via CLI: `vercel deploy --prod`
5. 📝 Monitor build at https://vercel.com/dashboard
6. 📝 Test production URLs
7. 📝 Set up custom domain (if needed)
