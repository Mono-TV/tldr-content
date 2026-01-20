'use client';

import { useQuery } from '@tanstack/react-query';
import { SportsHero } from '@/components/sports/sports-hero';
import { SportsRow } from '@/components/sports/sports-row';
import type { CriticalSportsData } from '@/lib/fetch-sports-data';
import type { SportsContent, SportsResponse } from '@/types/sports';

interface SportsPageClientProps {
  criticalData: CriticalSportsData;
}

// MongoDB API endpoint for client-side fetching
const SPORTS_API_URL = '/api/sports';

// Helper to fetch sports from API route
async function fetchSportsFromAPI(params: Record<string, string>): Promise<SportsResponse> {
  const searchParams = new URLSearchParams(params);
  const response = await fetch(`${SPORTS_API_URL}?${searchParams.toString()}`);

  if (!response.ok) {
    return { items: [], total: 0 };
  }

  return response.json();
}

/**
 * Remaining sports data interface
 */
interface RemainingSportsData {
  tennis: SportsResponse;
  badminton: SportsResponse;
  hockey: SportsResponse;
  esports: SportsResponse;
  formula1: SportsResponse;
  mma: SportsResponse;
  tabletennis: SportsResponse;
  americanFootball: SportsResponse;
  athletics: SportsResponse;
}

/**
 * Sports Page Client Component
 *
 * Receives critical data from server (hero + 3 sport rows)
 * Lazy-loads remaining sport rows client-side
 */
export function SportsPageClient({ criticalData }: SportsPageClientProps) {
  // Fetch remaining sports data client-side
  const { data: remainingData, isLoading: isLoadingRemaining } = useQuery<RemainingSportsData>({
    queryKey: ['sports-remaining-data'],
    queryFn: async () => {
      const [
        tennis,
        badminton,
        hockey,
        esports,
        formula1,
        mma,
        tabletennis,
        americanFootball,
        athletics,
      ] = await Promise.all([
        fetchSportsFromAPI({ game_name: 'Tennis', limit: '15' }),
        fetchSportsFromAPI({ game_name: 'Badminton', limit: '15' }),
        fetchSportsFromAPI({ game_name: 'Hockey', limit: '15' }),
        fetchSportsFromAPI({ game_name: 'ESports', limit: '15' }),
        fetchSportsFromAPI({ game_name: 'Formula 1', limit: '15' }),
        fetchSportsFromAPI({ game_name: 'Mixed Martial Arts', limit: '15' }),
        fetchSportsFromAPI({ game_name: 'Table Tennis', limit: '15' }),
        fetchSportsFromAPI({ game_name: 'American Football', limit: '15' }),
        fetchSportsFromAPI({ game_name: 'Athletics', limit: '15' }),
      ]);

      return {
        tennis,
        badminton,
        hockey,
        esports,
        formula1,
        mma,
        tabletennis,
        americanFootball,
        athletics,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Carousel - Featured Sports */}
      <SportsHero items={criticalData.featured?.items || []} />

      {/* Content Sections */}
      <div className="-mt-20 relative z-10 space-y-8 pl-12 lg:pl-16">
        {/* ========================================
            CRITICAL ROWS - Pre-rendered by server
            ======================================== */}

        {/* Cricket - Most popular */}
        <SportsRow
          title="Cricket"
          subtitle="IPL, International matches, and more"
          contents={criticalData.cricket?.items || []}
          sportType="Cricket"
          priorityCount={5}
        />

        {/* Football */}
        <SportsRow
          title="Football"
          subtitle="Premier League, ISL, and more"
          contents={criticalData.football?.items || []}
          sportType="Football"
          priorityCount={3}
        />

        {/* Kabaddi */}
        <SportsRow
          title="Kabaddi"
          subtitle="Pro Kabaddi League"
          contents={criticalData.kabaddi?.items || []}
          sportType="Kabaddi"
        />

        {/* ========================================
            LAZY-LOADED ROWS - Loaded client-side
            ======================================== */}

        {/* Tennis */}
        <SportsRow
          title="Tennis"
          subtitle="Grand Slams, ATP, WTA"
          contents={remainingData?.tennis?.items || []}
          isLoading={isLoadingRemaining}
          sportType="Tennis"
        />

        {/* Badminton */}
        <SportsRow
          title="Badminton"
          subtitle="BWF World Tour"
          contents={remainingData?.badminton?.items || []}
          isLoading={isLoadingRemaining}
          sportType="Badminton"
        />

        {/* Hockey */}
        <SportsRow
          title="Hockey"
          subtitle="FIH Pro League and International"
          contents={remainingData?.hockey?.items || []}
          isLoading={isLoadingRemaining}
          sportType="Hockey"
        />

        {/* Esports */}
        <SportsRow
          title="Esports"
          subtitle="Gaming tournaments and competitions"
          contents={remainingData?.esports?.items || []}
          isLoading={isLoadingRemaining}
          sportType="ESports"
        />

        {/* Formula 1 */}
        <SportsRow
          title="Formula 1"
          subtitle="F1 races and highlights"
          contents={remainingData?.formula1?.items || []}
          isLoading={isLoadingRemaining}
          sportType="Formula 1"
        />

        {/* MMA */}
        <SportsRow
          title="MMA"
          subtitle="ONE Championship and more"
          contents={remainingData?.mma?.items || []}
          isLoading={isLoadingRemaining}
          sportType="Mixed Martial Arts"
        />

        {/* American Football */}
        <SportsRow
          title="American Football"
          subtitle="NFL highlights"
          contents={remainingData?.americanFootball?.items || []}
          isLoading={isLoadingRemaining}
          sportType="American Football"
        />

        {/* Table Tennis */}
        <SportsRow
          title="Table Tennis"
          subtitle="WTT events"
          contents={remainingData?.tabletennis?.items || []}
          isLoading={isLoadingRemaining}
          sportType="Table Tennis"
        />

        {/* Athletics */}
        <SportsRow
          title="Athletics"
          subtitle="Track and field events"
          contents={remainingData?.athletics?.items || []}
          isLoading={isLoadingRemaining}
          sportType="Athletics"
        />
      </div>
    </div>
  );
}
