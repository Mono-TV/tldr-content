/**
 * Progressive loading utilities for Movies and Shows pages
 * Splits data fetching into initial batch (fast) and remaining batch (lazy loaded)
 */

import type { MoviesData } from './fetch-movies-data';
import type { ShowsData } from './fetch-shows-data';

// Define which rows to load initially (first 10 rows for fast page load)
const INITIAL_ROWS_COUNT = 10;

/**
 * Extract first N rows from movies data for initial page load
 */
export function getInitialMoviesData(data: MoviesData): Partial<MoviesData> {
  return {
    featured: data.featured,
    topRatedRecent: data.topRatedRecent,
    topRatedEnglish: data.topRatedEnglish,
    topRatedHindi: data.topRatedHindi,
    topRatedBengali: data.topRatedBengali,
    topRatedTamil: data.topRatedTamil,
    topRatedTelugu: data.topRatedTelugu,
    topRatedMalayalam: data.topRatedMalayalam,
    topRatedKannada: data.topRatedKannada,
    topAction: data.topAction,
    // First 10 rows total
  };
}

/**
 * Extract remaining rows from movies data for lazy loading
 */
export function getRemainingMoviesData(data: MoviesData): Partial<MoviesData> {
  return {
    topActionEnglish: data.topActionEnglish,
    topActionHindi: data.topActionHindi,
    topActionTamil: data.topActionTamil,
    topActionTelugu: data.topActionTelugu,
    topActionMalayalam: data.topActionMalayalam,
    topActionKannada: data.topActionKannada,
    topActionBengali: data.topActionBengali,

    topComedy: data.topComedy,
    topComedyEnglish: data.topComedyEnglish,
    topComedyHindi: data.topComedyHindi,
    topComedyTamil: data.topComedyTamil,
    topComedyTelugu: data.topComedyTelugu,
    topComedyMalayalam: data.topComedyMalayalam,
    topComedyKannada: data.topComedyKannada,
    topComedyBengali: data.topComedyBengali,

    topDrama: data.topDrama,
    topDramaEnglish: data.topDramaEnglish,
    topDramaHindi: data.topDramaHindi,
    topDramaTamil: data.topDramaTamil,
    topDramaTelugu: data.topDramaTelugu,
    topDramaMalayalam: data.topDramaMalayalam,
    topDramaKannada: data.topDramaKannada,
    topDramaBengali: data.topDramaBengali,

    topThriller: data.topThriller,
    topThrillerEnglish: data.topThrillerEnglish,
    topThrillerHindi: data.topThrillerHindi,
    topThrillerTamil: data.topThrillerTamil,
    topThrillerTelugu: data.topThrillerTelugu,
    topThrillerMalayalam: data.topThrillerMalayalam,
    topThrillerKannada: data.topThrillerKannada,
    topThrillerBengali: data.topThrillerBengali,

    hindiStar: data.hindiStar,
    englishStar: data.englishStar,
    tamilStar: data.tamilStar,
    teluguStar: data.teluguStar,
    malayalamStar: data.malayalamStar,
    kannadaStar: data.kannadaStar,
    bengaliStar: data.bengaliStar,

    topRated: data.topRated,
  };
}

/**
 * Extract first N rows from shows data for initial page load
 */
export function getInitialShowsData(data: ShowsData): Partial<ShowsData> {
  return {
    featured: data.featured,
    topRatedRecent: data.topRatedRecent,
    topRatedEnglish: data.topRatedEnglish,
    topRatedHindi: data.topRatedHindi,
    topRatedBengali: data.topRatedBengali,
    topRatedTamil: data.topRatedTamil,
    topRatedTelugu: data.topRatedTelugu,
    topRatedMalayalam: data.topRatedMalayalam,
    topRatedKannada: data.topRatedKannada,
    topAction: data.topAction,
    // First 10 rows total
  };
}

/**
 * Extract remaining rows from shows data for lazy loading
 */
export function getRemainingShowsData(data: ShowsData): Partial<ShowsData> {
  return {
    topActionEnglish: data.topActionEnglish,
    topActionHindi: data.topActionHindi,
    topActionTamil: data.topActionTamil,
    topActionTelugu: data.topActionTelugu,
    topActionMalayalam: data.topActionMalayalam,
    topActionKannada: data.topActionKannada,
    topActionBengali: data.topActionBengali,

    topComedy: data.topComedy,
    topComedyEnglish: data.topComedyEnglish,
    topComedyHindi: data.topComedyHindi,
    topComedyTamil: data.topComedyTamil,
    topComedyTelugu: data.topComedyTelugu,
    topComedyMalayalam: data.topComedyMalayalam,
    topComedyKannada: data.topComedyKannada,
    topComedyBengali: data.topComedyBengali,

    topDrama: data.topDrama,
    topDramaEnglish: data.topDramaEnglish,
    topDramaHindi: data.topDramaHindi,
    topDramaTamil: data.topDramaTamil,
    topDramaTelugu: data.topDramaTelugu,
    topDramaMalayalam: data.topDramaMalayalam,
    topDramaKannada: data.topDramaKannada,
    topDramaBengali: data.topDramaBengali,

    topThriller: data.topThriller,
    topThrillerEnglish: data.topThrillerEnglish,
    topThrillerHindi: data.topThrillerHindi,
    topThrillerTamil: data.topThrillerTamil,
    topThrillerTelugu: data.topThrillerTelugu,
    topThrillerMalayalam: data.topThrillerMalayalam,
    topThrillerKannada: data.topThrillerKannada,
    topThrillerBengali: data.topThrillerBengali,

    hindiStar: data.hindiStar,
    englishStar: data.englishStar,
    tamilStar: data.tamilStar,
    teluguStar: data.teluguStar,
    malayalamStar: data.malayalamStar,
    kannadaStar: data.kannadaStar,
    bengaliStar: data.bengaliStar,

    topRated: data.topRated,
  };
}
