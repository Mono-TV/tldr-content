import { fetchSportsHomepageData } from '@/lib/fetch-sports-data';
import { SportsHomepage } from '@/components/pages/sports-homepage';

/**
 * Sports Page - Dynamic sports homepage with live and time-aware content
 *
 * Layout:
 * 1. Hero - Live matches (or featured if none live)
 * 2. Starting Soon - Matches in next 24 hours
 * 3. Sport Rows - Cricket, Football, Kabaddi, Tennis, Badminton
 * 4. All Sports Grid - Browse all sports categories
 *
 * Navigation:
 * - /sports - This page
 * - /sports/[sport] - Tournaments for that sport
 * - /sports/[sport]/[tournamentId] - Matches for that tournament
 */

// ISR with 1-minute cache for live content freshness
export const revalidate = 60;

export default async function SportsPage() {
  const data = await fetchSportsHomepageData();

  return <SportsHomepage data={data} />;
}
