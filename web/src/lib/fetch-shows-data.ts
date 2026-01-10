/**
 * Fetch all shows page data on server
 * This runs at build time and every 5 minutes (ISR revalidation)
 */

import { fetchContent, fetchMultipleStarMovies } from './server-api';

/**
 * Helper function to batch promises to avoid overwhelming the API
 * Uses optimized batching for faster builds while respecting rate limits
 */
async function batchPromises<T>(promises: Promise<T>[], batchSize: number = 8): Promise<T[]> {
  const results: T[] = [];
  console.log(`[ISR] Processing ${promises.length} requests in batches of ${batchSize}...`);

  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);

    // Small delay between batches to prevent API rate limiting (200ms)
    if (i + batchSize < promises.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
}

// Year helpers
const currentYear = new Date().getFullYear();
const fiveYearsAgo = currentYear - 5;
const tenYearsAgo = currentYear - 10;
const fifteenYearsAgo = currentYear - 15;
const twentyYearsAgo = currentYear - 20;
const twentyFiveYearsAgo = currentYear - 25;

export interface ShowsData {
  // Hero
  featured: any;

  // Top Rated Shows
  topRatedRecent: any;
  topRatedEnglish: any;
  topRatedHindi: any;
  topRatedBengali: any;
  topRatedTamil: any;
  topRatedTelugu: any;
  topRatedMalayalam: any;
  topRatedKannada: any;

  // Top Action Shows
  topAction: any;
  topActionEnglish: any;
  topActionHindi: any;
  topActionTamil: any;
  topActionTelugu: any;
  topActionMalayalam: any;
  topActionKannada: any;
  topActionBengali: any;

  // Top Comedy Shows
  topComedy: any;
  topComedyEnglish: any;
  topComedyHindi: any;
  topComedyTamil: any;
  topComedyTelugu: any;
  topComedyMalayalam: any;
  topComedyKannada: any;
  topComedyBengali: any;

  // Top Drama Shows
  topDrama: any;
  topDramaEnglish: any;
  topDramaHindi: any;
  topDramaTamil: any;
  topDramaTelugu: any;
  topDramaMalayalam: any;
  topDramaKannada: any;
  topDramaBengali: any;

  // Top Thriller Shows
  topThriller: any;
  topThrillerEnglish: any;
  topThrillerHindi: any;
  topThrillerTamil: any;
  topThrillerTelugu: any;
  topThrillerMalayalam: any;
  topThrillerKannada: any;
  topThrillerBengali: any;

  // Latest Star Shows
  hindiStar: any;
  englishStar: any;
  tamilStar: any;
  teluguStar: any;
  malayalamStar: any;
  kannadaStar: any;
  bengaliStar: any;

  // Top 10
  topRated: any;
}

/**
 * Fetch all shows data in parallel
 * Returns all 48 rows of content
 */
