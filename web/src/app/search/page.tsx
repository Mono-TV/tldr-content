'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Film, Tv, Clock, TrendingUp, Grid3X3, LayoutGrid } from 'lucide-react';
import { FilterBar, ActiveFilters } from '@/components/filters/filter-bar';
import { MovieCard, MovieCardSkeleton } from '@/components/movie/movie-card';
import { Pagination } from '@/components/ui/pagination';
import { cn, debounce } from '@/lib/utils';
import api from '@/services/api';
import type { ContentFilters } from '@/types';

const RECENT_SEARCHES_KEY = 'tldr-recent-searches';
const MAX_RECENT_SEARCHES = 8;
const ITEMS_PER_PAGE = 24;

type ContentType = 'all' | 'movie' | 'show';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get('q') || '');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');

  // Parse filters from URL
  const getFiltersFromURL = useCallback((): ContentFilters & { contentType: ContentType } => {
    const filters: ContentFilters & { contentType: ContentType } = {
      contentType: (searchParams.get('contentType') as ContentType) || 'all',
    };

    const q = searchParams.get('q');
    const genre = searchParams.get('genre');
    const language = searchParams.get('language');
    const year = searchParams.get('year');
    const minRating = searchParams.get('min_rating');
    const sort = searchParams.get('sort');
    const order = searchParams.get('order');
    const page = searchParams.get('page');

    if (q) filters.search = q;
    if (genre) filters.genre = genre;
    if (language) filters.language = language;
    if (year) filters.year = parseInt(year);
    if (minRating) filters.min_rating = parseInt(minRating);
    if (sort) filters.sort = sort as ContentFilters['sort'];
    if (order) filters.order = order as 'asc' | 'desc';
    if (page) filters.page = parseInt(page);

    // Set type filter based on contentType
    if (filters.contentType === 'movie') {
      filters.type = 'movie';
    } else if (filters.contentType === 'show') {
      filters.type = 'show';
    }

    return filters;
  }, [searchParams]);

  const filters = getFiltersFromURL();
  const currentPage = filters.page || 1;
  const contentType = filters.contentType;

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Sync query state with URL
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery !== query) {
      setQuery(urlQuery);
      setDebouncedQuery(urlQuery);
    }
  }, [searchParams]);

  // Save search to recent
  const saveToRecent = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== searchTerm.toLowerCase());
      const updated = [searchTerm, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  // Update URL with all parameters
  const updateURL = useCallback((newFilters: ContentFilters & { contentType?: ContentType }) => {
    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && key !== 'type') {
        params.set(key, String(value));
      }
    });

    router.push(`/search?${params.toString()}`);
  }, [router]);

  // Debounced search input
  const debouncedSetQuery = useCallback(
    debounce((value: string) => {
      setDebouncedQuery(value);
      const newFilters = { ...filters, search: value || undefined, page: 1 };
      delete newFilters.type;
      updateURL(newFilters);
      if (value.trim()) {
        saveToRecent(value);
      }
    }, 400),
    [filters, updateURL, saveToRecent]
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    debouncedSetQuery(value);
  };

  const handleSearchSelect = (term: string) => {
    setQuery(term);
    setDebouncedQuery(term);
    const newFilters = { ...filters, search: term, page: 1 };
    delete newFilters.type;
    updateURL(newFilters);
    saveToRecent(term);
  };

  const handleClearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
    const newFilters = { ...filters };
    delete newFilters.search;
    delete newFilters.type;
    updateURL(newFilters);
  };

  const handleContentTypeChange = (type: ContentType) => {
    const newFilters = { ...filters, contentType: type, page: 1 };
    delete newFilters.type;
    updateURL(newFilters);
  };

  const handleFilterChange = useCallback((newFilters: ContentFilters) => {
    const updatedFilters = {
      ...newFilters,
      contentType,
      search: debouncedQuery || undefined,
      page: 1,
    };
    delete updatedFilters.type;
    updateURL(updatedFilters);
  }, [contentType, debouncedQuery, updateURL]);

  const handlePageChange = useCallback((page: number) => {
    const newFilters = { ...filters, page };
    delete newFilters.type;
    updateURL(newFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, updateURL]);

  const removeFilter = useCallback((key: keyof ContentFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    delete newFilters.type;
    handleFilterChange(newFilters);
  }, [filters, handleFilterChange]);

  const clearAllFilters = useCallback(() => {
    handleFilterChange({ search: debouncedQuery || undefined });
  }, [debouncedQuery, handleFilterChange]);

  // Fetch search results with filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['search', filters],
    queryFn: () => {
      // Remove contentType and search from filters (will be passed separately)
      const { contentType, search, ...apiFilters } = filters;
      return api.searchWithFilters(debouncedQuery, {
        ...apiFilters,
        limit: ITEMS_PER_PAGE,
        page: currentPage,
      });
    },
    enabled: debouncedQuery.length >= 2,
  });

  // Fetch trending for empty state
  const { data: trendingData } = useQuery({
    queryKey: ['trending-search'],
    queryFn: () => api.getTrending(12),
    enabled: !debouncedQuery,
  });

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  // Remove contentType, type, and search from display filters
  const { contentType: _, type: __, search: ___, ...displayFilters } = filters;

  const hasActiveFilters = Object.keys(displayFilters).some(
    key => key !== 'page' && displayFilters[key as keyof ContentFilters] !== undefined
  );

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Search</h1>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search for movies, TV shows, actors..."
              autoFocus
              className={cn(
                'w-full bg-card border border-border rounded-2xl',
                'pl-14 pr-12 py-4 text-lg',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
                'placeholder:text-muted-foreground'
              )}
            />
            {query && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-card-hover transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results or Empty State */}
        <AnimatePresence mode="wait">
          {debouncedQuery.length >= 2 ? (
            // Search Results with Filters
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Content Type Toggle */}
              <div className="mb-6 flex justify-center">
                <div className="inline-flex bg-card rounded-lg p-1">
                  <button
                    onClick={() => handleContentTypeChange('all')}
                    className={cn(
                      'px-6 py-2 rounded-md text-sm font-medium transition-colors',
                      contentType === 'all'
                        ? 'bg-accent text-white'
                        : 'text-muted-foreground hover:text-white'
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleContentTypeChange('movie')}
                    className={cn(
                      'px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2',
                      contentType === 'movie'
                        ? 'bg-accent text-white'
                        : 'text-muted-foreground hover:text-white'
                    )}
                  >
                    <Film className="w-4 h-4" />
                    Movies
                  </button>
                  <button
                    onClick={() => handleContentTypeChange('show')}
                    className={cn(
                      'px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2',
                      contentType === 'show'
                        ? 'bg-accent text-white'
                        : 'text-muted-foreground hover:text-white'
                    )}
                  >
                    <Tv className="w-4 h-4" />
                    Shows
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="mb-6">
                <FilterBar filters={displayFilters} onFilterChange={handleFilterChange} />
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="mb-6">
                  <ActiveFilters filters={displayFilters} onRemove={removeFilter} />
                </div>
              )}

              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {isLoading ? (
                    <div className="h-5 w-32 bg-card rounded skeleton" />
                  ) : data && (
                    <p className="text-muted-foreground">
                      {data.total.toLocaleString()} results
                      {debouncedQuery && (
                        <span> matching &quot;{debouncedQuery}&quot;</span>
                      )}
                    </p>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-card rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      viewMode === 'grid' ? 'bg-card-hover text-white' : 'text-muted-foreground hover:text-white'
                    )}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('large')}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      viewMode === 'large' ? 'bg-card-hover text-white' : 'text-muted-foreground hover:text-white'
                    )}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content Grid */}
              {error ? (
                <div className="text-center py-20">
                  <p className="text-accent mb-2">Search failed</p>
                  <p className="text-muted-foreground text-sm">Please try again later</p>
                </div>
              ) : isLoading ? (
                <div className={cn(
                  'grid gap-4',
                  viewMode === 'grid'
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                    : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                )}>
                  {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                    <MovieCardSkeleton key={i} />
                  ))}
                </div>
              ) : data?.items.length === 0 ? (
                <div className="text-center py-20">
                  <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-6">
                    No matches for &quot;{debouncedQuery}&quot;
                    {hasActiveFilters && ' with current filters'}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    'grid gap-4',
                    viewMode === 'grid'
                      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                      : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  )}
                >
                  {data?.items.map((content, index) => (
                    <motion.div
                      key={content._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <MovieCard content={content} size={viewMode === 'large' ? 'lg' : 'md'} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="mt-12"
                />
              )}
            </motion.div>
          ) : (
            // Empty State - Recent & Trending
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <h2 className="text-xl font-semibold">Recent Searches</h2>
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      className="text-sm text-muted-foreground hover:text-white transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSearchSelect(term)}
                        className="px-4 py-2 bg-card rounded-full text-sm hover:bg-card-hover transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Trending */}
              {trendingData?.items && trendingData.items.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <h2 className="text-xl font-semibold">Trending Now</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {trendingData.items.map((content, index) => (
                      <motion.div
                        key={content._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <MovieCard content={content} />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-12">
            <div className="h-12 w-32 mx-auto bg-card rounded skeleton mb-8" />
            <div className="h-16 bg-card rounded-2xl skeleton" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
