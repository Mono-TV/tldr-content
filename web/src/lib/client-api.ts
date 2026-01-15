/**
 * Client-side API utilities for prefetching
 *
 * These functions are designed to be called from client components
 * to prefetch data for routes before navigation.
 *
 * Unlike server-api.ts (which uses Next.js fetch with revalidate),
 * these use standard fetch for client-side prefetching into React Query cache.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://content-api-401132033262.asia-south1.run.app';

interface ContentFilters {
  min_rating?: number;
  min_votes?: number;
  type?: string;
  genre?: string;
  original_language?: string;
  year_from?: number;
  year_to?: number;
  sort?: string;
  order?: string;
  limit?: number;
}

interface ContentResponse {
  items: any[];
  total: number;
}

// Year helpers
const currentYear = new Date().getFullYear();
const fiveYearsAgo = currentYear - 5;
const tenYearsAgo = currentYear - 10;
const fifteenYearsAgo = currentYear - 15;

/**
 * Fetch content from API with filters (client-side)
 */
async function fetchContentClient(filters: ContentFilters): Promise<ContentResponse> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const url = `${API_BASE_URL}/api/content?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[Prefetch] API error: ${response.status} for ${url}`);
      return { items: [], total: 0 };
    }

    const data = await response.json();
    return {
      items: data.content || data.items || [],
      total: data.pagination?.total || data.total || 0,
    };
  } catch (error) {
    console.error('[Prefetch] Failed to fetch content:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Search content with query (client-side)
 */
async function searchContentClient(
  query: string,
  filters: ContentFilters
): Promise<ContentResponse> {
  const params = new URLSearchParams({ q: query });

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const url = `${API_BASE_URL}/api/search?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return { items: [], total: 0 };
    }

    const data = await response.json();
    return {
      items: data.items || [],
      total: data.total || 0,
    };
  } catch (error) {
    console.error('[Prefetch] Failed to search content:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Critical Movies Data - 10 above-the-fold rows
 * This mirrors the server-side fetchCriticalMoviesData but runs on client
 */
export interface CriticalMoviesData {
  featured: ContentResponse;
  topRatedRecent: ContentResponse;
  topRatedEnglish: ContentResponse;
  topRatedHindi: ContentResponse;
  topRatedBengali: ContentResponse;
  topRatedTamil: ContentResponse;
  topRatedTelugu: ContentResponse;
  topRatedMalayalam: ContentResponse;
  topRatedKannada: ContentResponse;
  topAction: ContentResponse;
}

/**
 * Fetch critical movies data for prefetching
 * Only fetches the first 10 rows (above-the-fold)
 */
export async function prefetchCriticalMoviesData(): Promise<CriticalMoviesData> {
  console.log('[Prefetch] Prefetching critical movies data...');
  const startTime = Date.now();

  const [
    featured,
    topRatedRecent,
    topRatedEnglish,
    topRatedHindi,
    topRatedBengali,
    topRatedTamil,
    topRatedTelugu,
    topRatedMalayalam,
    topRatedKannada,
    topAction,
  ] = await Promise.all([
    fetchContentClient({ min_rating: 8, type: 'movie', sort: 'popularity', order: 'desc', limit: 5 }),
    fetchContentClient({ min_rating: 7.5, min_votes: 20000, type: 'movie', year_from: fiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
    fetchContentClient({ min_rating: 7.5, min_votes: 20000, type: 'movie', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
    fetchContentClient({ min_rating: 7.5, min_votes: 10000, type: 'movie', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
    fetchContentClient({ min_rating: 7.0, min_votes: 1000, type: 'movie', original_language: 'bn', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
    fetchContentClient({ min_rating: 7.5, min_votes: 5000, type: 'movie', original_language: 'ta', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
    fetchContentClient({ min_rating: 7.0, min_votes: 3000, type: 'movie', original_language: 'te', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
    fetchContentClient({ min_rating: 7.0, min_votes: 2000, type: 'movie', original_language: 'ml', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
    fetchContentClient({ min_rating: 7.0, min_votes: 1500, type: 'movie', original_language: 'kn', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
    fetchContentClient({ min_rating: 7.0, min_votes: 20000, type: 'movie', genre: 'Action', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
  ]);

  const endTime = Date.now();
  console.log(`[Prefetch] Prefetched critical movies data in ${endTime - startTime}ms`);

  return {
    featured,
    topRatedRecent,
    topRatedEnglish,
    topRatedHindi,
    topRatedBengali,
    topRatedTamil,
    topRatedTelugu,
    topRatedMalayalam,
    topRatedKannada,
    topAction,
  };
}

/**
 * Critical Shows Data - 10 above-the-fold rows
 */
export interface CriticalShowsData {
  featured: ContentResponse;
  topRatedRecent: ContentResponse;
  topRatedEnglish: ContentResponse;
  topRatedHindi: ContentResponse;
  topRatedBengali: ContentResponse;
  topRatedTamil: ContentResponse;
  topRatedTelugu: ContentResponse;
  topRatedMalayalam: ContentResponse;
  topRatedKannada: ContentResponse;
  topAction: ContentResponse;
}

/**
 * Fetch critical shows data for prefetching
 * Only fetches the first 10 rows (above-the-fold)
 */
export async function prefetchCriticalShowsData(): Promise<CriticalShowsData> {
  console.log('[Prefetch] Prefetching critical shows data...');
  const startTime = Date.now();

  const [
    featured,
    topRatedRecent,
    topRatedEnglish,
    topRatedHindi,
    topRatedBengali,
    topRatedTamil,
    topRatedTelugu,
    topRatedMalayalam,
    topRatedKannada,
    topAction,
  ] = await Promise.all([
    fetchContentClient({ min_rating: 8, type: 'show', sort: 'popularity', order: 'desc', limit: 5 }),
    fetchContentClient({ min_rating: 7.5, min_votes: 20000, type: 'show', year_from: fiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
    fetchContentClient({ min_rating: 7.5, min_votes: 20000, type: 'show', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
    fetchContentClient({ min_rating: 7.5, min_votes: 10000, type: 'show', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
    fetchContentClient({ min_rating: 6.5, min_votes: 300, type: 'show', original_language: 'bn', sort: 'rating', order: 'desc', limit: 15 }),
    fetchContentClient({ min_rating: 7.0, min_votes: 2000, type: 'show', original_language: 'ta', sort: 'rating', order: 'desc', limit: 15 }),
    fetchContentClient({ min_rating: 7.0, min_votes: 1000, type: 'show', original_language: 'te', sort: 'rating', order: 'desc', limit: 15 }),
    fetchContentClient({ min_rating: 6.5, min_votes: 500, type: 'show', original_language: 'ml', sort: 'rating', order: 'desc', limit: 15 }),
    fetchContentClient({ min_rating: 6.5, min_votes: 300, type: 'show', original_language: 'kn', sort: 'rating', order: 'desc', limit: 15 }),
    fetchContentClient({ min_rating: 7.5, min_votes: 20000, type: 'show', genre: 'Action', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
  ]);

  const endTime = Date.now();
  console.log(`[Prefetch] Prefetched critical shows data in ${endTime - startTime}ms`);

  return {
    featured,
    topRatedRecent,
    topRatedEnglish,
    topRatedHindi,
    topRatedBengali,
    topRatedTamil,
    topRatedTelugu,
    topRatedMalayalam,
    topRatedKannada,
    topAction,
  };
}
