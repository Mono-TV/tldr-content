import { notFound } from 'next/navigation';
import { fetchTournamentMatches } from '@/lib/fetch-sports-data';
import { TournamentMatchesPage } from '@/components/pages/tournament-matches-page';
import { slugToSport, SPORT_ICONS, SPORT_DISPLAY_NAMES } from '@/types/sports';

interface TournamentPageProps {
  params: Promise<{ sport: string; tournamentId: string }>;
}

// Enable ISR with 5-minute cache
export const revalidate = 300;

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { sport: sportSlug, tournamentId } = await params;
  const sportName = slugToSport(sportSlug);

  // Check if valid sport
  if (!SPORT_DISPLAY_NAMES[sportName] && !sportName) {
    notFound();
  }

  // Fetch matches for this tournament
  const matchesData = await fetchTournamentMatches(sportName, tournamentId);

  if (matchesData.items.length === 0) {
    notFound();
  }

  // Get tournament name from API response or first item
  const tournamentName = matchesData.tournamentName || matchesData.items[0]?.sports_season_name || 'Tournament';

  return (
    <TournamentMatchesPage
      sportName={sportName}
      sportSlug={sportSlug}
      sportDisplayName={SPORT_DISPLAY_NAMES[sportName] || sportName}
      sportIcon={SPORT_ICONS[sportName] || '🏆'}
      tournamentId={tournamentId}
      tournamentName={tournamentName}
      matches={matchesData.items}
    />
  );
}
