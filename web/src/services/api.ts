import type { Content, PaginatedResponse, SearchResponse, ContentFilters, Stats, YearRange } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://content-api-401132033262.asia-south1.run.app';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Transform API response to add total at root level
function transformPaginatedResponse<T>(response: { items: T[]; pagination: { total: number; page: number; limit: number; pages: number } }): PaginatedResponse<T> {
  return {
    ...response,
    total: response.pagination.total,
  };
}

export const api = {
  // Get content list with filters
  getContent: async (filters: ContentFilters = {}): Promise<PaginatedResponse<Content>> => {
    const query = buildQueryString(filters as Record<string, string | number | undefined>);
    const response = await fetchAPI<{ items: Content[]; pagination: { total: number; page: number; limit: number; pages: number } }>(`/api/content${query}`);
    return transformPaginatedResponse(response);
  },

  // Get single content by ID
  getContentById: async (id: string): Promise<Content> => {
    return fetchAPI<Content>(`/api/content/${id}`);
  },

  // Search content
  search: async (query: string, limit: number = 20): Promise<SearchResponse> => {
    const params = { q: query, limit };
    const queryString = buildQueryString(params as Record<string, string | number | undefined>);
    const response = await fetchAPI<{ items: Content[]; pagination: { total: number; page: number; limit: number; pages: number }; query: string }>(`/api/search${queryString}`);
    return {
      ...transformPaginatedResponse(response),
      query: response.query,
    };
  },

  // Search content with filters
  searchWithFilters: async (query: string, filters: ContentFilters = {}): Promise<SearchResponse> => {
    const params = { q: query, ...filters };
    const queryString = buildQueryString(params as Record<string, string | number | undefined>);
    const response = await fetchAPI<{ items: Content[]; pagination: { total: number; page: number; limit: number; pages: number }; query: string }>(`/api/search${queryString}`);
    return {
      ...transformPaginatedResponse(response),
      query: response.query,
    };
  },

  // Get all genres
  getGenres: async (): Promise<string[]> => {
    return fetchAPI<string[]>('/api/genres');
  },

  // Get all languages
  getLanguages: async (): Promise<string[]> => {
    return fetchAPI<string[]>('/api/languages');
  },

  // Get all countries
  getCountries: async (): Promise<string[]> => {
    return fetchAPI<string[]>('/api/countries');
  },

  // Get year range
  getYears: async (): Promise<YearRange> => {
    return fetchAPI<YearRange>('/api/years');
  },

  // Get recently added
  getRecent: async (limit: number = 20): Promise<Content[]> => {
    return fetchAPI<Content[]>(`/api/recent?limit=${limit}`);
  },

  // Get stats
  getStats: async (): Promise<Stats> => {
    return fetchAPI<Stats>('/api/stats');
  },

  // Helper functions for common queries
  getTrending: (limit: number = 20): Promise<PaginatedResponse<Content>> => {
    return api.getContent({ sort: 'popularity', order: 'desc', limit });
  },

  getTopRated: (limit: number = 20): Promise<PaginatedResponse<Content>> => {
    return api.getContent({ sort: 'rating', order: 'desc', min_rating: 7, limit });
  },

  getByGenre: (genre: string, limit: number = 20): Promise<PaginatedResponse<Content>> => {
    return api.getContent({ genre, sort: 'rating', order: 'desc', limit });
  },

  getByLanguage: (language: string, limit: number = 20): Promise<PaginatedResponse<Content>> => {
    return api.getContent({ language, sort: 'release_date', order: 'desc', limit });
  },

  getNewReleases: (limit: number = 20): Promise<PaginatedResponse<Content>> => {
    const currentYear = new Date().getFullYear();
    return api.getContent({ year_from: currentYear - 1, sort: 'release_date', order: 'desc', limit });
  },
};

export default api;
