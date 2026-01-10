import { fetchHomepageData } from '@/lib/fetch-homepage-data';
import { HomePageClient } from '@/components/pages/home-page-client';

/**
 * Homepage - Server Component with On-Demand ISR
 *
 * This page uses on-demand ISR to avoid API rate limiting during builds.
 * The first visitor triggers data fetching, subsequent visitors get cached data.
 *
 * Build Strategy:
 * - Uses 'force-dynamic' to skip build-time pre-rendering
 * - Avoids API rate limiting and timeouts when building
 * - First visitor: ~2-3 second load (data fetching)
 * - All subsequent visitors: <1 second (ISR cache)
 * - Auto-updates every 5 minutes
 *
 * Performance Benefits:
 * - Zero client-side API requests
 * - Perfect SEO (pre-rendered HTML after first visit)
 * - No build-time API calls
 */

// Temporarily disable ISR cache to force fresh data (will revert to 300)
export const revalidate = 0;

// Use dynamic rendering to generate on-demand (not at build time)
// This prevents API timeouts when building in Docker/Cloud Run
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch all homepage data on server
  // This runs at build time and every 5 minutes thereafter
  const data = await fetchHomepageData();

  // Pass pre-fetched data to client component
  return <HomePageClient data={data} />;
}
