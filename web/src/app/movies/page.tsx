import { fetchMoviesData } from '@/lib/fetch-movies-data';
import { MoviesPageClient } from '@/components/pages/movies-page-client';
import { getInitialMoviesData } from '@/lib/progressive-loading';

/**
 * Movies Page - Server Component with Progressive Loading
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
 * Progressive Loading Strategy:
 * - Server renders first 10 rows (~10-15 seconds)
 * - Client lazy-loads remaining 38 rows after initial render
 * - ISR cache refreshes every 5 minutes
 */

// Enable ISR with 5-minute cache
export const revalidate = 300;

// Use force-dynamic to skip build-time rendering (prevents timeout during build)
// Runtime ISR caching still works with force-dynamic
export const dynamic = 'force-dynamic';

export default async function MoviesPage() {
  // Fetch all movies data on server
  const allData = await fetchMoviesData();

  // Extract only first 10 rows for initial render
  const initialData = getInitialMoviesData(allData);

  // Pass initial data to client (client will lazy-load the rest)
  return <MoviesPageClient initialData={initialData} />;
}
