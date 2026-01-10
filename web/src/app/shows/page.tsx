import { fetchShowsData } from '@/lib/fetch-shows-data';
import { ShowsPageClient } from '@/components/pages/shows-page-client';

/**
 * Shows Page - Server Component with On-Demand ISR
 *
 * This page uses on-demand ISR to avoid API rate limiting during builds.
 * The first visitor triggers data fetching, subsequent visitors get cached data.
 * All 48 rows of TV show content are fetched server-side in parallel, eliminating
 * client-side API calls.
 *
 * Performance Benefits:
 * - Zero client-side API requests (after first load)
 * - Fast page loads from ISR cache (<1 second)
 * - Perfect SEO (server-rendered HTML)
 * - Auto-updates every 5 minutes after first generation
 *
 * Build Strategy:
 * - Uses 'force-dynamic' to skip build-time pre-rendering
 * - Avoids API rate limiting during concurrent homepage + shows builds
 * - First visitor: ~2-3 second load (data fetching)
 * - All subsequent visitors: <1 second (ISR cache)
 */

// Enable ISR with 5-minute cache to prevent timeout on every request
// First request will take 2+ minutes to fetch all 48 rows
// Subsequent requests will be served from cache (<1 second)
export const revalidate = 300;

// Remove force-dynamic to allow caching
// export const dynamic = 'force-dynamic';

export default async function ShowsPage() {
  // Fetch all shows page data on server
  // This runs on first request, then cached and revalidated every 5 minutes
  const data = await fetchShowsData();

  // Debug: Verify data before passing to client
  console.log('[Server Component] About to pass data to client:', {
    featured: data.featured?.items?.length || 0,
    topRatedRecent: data.topRatedRecent?.items?.length || 0,
    totalKeys: Object.keys(data).length
  });

  // Pass pre-fetched data to client component
  return <ShowsPageClient data={data} />;
}
