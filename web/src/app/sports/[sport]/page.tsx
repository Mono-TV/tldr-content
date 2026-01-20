import { notFound } from 'next/navigation';
import { fetchTournaments, fetchSportsContent } from '@/lib/fetch-sports-data';
import { SportTournamentsPage } from '@/components/pages/sport-tournaments-page';
import { slugToSport, SPORT_ICONS, SPORT_DISPLAY_NAMES } from '@/types/sports';

interface SportPageProps {
  params: Promise<{ sport: string }>;
}

// Enable ISR with 5-minute cache
export const revalidate = 300;

// Generate static params for common sports
export async function generateStaticParams() {
  return [
    { sport: 'cricket' },
    { sport: 'football' },
    { sport: 'tennis' },
    { sport: 'kabaddi' },
    { sport: 'badminton' },
  ];
}

export default async function SportPage({ params }: SportPageProps) {
  const { sport: sportSlug } = await params;
  const sportName = slugToSport(sportSlug);

  // Sport name will always be valid after slugToSport conversion
  // The notFound check happens below if no content exists

  // Fetch tournaments and featured content
  const [tournamentsData, featuredContent] = await Promise.all([
    fetchTournaments(sportName),
    fetchSportsContent({
      game_name: sportName,
      asset_status: 'PUBLISHED',
      sort: 'start_date',
      order: 'desc',
      limit: 10,
    }),
  ]);

  if (tournamentsData.tournaments.length === 0 && featuredContent.items.length === 0) {
    notFound();
  }

  return (
    <SportTournamentsPage
      sportName={sportName}
      sportSlug={sportSlug}
      displayName={SPORT_DISPLAY_NAMES[sportName] || sportName}
      icon={SPORT_ICONS[sportName] || '🏆'}
      tournaments={tournamentsData.tournaments}
      featuredContent={featuredContent.items}
    />
  );
}
