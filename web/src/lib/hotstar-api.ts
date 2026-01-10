/**
 * Hotstar (JioHotstar) API Client
 *
 * Provides utilities for fetching content from Hotstar's catalog API
 * Documentation: See HOTSTAR_API.md in project root
 *
 * @requires Environment variables in .env.local
 */

// Types
export interface HotstarConfig {
  partnerId: string;
  partnerName: string;
  baseUrl: string;
  token: string;
  headers: Record<string, string>;
}

export interface HotstarApiOptions {
  orderBy?: 'contentId' | 'startDate';
  order?: 'asc' | 'desc';
  offset?: number;
  size?: number;
  premium?: boolean;
  live?: boolean;
  fromStartDate?: number;
  toStartDate?: number;
  fromUpdateDate?: number;
  toUpdateDate?: number;
}

export interface HotstarResponse<T = any> {
  body: {
    results: {
      items: T[];
      totalResults: number;
      offset: number;
      size: number;
      nextOffsetURL?: string;
      totalPageResults: number;
      totalPages: number;
    };
  };
  statusCode: string;
  statusCodeValue: number;
}

export interface HotstarContent {
  id: number;
  contentId: string;
  title: string;
  description?: string;
  contentType: 'MOVIE' | 'SHOW' | 'EPISODE' | 'MATCH';
  genre?: string[];
  lang?: string[];
  premium: boolean;
  vip: boolean;
  startDate: number;
  endDate: number;
  images: {
    url: string;
    transformation: string;
    type: 'HORIZONTAL' | 'VERTICAL';
  }[];
  thumbnail: string;
  deepLinkUrl: string;
  actors?: string[];
  directors?: string[];
  updateDate: number;
}

// Get configuration from environment variables
function getHotstarConfig(): HotstarConfig {
  const partnerId = process.env.HOTSTAR_PARTNER_ID || '92837456123';
  const partnerName = process.env.HOTSTAR_PARTNER_NAME || '92837456123';

  return {
    partnerId,
    partnerName,
    baseUrl: process.env.HOTSTAR_API_BASE_URL || 'https://pp-catalog-api.hotstar.com',
    token: process.env.HOTSTAR_TOKEN || '',
    headers: {
      'x-country-code': process.env.HOTSTAR_COUNTRY_CODE || 'in',
      'x-platform-code': process.env.HOTSTAR_PLATFORM_CODE || 'ANDROID',
      'x-partner-name': partnerName,
      'x-region-code': process.env.HOTSTAR_REGION_CODE || 'DL',
      'x-client-code': process.env.HOTSTAR_CLIENT_CODE || 'pt',
    },
  };
}

// Build query string from options
function buildQueryString(options: HotstarApiOptions, partnerId: string): string {
  const params = new URLSearchParams();

  // Add partner ID (required)
  params.append('partner', partnerId);

  // Add optional parameters
  if (options.orderBy) params.append('orderBy', options.orderBy);
  if (options.order) params.append('order', options.order);
  if (options.offset !== undefined) params.append('offset', options.offset.toString());
  if (options.size) params.append('size', options.size.toString());
  if (options.premium !== undefined) params.append('premium', options.premium.toString());
  if (options.live !== undefined) params.append('live', options.live.toString());
  if (options.fromStartDate) params.append('fromStartDate', options.fromStartDate.toString());
  if (options.toStartDate) params.append('toStartDate', options.toStartDate.toString());
  if (options.fromUpdateDate) params.append('fromUpdateDate', options.fromUpdateDate.toString());
  if (options.toUpdateDate) params.append('toUpdateDate', options.toUpdateDate.toString());

  return params.toString();
}

