/**
 * Server-side sports data fetching for ISR
 * Fetches directly from MongoDB
 */

import { MongoClient, Db } from 'mongodb';
import type { SportsContent, SportsResponse } from '@/types/sports';

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || '';
const DB_NAME = process.env.DB_NAME || 'content_db';
const COLLECTION_NAME = 'hotstar_sports';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function getDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  if (!MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  const client = new MongoClient(MONGO_URI);
  await client.connect();

  cachedClient = client;
  cachedDb = client.db(DB_NAME);

  return cachedDb;
}

interface FetchSportsOptions {
  game_name?: string;
  asset_status?: 'PUBLISHED' | 'UNPUBLISHED';
  live?: boolean;
  lang?: string;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Fetch sports content from MongoDB
 */
export async function fetchSportsContent(options: FetchSportsOptions = {}): Promise<SportsResponse> {
  try {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    // Build query
    const query: Record<string, any> = {
      // Exclude test/automation content
      title: { $not: /automation|test/i },
    };

    if (options.asset_status) {
      query.asset_status = options.asset_status;
    }

    if (options.game_name) {
      query.game_name = options.game_name;
    }

    if (options.live !== undefined) {
      query.live = options.live;
    }

    if (options.lang) {
      query.lang = options.lang;
    }

    // Build sort
    const sortField = options.sort || 'start_date';
    const sortOrder = options.order === 'asc' ? 1 : -1;

    const limit = options.limit || 15;

    const items = await collection
      .find(query)
      .sort({ [sortField]: sortOrder })
      .limit(limit)
      .toArray();

    // Transform MongoDB documents to SportsContent
    const transformedItems: SportsContent[] = items.map((item) => ({
      _id: item._id.toString(),
      content_id: item.content_id,
      hotstar_id: item.hotstar_id,
      title: item.title,
      description: item.description,
      game_name: item.game_name,
      genre: item.genre,
      tournament_id: item.tournament_id,
      tournament_name: item.tournament_name,
      sports_season_id: item.sports_season_id,
      sports_season_name: item.sports_season_name,
      start_date: item.start_date,
      end_date: item.end_date,
      duration: item.duration,
      live: item.live,
      asset_status: item.asset_status,
      premium: item.premium,
      vip: item.vip,
      lang: item.lang,
      thumbnail: item.thumbnail,
      source_images: item.source_images,
      deep_link_url: item.deep_link_url,
      locators: item.locators,
      search_keywords: item.search_keywords,
      created_at: item.created_at,
      updated_at: item.updated_at,
      last_synced_at: item.last_synced_at,
    }));

    return {
      items: transformedItems,
      total: transformedItems.length,
    };
  } catch (error) {
    console.error('[Sports] Error fetching sports content:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Sports data interface for page
 */
export interface SportsPageData {
  // Hero - Featured/Live content
  featured: SportsResponse;

  // By Sport Type
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

  // Recent content
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
      // Featured - Recent published content (hero carousel)
      fetchSportsContent({ asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 5 }),

      // Cricket
      fetchSportsContent({ game_name: 'Cricket', asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 15 }),

      // Football
      fetchSportsContent({ game_name: 'Football', asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 15 }),

      // Tennis
      fetchSportsContent({ game_name: 'Tennis', asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 15 }),

      // Kabaddi
      fetchSportsContent({ game_name: 'Kabaddi', asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 15 }),

      // Badminton
      fetchSportsContent({ game_name: 'Badminton', asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 15 }),

      // Hockey
      fetchSportsContent({ game_name: 'Hockey', asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 15 }),

      // Esports
      fetchSportsContent({ game_name: 'ESports', asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 15 }),

      // Formula 1
      fetchSportsContent({ game_name: 'Formula 1', asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 15 }),

      // MMA
      fetchSportsContent({ game_name: 'Mixed Martial Arts', asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 15 }),

      // Table Tennis
      fetchSportsContent({ game_name: 'Table Tennis', asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 15 }),

      // American Football
      fetchSportsContent({ game_name: 'American Football', asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 15 }),

      // Athletics
      fetchSportsContent({ game_name: 'Athletics', asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 15 }),

      // Recent All (for variety)
      fetchSportsContent({ asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 20 }),
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
      fetchSportsContent({ asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 5 }),
      fetchSportsContent({ game_name: 'Cricket', asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 15 }),
      fetchSportsContent({ game_name: 'Football', asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 15 }),
      fetchSportsContent({ game_name: 'Kabaddi', asset_status: 'PUBLISHED', sort: 'start_date', order: 'desc', limit: 15 }),
    ]);

    const endTime = Date.now();
    console.log(`[ISR] Fetched critical sports data in ${endTime - startTime}ms`);

    return { featured, cricket, football, kabaddi };
  } catch (error) {
    console.error('[ISR] Error fetching critical sports data:', error);
    throw error;
  }
}
