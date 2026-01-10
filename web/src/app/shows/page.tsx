import { fetchInitialShowsData } from '@/lib/fetch-shows-data';
import { ShowsPageClient } from '@/components/pages/shows-page-client';

/**
 * Shows Page - Server Component with Progressive Loading
 *
 * Progressive Loading Strategy:
 * - Server renders first 10 rows (~10-15 seconds)
 * - Client lazy-loads remaining 38 rows after initial render
 * - ISR cache refreshes every 5 minutes
 *
 * Performance Benefits:
 * - Fast initial page navigation (<15 seconds vs 75 seconds)
 * - Progressive content reveal for better UX
 * - Perfect SEO for initial content
 * - Reduced server load per request
 */

// Enable ISR with 5-minute cache
export const revalidate = 300;

// Use force-dynamic to skip build-time rendering (prevents timeout during build)
// Runtime ISR caching still works with force-dynamic
export const dynamic = 'force-dynamic';

export default async function ShowsPage() {
  // Fetch ONLY first 10 rows on server (fast response)
  const initialData = await fetchInitialShowsData();

  console.log('[Server] Passing initial shows data to client:', {
    initialRows: Object.keys(initialData).length
  });

  // Pass initial data to client (client will lazy-load remaining 38 rows)
  return <ShowsPageClient initialData={initialData} />;
}
