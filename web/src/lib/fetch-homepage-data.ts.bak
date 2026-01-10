/**
 * Fetch all homepage data on server
 * This runs at build time and every 5 minutes (ISR revalidation)
 */

import { fetchContent, fetchMultipleStarMovies } from './server-api';

/**
 * Batch promises to avoid overwhelming the API
 * Processes promises in groups with delays between batches
 */
async function batchPromises<T>(
  promises: Promise<T>[],
  batchSize: number = 10,
  delayMs: number = 100
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    console.log(`[ISR] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(promises.length / batchSize)} (${batch.length} requests)...`);

    const batchResults = await Promise.all(batch);
    results.push(...batchResults);

    // Add delay between batches (except for last batch)
    if (i + batchSize < promises.length) {
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

export interface HomepageData {
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
 * Fetch all homepage data in parallel
 * Returns all 48 rows of content
 */
export async function fetchHomepageData(): Promise<HomepageData> {
  console.log('[ISR] Fetching homepage data...');
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

      // Latest Star Movies rows
      hindiStar,
      englishStar,
      tamilStar,
      teluguStar,
      malayalamStar,
      kannadaStar,
      bengaliStar,
    ] = await batchPromises([
      // Hero & Top 10
      fetchContent({ min_rating: 8, sort: 'popularity', order: 'desc', limit: 5 }),
      fetchContent({ min_rating: 8, min_votes: 100000, type: 'movie', sort: 'rating', order: 'desc', limit: 10 }),

      // Top Rated Movies rows
      fetchContent({ min_rating: 8, min_votes: 50000, type: 'movie', year_from: fiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 8, min_votes: 50000, type: 'movie', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 8, min_votes: 50000, type: 'movie', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.5, min_votes: 2000, type: 'movie', original_language: 'bn', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 8, min_votes: 15000, type: 'movie', original_language: 'ta', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 8, min_votes: 5000, type: 'movie', original_language: 'te', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 8, min_votes: 5000, type: 'movie', original_language: 'ml', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 8, min_votes: 5000, type: 'movie', original_language: 'kn', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

      // Top Action Movies rows
      fetchContent({ min_rating: 8, min_votes: 50000, type: 'movie', genre: 'Action', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.5, min_votes: 50000, type: 'movie', genre: 'Action', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.5, min_votes: 10000, type: 'movie', genre: 'Action', original_language: 'hi', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 8, min_votes: 15000, type: 'movie', genre: 'Action', original_language: 'ta', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.5, min_votes: 2000, type: 'movie', genre: 'Action', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 2000, type: 'movie', genre: 'Action', original_language: 'ml', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 1000, type: 'movie', genre: 'Action', original_language: 'kn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 500, type: 'movie', genre: 'Action', original_language: 'bn', year_from: twentyFiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

      // Top Comedy Movies rows
      fetchContent({ min_rating: 7.5, min_votes: 50000, type: 'movie', genre: 'Comedy', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.5, min_votes: 50000, type: 'movie', genre: 'Comedy', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.5, min_votes: 10000, type: 'movie', genre: 'Comedy', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 2000, type: 'movie', genre: 'Comedy', original_language: 'ta', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 2000, type: 'movie', genre: 'Comedy', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 2000, type: 'movie', genre: 'Comedy', original_language: 'ml', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 1000, type: 'movie', genre: 'Comedy', original_language: 'kn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 500, type: 'movie', genre: 'Comedy', original_language: 'bn', year_from: twentyFiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

      // Top Drama Movies rows
      fetchContent({ min_rating: 8, min_votes: 50000, type: 'movie', genre: 'Drama', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 8, min_votes: 50000, type: 'movie', genre: 'Drama', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.5, min_votes: 50000, type: 'movie', genre: 'Drama', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 2000, type: 'movie', genre: 'Drama', original_language: 'ta', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 2000, type: 'movie', genre: 'Drama', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 2000, type: 'movie', genre: 'Drama', original_language: 'ml', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 1000, type: 'movie', genre: 'Drama', original_language: 'kn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 500, type: 'movie', genre: 'Drama', original_language: 'bn', year_from: twentyFiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

      // Top Thriller Movies rows
      fetchContent({ min_rating: 8, min_votes: 50000, type: 'movie', genre: 'Thriller', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.5, min_votes: 50000, type: 'movie', genre: 'Thriller', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.5, min_votes: 10000, type: 'movie', genre: 'Thriller', original_language: 'hi', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 2000, type: 'movie', genre: 'Thriller', original_language: 'ta', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 2000, type: 'movie', genre: 'Thriller', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 2000, type: 'movie', genre: 'Thriller', original_language: 'ml', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 7.0, min_votes: 1000, type: 'movie', genre: 'Thriller', original_language: 'kn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
      fetchContent({ min_rating: 6.5, min_votes: 500, type: 'movie', genre: 'Thriller', original_language: 'bn', year_from: twentyFiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

      // Latest Star Movies rows
      fetchMultipleStarMovies(['Rajkummar Rao', 'Varun Dhawan', 'Vicky Kaushal', 'Kartik Aaryan']),
      fetchMultipleStarMovies(['Dwayne Johnson', 'Chris Hemsworth', 'Tom Cruise', 'Brad Pitt']),
      fetchMultipleStarMovies(['Dhanush', 'Ajith Kumar', 'Sivakarthikeyan', 'Rajinikanth']),
      fetchMultipleStarMovies(['Ravi Teja', 'Mahesh Babu', 'Vijay Deverakonda', 'Ram Charan']),
      fetchMultipleStarMovies(['Mohanlal', 'Mammootty', 'Fahadh Faasil', 'Tovino Thomas']),
      fetchMultipleStarMovies(['Sudeep', 'Shiva Rajkumar', 'Rishab Shetty', 'Upendra']),
      fetchMultipleStarMovies(['Jisshu Sengupta', 'Prosenjit Chatterjee', 'Abir Chatterjee']),
    ]);

    const endTime = Date.now();
    console.log(`[ISR] Fetched all homepage data in ${endTime - startTime}ms`);

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
    console.error('[ISR] Error fetching homepage data:', error);
    throw error;
  }
}
