import { fetchSportCollections } from '@/lib/fetch-sports-data';
import { SportsCollectionsPage } from '@/components/pages/sports-collections-page';

/**
 * Sports Page - Shows all sport collections
 *
 * Structure:
 * 1. /sports - List of sports (Cricket, Football, etc.)
 * 2. /sports/[sport] - Tournaments for that sport
 * 3. /sports/[sport]/[tournamentId] - Matches for that tournament
 */

// Enable ISR with 5-minute cache
export const revalidate = 300;
export const dynamic = 'force-static';

export default async function SportsPage() {
  const collections = await fetchSportCollections();

  return <SportsCollectionsPage collections={collections} />;
}
