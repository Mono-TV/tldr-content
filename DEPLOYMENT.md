# TLDR Content - Deployment Guide

## Overview

The application now uses **SSR (Server-Side Rendering) with ISR (Incremental Static Regeneration)** for optimal performance and scalability.

### Architecture
- **Build time**: 5 seconds (pre-renders top 100 pages)
- **Total content**: 105,569+ items supported
- **Strategy**: ISR with 1-hour revalidation
- **Images**: Optimized with Next.js Image Optimization

---

## Vercel Deployment (Recommended)

Vercel is the optimal platform for Next.js applications with SSR/ISR.

### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `Mono-TV/tldr-content`
4. Select the `web` directory as the root directory

### Step 2: Configure Build Settings

**Framework Preset**: Next.js (auto-detected)

**Build & Development Settings**:
```
Root Directory: web
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

**Node.js Version**: 18.x or higher

### Step 3: Environment Variables

Add the following environment variables in Vercel dashboard:

```env
# Firebase Configuration (for authentication)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# API Configuration
NEXT_PUBLIC_API_URL=https://content-api-401132033262.asia-south1.run.app
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (~30 seconds)
3. Your app will be live at `https://your-project.vercel.app`

### Step 5: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `tldrcontent.com`)
3. Follow DNS configuration instructions
4. SSL certificate is automatically provisioned

---

## How ISR Works

### Pre-rendered Pages (Instant Load)
- Top 100 content pages are pre-rendered at build time
- Home page, browse, search, etc. are statically generated
- Served from edge cache globally

### On-Demand Pages (Generated Once, Cached)
- Remaining 105K+ content pages generated on first request
- Subsequent requests served from cache (1-hour TTL)
- Automatic regeneration after cache expiration

### Example Flow:
1. User visits `/content/tt0111161` (pre-rendered) → **Instant load**
2. User visits `/content/tt1234567` (not pre-rendered):
   - First request: Generated on-demand (~200ms)
   - Next requests: Served from cache (~50ms)
   - After 1 hour: Regenerated on next request

---

## Performance Characteristics

### Build Performance
- **Build time**: ~5 seconds
- **Pre-rendered pages**: 110 (home + top 100 content)
- **Bundle size**: ~2MB
- **No deployment limits**

### Runtime Performance
- **Pre-rendered pages**: 50-100ms (edge cache)
- **On-demand pages (first load)**: 200-500ms
- **Cached pages**: 50-150ms
- **Image optimization**: Automatic WebP, resizing, caching

### Scalability
- Supports unlimited content pages
- Scales automatically with traffic
- Global CDN distribution
- No build time constraints

---

## Image Optimization

### Automatic Optimizations
- **Format conversion**: Automatic WebP/AVIF for supported browsers
- **Responsive images**: Served at optimal size for device
- **Lazy loading**: Images load only when visible
- **Caching**: Aggressive browser and CDN caching

### Size Configurations
- **Small**: 342px-400px (card thumbnails)
- **Medium**: 500px-600px (detail posters)
- **Large**: 780px-1200px (hero backdrops)
- **Original**: Full resolution (when needed)

### Source Support
- **TMDB images**: Automatic size transformation
- **Amazon/IMDb images**: Size parameter injection
- **External URLs**: Pass-through with optimization

---

## Monitoring & Analytics

### Vercel Analytics (Included)
- Real-time performance metrics
- Core Web Vitals tracking
- User flow analysis
- Geographic distribution

### Recommended Setup
1. Enable Vercel Analytics in project settings
2. Add performance budgets for key pages
3. Set up alerts for build failures
4. Monitor ISR cache hit rates

---

## Rollback & Deployment History

### Instant Rollback
1. Go to Deployments tab in Vercel
2. Find previous successful deployment
3. Click "..." → "Promote to Production"
4. Rollback completes in seconds

### Deployment URL Structure
- **Production**: `tldrcontent.com` or `your-project.vercel.app`
- **Preview**: `your-project-git-branch.vercel.app`
- **Development**: `localhost:3000`

---

## Alternative Deployment Options

### Netlify
1. Connect GitHub repository
2. Build command: `cd web && npm run build`
3. Publish directory: `web/.next`
4. Environment variables: Same as Vercel

### Docker (Self-hosted)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY web/package*.json ./
RUN npm ci --only=production
COPY web .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t tldrcontent .
docker run -p 3000:3000 tldrcontent
```

---

## Troubleshooting

### Build Fails
- Check Node.js version (18.x required)
- Verify environment variables are set
- Check for TypeScript errors: `npm run build`
- Review Vercel build logs

### Images Not Loading
- Verify remote patterns in `next.config.ts`
- Check image URLs are valid
- Ensure domains are whitelisted

### Slow Page Loads
- Check Vercel Analytics for bottlenecks
- Verify ISR is working (check cache headers)
- Review API response times
- Consider increasing revalidate time

### Memory Issues
- Increase serverless function memory in Vercel settings
- Optimize data fetching in pages
- Consider pagination for large datasets

---

## Cost Estimates (Vercel)

### Hobby Plan (Free)
- ✅ Unlimited deployments
- ✅ 100GB bandwidth
- ✅ Serverless functions
- ✅ Automatic SSL
- ✅ Perfect for personal projects

### Pro Plan ($20/month)
- ✅ Unlimited bandwidth
- ✅ Enhanced performance
- ✅ Password protection
- ✅ Analytics included
- ✅ Recommended for production

### Expected Traffic Costs
- **1M page views/month**: Free tier sufficient
- **10M page views/month**: $20-40/month
- **100M page views/month**: $200-400/month

---

## Migration from GitHub Pages

### What Changed
- ❌ Removed: Static export (`output: 'export'`)
- ❌ Removed: GitHub Pages workflow
- ❌ Removed: SPA redirect component
- ✅ Added: SSR/ISR support
- ✅ Added: Image optimization
- ✅ Added: Dynamic page generation

### GitHub Pages Workflow
The `.github/workflows/deploy.yml` file is now obsolete and can be removed:
```bash
git rm .github/workflows/deploy.yml
git commit -m "Remove GitHub Pages workflow (migrated to Vercel)"
git push
```

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js ISR**: https://nextjs.org/docs/pages/building-your-application/data-fetching/incremental-static-regeneration
- **Image Optimization**: https://nextjs.org/docs/pages/building-your-application/optimizing/images

---

**Last Updated**: January 9, 2026
**Version**: 1.0 (SSR/ISR Migration)
