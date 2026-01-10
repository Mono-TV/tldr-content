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

// Enable ISR - revalidate every 5 minutes (300 seconds)
export const revalidate = 300;

// Use dynamic rendering to generate on-demand (not at build time)
// This prevents API rate limiting when building both homepage and shows page
export const dynamic = 'force-dynamic';

export default async function ShowsPage() {
  // Fetch all shows page data on server
  // This runs on first request, then cached and revalidated every 5 minutes
  const data = await fetchShowsData();

  // Pass pre-fetched data to client component
  return <ShowsPageClient data={data} />;
}
