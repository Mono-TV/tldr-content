/**
 * Server-side sports data fetching for ISR
 * Fetches from content-api instead of direct MongoDB
 */

import type {
  SportsContent,
  SportsResponse,
  SportCollection,
  Tournament,
  TournamentResponse
} from '@/types/sports';
import { SPORT_ICONS, SPORT_DISPLAY_NAMES, sportToSlug } from '@/types/sports';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://content-api-401132033262.asia-south1.run.app';

/**
 * Fetch sport collections from API
 */
export async function fetchSportCollections(): Promise<SportCollection[]> {
  console.log('[ISR] Fetching sport collections from API...');
  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE_URL}/api/sports/collections`, {
      next: { revalidate: 300 }, // 5 minute cache
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    const collections: SportCollection[] = data.items.map((r: any) => ({
      name: r.name,
      displayName: SPORT_DISPLAY_NAMES[r.name] || r.name,
      icon: SPORT_ICONS[r.name] || '🏆',
      slug: sportToSlug(r.name),
      tournamentCount: r.tournamentCount || 0,
      matchCount: r.matchCount || 0,
      thumbnail: r.thumbnail,
    }));

    const endTime = Date.now();
    console.log(`[ISR] Fetched ${collections.length} sport collections in ${endTime - startTime}ms`);

    return collections;
  } catch (error) {
    console.error('[ISR] Error fetching sport collections:', error);
    return [];
  }
}

/**
 * Fetch tournaments for a specific sport
 */
export async function fetchTournaments(sportName: string): Promise<TournamentResponse> {
  console.log(`[ISR] Fetching tournaments for ${sportName} from API...`);
  const startTime = Date.now();

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/sports/tournaments/${encodeURIComponent(sportName)}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    const tournaments: Tournament[] = data.items.map((r: any) => ({
      id: r.id || null,
      name: r.name,
      sportName: r.sportName || sportName,
      matchCount: r.matchCount || 0,
      thumbnail: r.thumbnail,
      latestMatchDate: r.latestMatchDate,
    }));

    const endTime = Date.now();
    console.log(`[ISR] Fetched ${tournaments.length} tournaments in ${endTime - startTime}ms`);

    return {
      tournaments,
      total: tournaments.length,
    };
  } catch (error) {
    console.error(`[ISR] Error fetching tournaments for ${sportName}:`, error);
    return { tournaments: [], total: 0 };
  }
}

/**
 * Fetch matches for a specific tournament
 */
export async function fetchTournamentMatches(
  sportName: string,
  tournamentId: number | string
): Promise<SportsResponse & { tournamentName?: string }> {
  console.log(`[ISR] Fetching matches for tournament ${tournamentId} from API...`);
  const startTime = Date.now();

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/sports/matches/${encodeURIComponent(sportName)}/${tournamentId}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    const endTime = Date.now();
    console.log(`[ISR] Fetched ${data.items?.length || 0} matches in ${endTime - startTime}ms`);

    return {
      items: data.items || [],
      total: data.total || 0,
      tournamentName: data.tournamentName,
    };
  } catch (error) {
    console.error(`[ISR] Error fetching tournament matches:`, error);
    return { items: [], total: 0 };
  }
}

/**
 * Fetch sports content with filters
 */
export async function fetchSportsContent(options: {
  game_name?: string;
  asset_status?: 'PUBLISHED' | 'UNPUBLISHED';
  live?: boolean;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
} = {}): Promise<SportsResponse> {
  try {
    const params = new URLSearchParams();

    if (options.game_name) params.set('game_name', options.game_name);
    if (options.live) params.set('live', 'true');
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.sort) params.set('sort', options.sort);
    if (options.order) params.set('order', options.order);

    const response = await fetch(
      `${API_BASE_URL}/api/sports?${params.toString()}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      items: data.items || [],
      total: data.pagination?.total || data.items?.length || 0,
    };
  } catch (error) {
    console.error('[Sports] Error fetching sports content:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Fetch featured sports content (for hero)
 */
export async function fetchFeaturedSports(limit: number = 5): Promise<SportsResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/sports/featured?limit=${limit}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      items: data.items || [],
      total: data.total || 0,
    };
  } catch (error) {
    console.error('[Sports] Error fetching featured sports:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Sports data interface for page
 */
export interface SportsPageData {
  featured: SportsResponse;
  cricket: SportsResponse;
  football: SportsResponse;
  tennis: SportsResponse;
  kabaddi: SportsResponse;
  badminton: SportsResponse;
  hockey: SportsResponse;
  esports: SportsResponse;
  formula1: SportsResponse;
  mma: SportsResponse;
  tabletennis: SportsResponse;
  americanFootball: SportsResponse;
  athletics: SportsResponse;
  recentAll: SportsResponse;
}

/**
 * Fetch all sports page data
 */
export async function fetchSportsPageData(): Promise<SportsPageData> {
  console.log('[ISR] Fetching sports page data...');
  const startTime = Date.now();

  try {
    const [
      featured,
      cricket,
      football,
      tennis,
      kabaddi,
      badminton,
      hockey,
      esports,
      formula1,
      mma,
      tabletennis,
      americanFootball,
      athletics,
      recentAll,
    ] = await Promise.all([
      fetchFeaturedSports(5),
      fetchSportsContent({ game_name: 'Cricket', sort: 'start_date', order: 'desc', limit: 15 }),
      fetchSportsContent({ game_name: 'Football', sort: 'start_date', order: 'desc', limit: 15 }),
      fetchSportsContent({ game_name: 'Tennis', sort: 'start_date', order: 'desc', limit: 15 }),
      fetchSportsContent({ game_name: 'Kabaddi', sort: 'start_date', order: 'desc', limit: 15 }),
      fetchSportsContent({ game_name: 'Badminton', sort: 'start_date', order: 'desc', limit: 15 }),
      fetchSportsContent({ game_name: 'Hockey', sort: 'start_date', order: 'desc', limit: 15 }),
      fetchSportsContent({ game_name: 'ESports', sort: 'start_date', order: 'desc', limit: 15 }),
      fetchSportsContent({ game_name: 'Formula 1', sort: 'start_date', order: 'desc', limit: 15 }),
      fetchSportsContent({ game_name: 'Mixed Martial Arts', sort: 'start_date', order: 'desc', limit: 15 }),
      fetchSportsContent({ game_name: 'Table Tennis', sort: 'start_date', order: 'desc', limit: 15 }),
      fetchSportsContent({ game_name: 'American Football', sort: 'start_date', order: 'desc', limit: 15 }),
      fetchSportsContent({ game_name: 'Athletics', sort: 'start_date', order: 'desc', limit: 15 }),
      fetchSportsContent({ sort: 'start_date', order: 'desc', limit: 20 }),
    ]);

    const endTime = Date.now();
    console.log(`[ISR] Fetched sports page data in ${endTime - startTime}ms`);

    return {
      featured,
      cricket,
      football,
      tennis,
      kabaddi,
      badminton,
      hockey,
      esports,
      formula1,
      mma,
      tabletennis,
      americanFootball,
      athletics,
      recentAll,
    };
  } catch (error) {
    console.error('[ISR] Error fetching sports page data:', error);
    throw error;
  }
}

/**
 * Critical data interface - above the fold content
 */
export interface CriticalSportsData {
  featured: SportsResponse;
  cricket: SportsResponse;
  football: SportsResponse;
  kabaddi: SportsResponse;
}

/**
 * Fetch only critical above-the-fold sports data for fast initial load
 */
export async function fetchCriticalSportsData(): Promise<CriticalSportsData> {
  console.log('[ISR] Fetching critical sports data...');
  const startTime = Date.now();

  try {
    const [featured, cricket, football, kabaddi] = await Promise.all([
      fetchFeaturedSports(5),
      fetchSportsContent({ game_name: 'Cricket', sort: 'start_date', order: 'desc', limit: 15 }),
      fetchSportsContent({ game_name: 'Football', sort: 'start_date', order: 'desc', limit: 15 }),
      fetchSportsContent({ game_name: 'Kabaddi', sort: 'start_date', order: 'desc', limit: 15 }),
    ]);

    const endTime = Date.now();
    console.log(`[ISR] Fetched critical sports data in ${endTime - startTime}ms`);

    return { featured, cricket, football, kabaddi };
  } catch (error) {
    console.error('[ISR] Error fetching critical sports data:', error);
    throw error;
  }
}