export async function fetchShowsData(): Promise<ShowsData> {
  console.log('[ISR] Fetching shows page data...');
  const startTime = Date.now();

  try {
    const [
      // Hero & Top 10
      featured,
      topRated,

      // Top Rated Shows rows
      topRatedRecent,
      topRatedEnglish,
      topRatedHindi,
      topRatedBengali,
      topRatedTamil,
      topRatedTelugu,
      topRatedMalayalam,
      topRatedKannada,

      // Top Action Shows rows
      topAction,
      topActionEnglish,
      topActionHindi,
      topActionTamil,
      topActionTelugu,
      topActionMalayalam,
      topActionKannada,
      topActionBengali,

      // Top Comedy Shows rows
      topComedy,
      topComedyEnglish,
      topComedyHindi,
      topComedyTamil,
      topComedyTelugu,
      topComedyMalayalam,
      topComedyKannada,
      topComedyBengali,

      // Top Drama Shows rows
      topDrama,
      topDramaEnglish,
      topDramaHindi,
      topDramaTamil,
      topDramaTelugu,
      topDramaMalayalam,
      topDramaKannada,
      topDramaBengali,

      // Top Thriller Shows rows
      topThriller,
      topThrillerEnglish,
      topThrillerHindi,
      topThrillerTamil,
      topThrillerTelugu,
      topThrillerMalayalam,
      topThrillerKannada,
      topThrillerBengali,

      // Latest Star Shows rows
      hindiStar,
      englishStar,
      tamilStar,
      teluguStar,
      malayalamStar,
      kannadaStar,
      bengaliStar,
    ] = await batchPromises([
      // Hero & Top 10
      fetchContent({ min_rating: 8, type: 'show', sort: 'popularity', order: 'desc', limit: 5 }),
      fetchContent({ min_rating: 8, min_votes: 50000, type: 'show', sort: 'rating', order: 'desc', limit: 10 }),

      // Top Rated Shows rows
      fetchContent({ min_rating: 7.5, min_votes: 20000, type: 'show', year_from: fiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.5, min_votes: 20000, type: 'show', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.5, min_votes: 10000, type: 'show', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 1000, type: 'show', original_language: 'bn', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.5, min_votes: 5000, type: 'show', original_language: 'ta', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.5, min_votes: 2000, type: 'show', original_language: 'te', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.5, min_votes: 2000, type: 'show', original_language: 'ml', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.5, min_votes: 2000, type: 'show', original_language: 'kn', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

      // Top Action Shows rows
      fetchContent({ min_rating: 7.5, min_votes: 20000, type: 'show', genre: 'Action', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'show', genre: 'Action', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 5000, type: 'show', genre: 'Action', original_language: 'hi', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 2000, type: 'show', genre: 'Action', original_language: 'ta', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 1000, type: 'show', genre: 'Action', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 1000, type: 'show', genre: 'Action', original_language: 'ml', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 500, type: 'show', genre: 'Action', original_language: 'kn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.0, min_votes: 500, type: 'show', genre: 'Action', original_language: 'bn', year_from: twentyFiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

      // Top Comedy Shows rows
      fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'show', genre: 'Comedy', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'show', genre: 'Comedy', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 5000, type: 'show', genre: 'Comedy', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 1000, type: 'show', genre: 'Comedy', original_language: 'ta', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 1000, type: 'show', genre: 'Comedy', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 1000, type: 'show', genre: 'Comedy', original_language: 'ml', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 500, type: 'show', genre: 'Comedy', original_language: 'kn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.0, min_votes: 500, type: 'show', genre: 'Comedy', original_language: 'bn', year_from: twentyFiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

      // Top Drama Shows rows
      fetchContent({ min_rating: 7.5, min_votes: 20000, type: 'show', genre: 'Drama', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.5, min_votes: 20000, type: 'show', genre: 'Drama', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 10000, type: 'show', genre: 'Drama', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 1000, type: 'show', genre: 'Drama', original_language: 'ta', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 1000, type: 'show', genre: 'Drama', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 1000, type: 'show', genre: 'Drama', original_language: 'ml', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 500, type: 'show', genre: 'Drama', original_language: 'kn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.0, min_votes: 500, type: 'show', genre: 'Drama', original_language: 'bn', year_from: twentyFiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

      // Top Thriller Shows rows
      fetchContent({ min_rating: 7.5, min_votes: 20000, type: 'show', genre: 'Thriller', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'show', genre: 'Thriller', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 5000, type: 'show', genre: 'Thriller', original_language: 'hi', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 1000, type: 'show', genre: 'Thriller', original_language: 'ta', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 1000, type: 'show', genre: 'Thriller', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 1000, type: 'show', genre: 'Thriller', original_language: 'ml', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 500, type: 'show', genre: 'Thriller', original_language: 'kn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.0, min_votes: 500, type: 'show', genre: 'Thriller', original_language: 'bn', year_from: twentyFiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

      // Latest Star Shows rows (using same actors as movies for now - can be adjusted)
      fetchMultipleStarMovies(['Rajkummar Rao', 'Varun Dhawan', 'Vicky Kaushal', 'Kartik Aaryan'], 'show'),
      fetchMultipleStarMovies(['Bryan Cranston', 'Pedro Pascal', 'Millie Bobby Brown', 'Henry Cavill'], 'show'),
      fetchMultipleStarMovies(['Dhanush', 'Ajith Kumar', 'Sivakarthikeyan', 'Rajinikanth'], 'show'),
      fetchMultipleStarMovies(['Ravi Teja', 'Mahesh Babu', 'Vijay Deverakonda', 'Ram Charan'], 'show'),
      fetchMultipleStarMovies(['Mohanlal', 'Mammootty', 'Fahadh Faasil', 'Tovino Thomas'], 'show'),
      fetchMultipleStarMovies(['Sudeep', 'Shiva Rajkumar', 'Rishab Shetty', 'Upendra'], 'show'),
      fetchMultipleStarMovies(['Jisshu Sengupta', 'Prosenjit Chatterjee', 'Abir Chatterjee'], 'show'),
    ]);

    const endTime = Date.now();
    console.log(`[ISR] Fetched all shows data in ${endTime - startTime}ms`);

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
      topActionEnglish,
      topActionHindi,
      topActionTamil,
      topActionTelugu,
      topActionMalayalam,
      topActionKannada,
      topActionBengali,

      topComedy,
      topComedyEnglish,
      topComedyHindi,
      topComedyTamil,
      topComedyTelugu,
      topComedyMalayalam,
      topComedyKannada,
      topComedyBengali,

      topDrama,
      topDramaEnglish,
      topDramaHindi,
      topDramaTamil,
      topDramaTelugu,
      topDramaMalayalam,
      topDramaKannada,
      topDramaBengali,

      topThriller,
      topThrillerEnglish,
      topThrillerHindi,
      topThrillerTamil,
      topThrillerTelugu,
      topThrillerMalayalam,
      topThrillerKannada,
      topThrillerBengali,

      hindiStar,
      englishStar,
      tamilStar,
      teluguStar,
      malayalamStar,
      kannadaStar,
      bengaliStar,

      topRated,
    };
  } catch (error) {
    console.error('[ISR] Error fetching shows data:', error);
    throw error;
  }
}
