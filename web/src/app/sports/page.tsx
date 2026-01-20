import { fetchCriticalSportsData } from '@/lib/fetch-sports-data';
import { SportsPageClient } from '@/components/pages/sports-page-client';

/**
 * Sports Page - Server Component with ISR
 *
 * Strategy:
 * 1. Server fetches critical rows (hero + top 3 sports) - ~1-2 seconds
 * 2. ISR caches the response for 5 minutes
 * 3. Client renders critical rows immediately
 * 4. Client lazy-loads remaining sport rows progressively
 *
 * Content Organization:
 * - CRITICAL (4 rows): Hero + Cricket + Football + Kabaddi
 * - LAZY (9 rows): Tennis, Badminton, Hockey, Esports, F1, MMA, etc.
 */

// Enable ISR with 5-minute cache
export const revalidate = 300;

// Enable static generation for fast initial loads
export const dynamic = 'force-static';

export default async function SportsPage() {
  // Fetch only critical above-the-fold data on server
  const criticalData = await fetchCriticalSportsData();

  // Pass critical data to client (remaining rows load progressively)
  return <SportsPageClient criticalData={criticalData} />;
}
