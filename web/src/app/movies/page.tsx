import { fetchMoviesData } from '@/lib/fetch-movies-data';
import { MoviesPageClient } from '@/components/pages/movies-page-client';

/**
 * Movies Page - Server Component with ISR
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
 * All data is fetched server-side with ISR caching:
 * - First visitor: ~90-120 seconds (generates cache)
 * - Subsequent visitors: <1 second (served from cache)
 * - Cache refreshes every 5 minutes
 */

// Enable ISR with 5-minute cache
export const revalidate = 300;

// Use force-dynamic to skip build-time rendering (prevents timeout during build)
// Runtime ISR caching still works with force-dynamic
export const dynamic = 'force-dynamic';

export default async function MoviesPage() {
  // Fetch all movies page data on server
  const data = await fetchMoviesData();

  // Pass pre-fetched data to client component
  return <MoviesPageClient data={data} />;
}
