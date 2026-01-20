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
