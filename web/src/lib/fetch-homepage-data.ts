/**
 * Fetch homepage data - Mixed trending content
 * Shows a curated mix of movies and TV shows
 */

import { fetchContent } from './server-api';

export interface HomepageData {
  // Hero
  featured: any;

  // Trending sections (mix of movies and shows)
  trending: any;
  topRated: any;

  // Movies preview
  trendingMovies: any;
  topMovies: any;

  // Shows preview
  trendingShows: any;
  topShows: any;
}

/**
 * Fetch homepage data - Simplified trending/featured content
 */
export async function fetchHomepageData(): Promise<HomepageData> {
  console.log('[ISR] Fetching homepage data...');
  const startTime = Date.now();

  try {
    // Fetch all in parallel
    const [
      featured,
      trending,
      topRated,
      trendingMovies,
      topMovies,
      trendingShows,
      topShows,
    ] = await Promise.all([
      // Hero - highly rated popular content (mix)
      fetchContent({ min_rating: 8, sort: 'popularity', order: 'desc', limit: 5 }),

      // Trending - recent popular content (mix)
      fetchContent({ sort: 'popularity', order: 'desc', limit: 15, year_from: new Date().getFullYear() - 2 }),

      // Top Rated - all-time best (mix)
      fetchContent({ min_rating: 8, min_votes: 50000, sort: 'rating', order: 'desc', limit: 15 }),

      // Movies - trending recent movies
      fetchContent({ type: 'movie', sort: 'popularity', order: 'desc', limit: 15, year_from: new Date().getFullYear() - 1 }),

      // Movies - top rated
      fetchContent({ type: 'movie', min_rating: 7.5, min_votes: 20000, sort: 'rating', order: 'desc', limit: 15 }),

      // Shows - trending recent shows
      fetchContent({ type: 'show', sort: 'popularity', order: 'desc', limit: 15, year_from: new Date().getFullYear() - 2 }),

      // Shows - top rated
      fetchContent({ type: 'show', min_rating: 8, min_votes: 20000, sort: 'rating', order: 'desc', limit: 15 }),
    ]);

    const endTime = Date.now();
    console.log(`[ISR] Fetched homepage data in ${endTime - startTime}ms`);

    return {
      featured,
      trending,
      topRated,
      trendingMovies,
      topMovies,
      trendingShows,
      topShows,
    };
  } catch (error) {
    console.error('[ISR] Error fetching homepage data:', error);
    throw error;
  }
}
