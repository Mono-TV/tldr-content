/**
 * Fetch all movies page data on server
 * This runs with ISR revalidation
 */

import { fetchContent, fetchMultipleStarMovies } from './server-api';

/**
 * Batch promise factories to avoid overwhelming the API
 * Takes functions that create promises, not promises themselves
 * This prevents all requests from firing simultaneously
 */
async function batchPromises<T>(
  promiseFactories: (() => Promise<T>)[],
  batchSize: number = 20,
  delayMs: number = 50
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < promiseFactories.length; i += batchSize) {
    const batch = promiseFactories.slice(i, i + batchSize);
    console.log(`[ISR] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(promiseFactories.length / batchSize)} (${batch.length} requests)...`);

    try {
      // Execute promise factories in parallel for this batch only
      const batchPromises = batch.map(factory => factory());
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      console.log(`[ISR] Batch ${Math.floor(i / batchSize) + 1} completed successfully`);
    } catch (error) {
      console.error(`[ISR] Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
      // Push empty results to maintain array length
      results.push(...new Array(batch.length).fill({ items: [], total: 0 }));
    }

    // Add delay between batches (except for last batch)
    if (i + batchSize < promiseFactories.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
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

export interface MoviesData {
  // Hero
  featured: any;

  // Top Rated Movies
  topRatedRecent: any;
  topRatedEnglish: any;
  topRatedHindi: any;
  topRatedBengali: any;
  topRatedTamil: any;
  topRatedTelugu: any;
  topRatedMalayalam: any;
  topRatedKannada: any;

  // Top Action Movies
  topAction: any;
  topActionEnglish: any;
  topActionHindi: any;
  topActionTamil: any;
  topActionTelugu: any;
  topActionMalayalam: any;
  topActionKannada: any;
  topActionBengali: any;

  // Top Comedy Movies
  topComedy: any;
  topComedyEnglish: any;
  topComedyHindi: any;
  topComedyTamil: any;
  topComedyTelugu: any;
  topComedyMalayalam: any;
  topComedyKannada: any;
  topComedyBengali: any;

  // Top Drama Movies
  topDrama: any;
  topDramaEnglish: any;
  topDramaHindi: any;
  topDramaTamil: any;
  topDramaTelugu: any;
  topDramaMalayalam: any;
  topDramaKannada: any;
  topDramaBengali: any;

  // Top Thriller Movies
  topThriller: any;
  topThrillerEnglish: any;
  topThrillerHindi: any;
  topThrillerTamil: any;
  topThrillerTelugu: any;
  topThrillerMalayalam: any;
  topThrillerKannada: any;
  topThrillerBengali: any;

  // Latest Star Movies
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
 * Fetch all movies page data in parallel
 * Returns all 48 rows of movie content
 */
export async function fetchMoviesData(): Promise<MoviesData> {
  console.log('[ISR] Fetching movies page data...');
  const startTime = Date.now();

  try {
    const [
      // Hero & Top 10
      featured,
      topRated,

      // Top Rated Movies rows
      topRatedRecent,
      topRatedEnglish,
      topRatedHindi,
      topRatedBengali,
      topRatedTamil,
      topRatedTelugu,
      topRatedMalayalam,
      topRatedKannada,

      // Top Action Movies rows
      topAction,
      topActionEnglish,
      topActionHindi,
      topActionTamil,
      topActionTelugu,
      topActionMalayalam,
      topActionKannada,
      topActionBengali,

      // Top Comedy Movies rows
      topComedy,
      topComedyEnglish,
      topComedyHindi,
      topComedyTamil,
      topComedyTelugu,
      topComedyMalayalam,
      topComedyKannada,
      topComedyBengali,

      // Top Drama Movies rows
      topDrama,
      topDramaEnglish,
      topDramaHindi,
      topDramaTamil,
      topDramaTelugu,
      topDramaMalayalam,
      topDramaKannada,
      topDramaBengali,

      // Top Thriller Movies rows
      topThriller,
      topThrillerEnglish,
      topThrillerHindi,
      topThrillerTamil,
      topThrillerTelugu,
      topThrillerMalayalam,
      topThrillerKannada,
      topThrillerBengali,

      // Latest Star Movies
      hindiStar,
      englishStar,
      tamilStar,
      teluguStar,
      malayalamStar,
      kannadaStar,
      bengaliStar,
    ] = await batchPromises([
      // Hero & Top 10
      () => fetchContent({ min_rating: 8, type: 'movie', sort: 'popularity', order: 'desc', limit: 5 }),
      () => fetchContent({ min_rating: 8, min_votes: 50000, type: 'movie', sort: 'rating', order: 'desc', limit: 10 }),

      // Top Rated Movies rows
      () => fetchContent({ min_rating: 7.5, min_votes: 20000, type: 'movie', year_from: fiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 7.5, min_votes: 20000, type: 'movie', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 7.5, min_votes: 10000, type: 'movie', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 7.0, min_votes: 1000, type: 'movie', original_language: 'bn', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 7.5, min_votes: 5000, type: 'movie', original_language: 'ta', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 7.0, min_votes: 3000, type: 'movie', original_language: 'te', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 7.0, min_votes: 2000, type: 'movie', original_language: 'ml', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 7.0, min_votes: 1500, type: 'movie', original_language: 'kn', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

      // Top Action Movies rows
      () => fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'movie', genre: 'Action', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'movie', genre: 'Action', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.5, min_votes: 5000, type: 'movie', genre: 'Action', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.5, min_votes: 3000, type: 'movie', genre: 'Action', original_language: 'ta', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.5, min_votes: 2000, type: 'movie', genre: 'Action', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.0, min_votes: 1500, type: 'movie', genre: 'Action', original_language: 'ml', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.0, min_votes: 1000, type: 'movie', genre: 'Action', original_language: 'kn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.0, min_votes: 800, type: 'movie', genre: 'Action', original_language: 'bn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

      // Top Comedy Movies rows
      () => fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'movie', genre: 'Comedy', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'movie', genre: 'Comedy', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.5, min_votes: 5000, type: 'movie', genre: 'Comedy', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.5, min_votes: 2000, type: 'movie', genre: 'Comedy', original_language: 'ta', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.0, min_votes: 1500, type: 'movie', genre: 'Comedy', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.0, min_votes: 1000, type: 'movie', genre: 'Comedy', original_language: 'ml', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.0, min_votes: 800, type: 'movie', genre: 'Comedy', original_language: 'kn', year_from: twentyFiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.0, min_votes: 600, type: 'movie', genre: 'Comedy', original_language: 'bn', year_from: twentyFiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

      // Top Drama Movies rows
      () => fetchContent({ min_rating: 7.5, min_votes: 20000, type: 'movie', genre: 'Drama', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 7.5, min_votes: 20000, type: 'movie', genre: 'Drama', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 7.0, min_votes: 5000, type: 'movie', genre: 'Drama', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 7.0, min_votes: 3000, type: 'movie', genre: 'Drama', original_language: 'ta', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.5, min_votes: 2000, type: 'movie', genre: 'Drama', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.5, min_votes: 1500, type: 'movie', genre: 'Drama', original_language: 'ml', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.5, min_votes: 1000, type: 'movie', genre: 'Drama', original_language: 'kn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.5, min_votes: 800, type: 'movie', genre: 'Drama', original_language: 'bn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

      // Top Thriller Movies rows
      () => fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'movie', genre: 'Thriller', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'movie', genre: 'Thriller', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.5, min_votes: 5000, type: 'movie', genre: 'Thriller', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.5, min_votes: 3000, type: 'movie', genre: 'Thriller', original_language: 'ta', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.5, min_votes: 2000, type: 'movie', genre: 'Thriller', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.0, min_votes: 1500, type: 'movie', genre: 'Thriller', original_language: 'ml', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.0, min_votes: 1000, type: 'movie', genre: 'Thriller', original_language: 'kn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      () => fetchContent({ min_rating: 6.0, min_votes: 800, type: 'movie', genre: 'Thriller', original_language: 'bn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

      // Latest Star Movies
      () => fetchMultipleStarMovies(['Rajkummar Rao', 'Varun Dhawan', 'Vicky Kaushal', 'Kartik Aaryan'], 'movie'), // Hindi
      () => fetchMultipleStarMovies(['Dwayne Johnson', 'Chris Hemsworth', 'Tom Cruise', 'Brad Pitt'], 'movie'), // English
      () => fetchMultipleStarMovies(['Dhanush', 'Ajith Kumar', 'Sivakarthikeyan', 'Rajinikanth'], 'movie'), // Tamil
      () => fetchMultipleStarMovies(['Ravi Teja', 'Mahesh Babu', 'Vijay Deverakonda', 'Ram Charan'], 'movie'), // Telugu
      () => fetchMultipleStarMovies(['Mohanlal', 'Mammootty', 'Fahadh Faasil', 'Tovino Thomas'], 'movie'), // Malayalam
      () => fetchMultipleStarMovies(['Sudeep', 'Shiva Rajkumar', 'Rishab Shetty', 'Upendra'], 'movie'), // Kannada
      () => fetchMultipleStarMovies(['Jisshu Sengupta', 'Prosenjit Chatterjee', 'Abir Chatterjee'], 'movie'), // Bengali
    ]);

    const endTime = Date.now();
    console.log(`[ISR] Fetched all movies data in ${endTime - startTime}ms`);

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
    console.error('[ISR] Error fetching movies data:', error);
    throw error;
  }
}
