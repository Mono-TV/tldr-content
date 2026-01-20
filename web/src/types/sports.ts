/**
 * Sports content types for Hotstar sports data
 */

export interface SportsContent {
  _id: string;
  content_id: string;
  hotstar_id?: number;
  title: string;
  description?: string;

  // Sport classification
  game_name: string;  // Cricket, Football, Tennis, etc.
  genre?: string[];

  // Tournament/Season info
  tournament_id?: number;
  tournament_name?: string;
  sports_season_id?: number;
  sports_season_name?: string;

  // Timing
  start_date?: number;  // Unix timestamp
  end_date?: number;
  duration?: number;  // seconds

  // Status
  live?: boolean;
  asset_status?: 'PUBLISHED' | 'UNPUBLISHED';
  premium?: boolean;
  vip?: boolean;

  // Languages
  lang?: string[];

  // Media
  thumbnail?: string;
  source_images?: Array<{
    url: string;
    type: string;
  }>;

  // Links
  deep_link_url?: string;
  locators?: Array<{
    url: string;
    platform: string;
  }>;

  // Search
  search_keywords?: string[];

  // Timestamps
  created_at?: string;
  updated_at?: string;
  last_synced_at?: string;
}

export interface SportsResponse {
  items: SportsContent[];
  total: number;
}

export interface SportsFilters {
  game_name?: string;
  asset_status?: 'PUBLISHED' | 'UNPUBLISHED';
  live?: boolean;
  lang?: string;
  limit?: number;
  sort?: 'start_date' | 'title';
  order?: 'asc' | 'desc';
}

// Sport type display names
export const SPORT_DISPLAY_NAMES: Record<string, string> = {
  'Cricket': 'Cricket',
  'Football': 'Football',
  'Tennis': 'Tennis',
  'Kabaddi': 'Kabaddi',
  'Badminton': 'Badminton',
  'Hockey': 'Hockey',
  'ESports': 'Esports',
  'Formula 1': 'Formula 1',
  'Formula E': 'Formula E',
  'Mixed Martial Arts': 'MMA',
  'Table Tennis': 'Table Tennis',
  'American Football': 'American Football',
  'Athletics': 'Athletics',
  'Basketball': 'Basketball',
  'Swimming': 'Swimming',
  'Chess': 'Chess',
  'Motorsports': 'Motorsports',
};

// Sport icons (emoji for now, can be replaced with custom icons)
export const SPORT_ICONS: Record<string, string> = {
  'Cricket': '🏏',
  'Football': '⚽',
  'Tennis': '🎾',
  'Kabaddi': '🤼',
  'Badminton': '🏸',
  'Hockey': '🏑',
  'ESports': '🎮',
  'Formula 1': '🏎️',
  'Formula E': '🏎️',
  'Mixed Martial Arts': '🥊',
  'Table Tennis': '🏓',
  'American Football': '🏈',
  'Athletics': '🏃',
  'Basketball': '🏀',
  'Swimming': '🏊',
  'Chess': '♟️',
  'Motorsports': '🏁',
};

// Sport collection with metadata
export interface SportCollection {
  name: string;           // game_name from DB
  displayName: string;
  icon: string;
  slug: string;           // URL-friendly version
  tournamentCount: number;
  matchCount: number;
  thumbnail?: string;     // Featured image
}

// Tournament within a sport
export interface Tournament {
  id: number | null;
  name: string;
  sportName: string;
  matchCount: number;
  thumbnail?: string;
  latestMatchDate?: number;
}

export interface TournamentResponse {
  tournaments: Tournament[];
  total: number;
}

// Match group - groups related content (highlights, replays, languages) for the same match
export interface MatchGroup {
  id: string;           // Unique identifier (date-based)
  matchTitle: string;   // Extracted match name (e.g., "India vs Australia")
  date: number;         // Match date timestamp
  dateString: string;   // Formatted date string for display
  items: SportsContent[];
}

/**
 * Extract the core match name from a title
 * e.g., "India vs Australia - Match 1 - Highlights" -> "India vs Australia"
 * e.g., "PBKS vs CSK Highlights" -> "PBKS vs CSK"
 */
function extractMatchName(title: string): string {
  // Common patterns: "Team A vs Team B", "Team A v Team B", "Team A Vs Team B"
  const vsMatch = title.match(/^([^-]+(?:vs?\.?|Vs\.?)[^-]+)/i);
  if (vsMatch) {
    return vsMatch[1].trim().replace(/\s+/g, ' ');
  }

  // Fallback: take first part before dash/colon
  const parts = title.split(/[-:|]/);
  if (parts.length > 1) {
    return parts[0].trim();
  }

  return title;
}

/**
 * Group sports content by match (based on date and title pattern)
 * Groups items that aired on the same day and have similar titles
 */
export function groupContentByMatch(items: SportsContent[]): MatchGroup[] {
  if (!items.length) return [];

  // Group by date first
  const dateGroups = new Map<string, SportsContent[]>();

  items.forEach(item => {
    if (!item.start_date) {
      // Items without date go to "undated" group
      const key = 'undated';
      if (!dateGroups.has(key)) dateGroups.set(key, []);
      dateGroups.get(key)!.push(item);
      return;
    }

    // Convert timestamp to date string (YYYY-MM-DD)
    const date = new Date(item.start_date * 1000);
    const dateKey = date.toISOString().split('T')[0];

    if (!dateGroups.has(dateKey)) dateGroups.set(dateKey, []);
    dateGroups.get(dateKey)!.push(item);
  });

  // Convert date groups to MatchGroups
  const matchGroups: MatchGroup[] = [];

  dateGroups.forEach((groupItems, dateKey) => {
    // Sort items within group by duration (longer items first - full matches before highlights)
    groupItems.sort((a, b) => (b.duration || 0) - (a.duration || 0));

    // Extract match title from longest/first item
    const matchTitle = extractMatchName(groupItems[0].title);

    // Format date for display
    let dateString = 'Undated';
    let timestamp = 0;
    if (dateKey !== 'undated') {
      const date = new Date(dateKey);
      timestamp = date.getTime() / 1000;
      dateString = date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }

    matchGroups.push({
      id: dateKey,
      matchTitle,
      date: timestamp,
      dateString,
      items: groupItems,
    });
  });

  // Sort groups by date (most recent first)
  matchGroups.sort((a, b) => b.date - a.date);

  return matchGroups;
}

// Helper to create URL-friendly slug
export function sportToSlug(sportName: string): string {
  return sportName.toLowerCase().replace(/\s+/g, '-');
}

// Helper to convert slug back to sport name
export function slugToSport(slug: string): string {
  // Known mappings for special cases (where simple title case won't work)
  const slugMap: Record<string, string> = {
    'esports': 'ESports',
    'formula-1': 'Formula 1',
    'formula-e': 'Formula E',
    'mma': 'Mixed Martial Arts',
  };

  // Check known mappings first
  if (slugMap[slug]) {
    return slugMap[slug];
  }

  // Convert slug back to title case: "pro-kabaddi" -> "Pro Kabaddi"
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
