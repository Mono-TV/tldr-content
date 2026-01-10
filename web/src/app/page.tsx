import { fetchHomepageData } from '@/lib/fetch-homepage-data';
import { HomePageClient } from '@/components/pages/home-page-client';

/**
 * Homepage - Server Component with ISR
 *
 * This page is pre-rendered at build time and revalidated every 5 minutes.
 * All 48 rows of content are fetched server-side in parallel, eliminating
 * client-side API calls and providing instant page loads.
 *
 * Performance Benefits:
 * - Zero client-side API requests
 * - Instant page load (<1 second)
 * - Perfect SEO (pre-rendered HTML)
 * - Auto-updates every 5 minutes
 */

// Enable ISR - revalidate every 5 minutes (300 seconds)
export const revalidate = 300;

// Enable dynamic rendering for this page (required for ISR)
export const dynamic = 'force-static';

export default async function HomePage() {
  // Fetch all homepage data on server
  // This runs at build time and every 5 minutes thereafter
  const data = await fetchHomepageData();

  // Pass pre-fetched data to client component
  return <HomePageClient data={data} />;
}
