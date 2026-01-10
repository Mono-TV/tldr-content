import { fetchMoviesData } from '@/lib/fetch-movies-data';
import { MoviesPageClient } from '@/components/pages/movies-page-client';

/**
 * Movies Page - Server Component with Client-Side Progressive Rendering
 *
 * Displays all 48 rows of movie content organized by:
 * - Top Rated Movies (8 rows - by language)
 * - Top Action Movies (8 rows)
 * - Top Comedy Movies (8 rows)
 * - Top Drama Movies (8 rows)
 * - Top Thriller Movies (8 rows)
 * - Latest Star Movies (7 rows - by language)
 * - Top 10 Movies (1 row)
 *
 * Strategy:
 * - Server fetches ALL data once (~75 seconds first time)
 * - Client receives all data in initial response
 * - Client renders rows progressively for fast perceived load
 * - ISR caches full response for 5 minutes
 * - Subsequent visitors get instant load from cache
 */

// Enable ISR with 5-minute cache
export const revalidate = 300;

// Use force-dynamic to skip build-time rendering (prevents timeout during build)
// Runtime ISR caching still works with force-dynamic
export const dynamic = 'force-dynamic';

export default async function MoviesPage() {
  // Fetch ALL data once on server
  const data = await fetchMoviesData();

  // Pass all data to client (client will render progressively)
  return <MoviesPageClient data={data} />;
}
