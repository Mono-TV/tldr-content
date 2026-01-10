import { fetchShowsData } from '@/lib/fetch-shows-data';
import { ShowsPageClient } from '@/components/pages/shows-page-client';

/**
 * Shows Page - Server Component with Client-Side Progressive Rendering
 *
 * Strategy:
 * - Server fetches ALL data once (~75 seconds first time)
 * - Client receives all data in initial response
 * - Client renders rows progressively for fast perceived load
 * - ISR caches full response for 5 minutes
 * - Subsequent visitors get instant load from cache
 *
 * Performance Benefits:
 * - Single data fetch (48 API calls, not 58)
 * - Fast perceived load via progressive rendering
 * - Perfect SEO (all content in HTML)
 * - Simpler architecture (no API routes needed)
 */

// Enable ISR with 5-minute cache
export const revalidate = 300;

// Use force-dynamic to skip build-time rendering (prevents timeout during build)
// Runtime ISR caching still works with force-dynamic
export const dynamic = 'force-dynamic';

export default async function ShowsPage() {
  // Fetch ALL data once on server
  const data = await fetchShowsData();

  console.log('[Server] Passing all shows data to client:', {
    totalRows: Object.keys(data).length
  });

  // Pass all data to client (client will render progressively)
  return <ShowsPageClient data={data} />;
}