// Generic fetch function for Hotstar API
async function fetchHotstar<T = HotstarContent>(
  endpoint: string,
  options: HotstarApiOptions = {}
): Promise<HotstarResponse<T>> {
  const config = getHotstarConfig();

  if (!config.token) {
    throw new Error('HOTSTAR_TOKEN environment variable is not set');
  }

  const queryString = buildQueryString(options, config.partnerId);
  const url = `${config.baseUrl}${endpoint}?${queryString}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...config.headers,
      hdnea: config.token,
    },
    next: { revalidate: 300 }, // Cache for 5 minutes (ISR)
  });

  if (!response.ok) {
    throw new Error(`Hotstar API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// API Methods

/**
 * Fetch movies from Hotstar
 * @param options Query options (orderBy, order, offset, size, etc.)
 * @returns HotstarResponse with movie items
 */
export async function fetchMovies(
  options: HotstarApiOptions = {}
): Promise<HotstarResponse<HotstarContent>> {
  return fetchHotstar('/movie/search', {
    orderBy: 'contentId',
    order: 'desc',
    size: 20,
    ...options,
  });
}

/**
 * Fetch TV shows from Hotstar
 * @param options Query options
 * @returns HotstarResponse with show items
 */
export async function fetchShows(
  options: HotstarApiOptions = {}
): Promise<HotstarResponse<HotstarContent>> {
  return fetchHotstar('/show/search', {
    orderBy: 'contentId',
    order: 'desc',
    size: 20,
    ...options,
  });
}

/**
 * Fetch seasons by show ID
 * @param showId The show ID (not contentId)
 * @param options Query options
 * @returns HotstarResponse with season items
 */
export async function fetchSeasons(
  showId: number,
  options: Omit<HotstarApiOptions, 'orderBy'> = {}
): Promise<HotstarResponse<HotstarContent>> {
  const config = getHotstarConfig();
  const params = new URLSearchParams();

  params.append('showId', showId.toString());
  params.append('partner', config.partnerId);
  params.append('order', options.order || 'desc');
  params.append('offset', (options.offset || 0).toString());
  params.append('size', (options.size || 100).toString());

  const url = `${config.baseUrl}/season/search?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...config.headers,
      hdnea: config.token,
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Hotstar API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch episodes from Hotstar
 * @param options Query options (can filter by showId)
 * @returns HotstarResponse with episode items
 */
export async function fetchEpisodes(
  options: HotstarApiOptions = {}
): Promise<HotstarResponse<HotstarContent>> {
  return fetchHotstar('/episode/search', {
    orderBy: 'contentId',
    order: 'desc',
    size: 20,
    ...options,
  });
}

/**
 * Fetch sports matches (live or VoD)
 * @param options Query options (use live: true for live matches)
 * @returns HotstarResponse with match items
 */
export async function fetchMatches(
  options: HotstarApiOptions = {}
): Promise<HotstarResponse<HotstarContent>> {
  return fetchHotstar('/match/search', {
    orderBy: 'startDate',
    order: 'desc',
    size: 20,
    live: false,
    ...options,
  });
}

/**
 * Fetch channel list
 * @param options Query options
 * @returns HotstarResponse with channel items
 */
export async function fetchChannels(
  options: HotstarApiOptions = {}
): Promise<HotstarResponse<any>> {
  return fetchHotstar('/channel/list', {
    orderBy: 'contentId',
    order: 'desc',
    size: 1000,
    ...options,
  });
}

/**
 * Fetch incremental updates (content updated within a time window)
 * Useful for polling changes every 4 hours
 * @param fromDate Start timestamp (epoch seconds)
 * @param toDate End timestamp (epoch seconds)
 * @param contentType Content type to fetch ('movie' | 'show' | 'episode' | 'match')
 * @param options Additional query options
 * @returns HotstarResponse with updated items
 */
export async function fetchIncrementalUpdates(
  fromDate: number,
  toDate: number,
  contentType: 'movie' | 'show' | 'episode' | 'match' = 'movie',
  options: HotstarApiOptions = {}
): Promise<HotstarResponse<HotstarContent>> {
  return fetchHotstar(`/${contentType}/search`, {
    orderBy: 'contentId',
    order: 'desc',
    fromUpdateDate: fromDate,
    toUpdateDate: toDate,
    size: 1000,
    ...options,
  });
}

// Export config getter for debugging
export { getHotstarConfig };
