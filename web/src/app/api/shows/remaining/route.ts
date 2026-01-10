import { NextResponse } from 'next/server';
import { fetchShowsData } from '@/lib/fetch-shows-data';
import { getRemainingShowsData } from '@/lib/progressive-loading';

/**
 * API route to fetch remaining shows data (rows 11-48)
 * Used for progressive loading after initial page render
 */
export async function GET() {
  try {
    console.log('[API] Fetching remaining shows data...');
    const startTime = Date.now();

    // Fetch all data
    const allData = await fetchShowsData();

    // Extract only remaining rows
    const remainingData = getRemainingShowsData(allData);

    const endTime = Date.now();
    console.log(`[API] Remaining shows data fetched in ${endTime - startTime}ms`);

    return NextResponse.json(remainingData);
  } catch (error) {
    console.error('[API] Error fetching remaining shows data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch remaining shows data' },
      { status: 500 }
    );
  }
}

// Enable route caching with revalidation
export const revalidate = 300; // 5 minutes
