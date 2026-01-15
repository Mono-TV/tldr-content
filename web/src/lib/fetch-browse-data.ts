/**
 * Server-side data fetching for Browse page
 * Enables ISR with 5-minute revalidation
 */

import { fetchContent } from './server-api';
import type { Content } from '@/types';

export interface BrowseInitialData {
  items: Content[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const ITEMS_PER_PAGE = 24;

/**
 * Fetch initial browse data on server
 * Used for ISR - cached and revalidated every 5 minutes
 */
export async function fetchBrowseData(): Promise<BrowseInitialData> {
  console.log('[ISR] Fetching browse page initial data...');
  const startTime = Date.now();

  try {
    // Fetch default browse content (top rated, all types)
    const result = await fetchContent({
      sort: 'rating',
      order: 'desc',
      min_rating: 7,
      min_votes: 10000,
      limit: ITEMS_PER_PAGE,
    });

    const endTime = Date.now();
    console.log(`[ISR] Fetched browse data in ${endTime - startTime}ms, ${result.items?.length || 0} items`);

    return {
      items: result.items || [],
      total: result.total || 0,
      pagination: {
        page: 1,
        limit: ITEMS_PER_PAGE,
        total: result.total || 0,
        pages: Math.ceil((result.total || 0) / ITEMS_PER_PAGE),
      },
    };
  } catch (error) {
    console.error('[ISR] Error fetching browse data:', error);
    return {
      items: [],
      total: 0,
      pagination: {
        page: 1,
        limit: ITEMS_PER_PAGE,
        total: 0,
        pages: 0,
      },
    };
  }
}
