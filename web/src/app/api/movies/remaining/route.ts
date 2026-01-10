import { NextResponse } from 'next/server';
import { fetchMoviesData } from '@/lib/fetch-movies-data';
import { getRemainingMoviesData } from '@/lib/progressive-loading';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

// Enable route caching with revalidation
export const revalidate = 300; // 5 minutes

/**
 * API route to fetch remaining movies data (rows 11-48)
 * Used for progressive loading after initial page render
 */
export async function GET() {
  try {
    console.log('[API] Fetching remaining movies data...');
    const startTime = Date.now();

    // Fetch all data
    const allData = await fetchMoviesData();

    // Extract only remaining rows
    const remainingData = getRemainingMoviesData(allData);

    const endTime = Date.now();
    console.log(`[API] Remaining movies data fetched in ${endTime - startTime}ms`);

    return NextResponse.json(remainingData);
  } catch (error) {
    console.error('[API] Error fetching remaining movies data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch remaining movies data' },
      { status: 500 }
    );
  }
}
