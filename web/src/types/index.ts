export interface Genre {
  id: number | null;
  name: string;
}

export interface CastMember {
  id?: number;
  name: string;
  character: string | null;
  known_for_department?: string;
  order?: number;
  popularity?: number;
  profile_path: string | null;
}

export interface Content {
  _id: string;
  imdb_id: string;
  title: string;
  original_title?: string;
  year: number | null;
  release_date: string | null;
  overview?: string;
  plot?: string;
  plot_full?: string;
  runtime?: number;
  duration?: number;
  imdb_rating?: number | null;
  imdb_rating_count?: number | null;
  tmdb_vote_average?: number;
  tmdb_vote_count?: number;
  vote_count?: number;
  tmdb_popularity?: number;
  genres: Genre[];
  languages: string[];
  original_language?: string;
  countries: string[];
  cast?: CastMember[];
  crew?: unknown[];
  directors?: string[];
  writers?: string[];
  stars?: string[];
  production_companies?: string[];
  poster_url?: string;
  backdrop_url?: string;
  trailer_url?: string;
  trailer_key?: string;
  content_type: 'movie' | 'tv' | 'show' | 'series';
  type?: 'movie' | 'show';
  status?: string;
  seasons?: number;
  streaming_platforms?: StreamingPlatform[];
}

export interface StreamingPlatform {
  id?: number | string;
  platform: string;
  name?: string;
  logo_path?: string;
  url?: string;
  type?: string;
  price?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SearchResponse extends PaginatedResponse<Content> {
  query: string;
}

export interface ContentFilters {
  search?: string;
  genre?: string;
  language?: string;
  original_language?: string;
  year?: number;
  year_from?: number;
  year_to?: number;
  min_rating?: number;
  min_votes?: number;
  type?: 'movie' | 'show';
  country?: string;
  sort?: 'release_date' | 'rating' | 'title' | 'year' | 'popularity';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface Stats {
  total: number;
  movies: number;
  shows: number;
  genres: number;
  languages: number;
}

export interface YearRange {
  min: number;
  max: number;
}
