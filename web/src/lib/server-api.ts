/**
 * Server-side API utilities for ISR data fetching
 * These functions run on the server during build time and revalidation
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://content-api-401132033262.asia-south1.run.app';

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
  content?: any[];
  items?: any[];
  total?: number;
  pagination?: {
    page: number;
    pages: number;
    total: number;
  };
}

/**
 * Fetch content from API with filters
 * Includes retry logic with exponential backoff for rate limiting
 */
export async function fetchContent(filters: ContentFilters, retryCount = 0, maxRetries = 3): Promise<ContentResponse> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const url = `${API_BASE_URL}/api/content?${params.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    // Handle rate limiting with exponential backoff
    if (response.status === 429 && retryCount < maxRetries) {
      const backoffMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      console.log(`[ISR] Rate limited, retrying in ${backoffMs}ms (attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      return fetchContent(filters, retryCount + 1, maxRetries);
    }

    if (!response.ok) {
      console.error(`API error: ${response.status} for ${url}`);
      return { items: [], total: 0 };
    }

    const data = await response.json();
    return {
      items: data.content || data.items || [],
      total: data.pagination?.total || data.total || 0,
    };
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Fetch multiple content queries in parallel
 * Used to fetch all homepage rows efficiently
 */
export async function fetchMultipleContent(
  queries: Array<{ key: string; filters: ContentFilters }>
): Promise<Record<string, ContentResponse>> {
  const results = await Promise.all(
    queries.map(async ({ key, filters }) => {
      const data = await fetchContent(filters);
      return { key, data };
    })
  );

  return results.reduce((acc, { key, data }) => {
    acc[key] = data;
    return acc;
  }, {} as Record<string, ContentResponse>);
}

/**
 * Search with filters (for multi-actor rows)
 */
export async function searchWithFilters(
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
    const response = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return { items: [], total: 0 };
    }

    const data = await response.json();
    return {
      items: data.items || [],
      total: data.total || 0,
    };
  } catch (error) {
    console.error('Failed to search content:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Fetch and merge content from multiple stars (for Latest Star Movies/Shows rows)
 */
export async function fetchMultipleStarMovies(stars: string[], contentType: 'movie' | 'show' = 'movie'): Promise<ContentResponse> {
  const fiveYearsAgo = new Date().getFullYear() - 5;

  const results = await Promise.all(
    stars.map(star =>
      searchWithFilters(star, {
        type: contentType,
        year_from: fiveYearsAgo,
        sort: 'rating',
        order: 'desc',
        limit: 8,
      })
    )
  );

  // Merge and deduplicate by imdb_id
  const allContent = results.flatMap(r => r.items || []);
  const uniqueContent = Array.from(
    new Map(allContent.map(item => [item.imdb_id, item])).values()
  );

  // Sort by rating, votes, and date
  const sortedContent = uniqueContent.sort((a, b) => {
    const ratingA = a.imdb_rating ?? 0;
    const ratingB = b.imdb_rating ?? 0;
    const votesA = a.imdb_rating_count ?? 0;
    const votesB = b.imdb_rating_count ?? 0;

    if (ratingB !== ratingA) return ratingB - ratingA;
    if (votesB !== votesA) return votesB - votesA;

    const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
    const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
    return dateB - dateA;
  });

  return {
    items: sortedContent.slice(0, 15),
    total: sortedContent.length,
  };
}
