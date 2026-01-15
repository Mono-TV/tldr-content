'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { m } from 'framer-motion';
import { Grid3X3, LayoutGrid, Film, Tv } from 'lucide-react';
import { FilterBar, ActiveFilters } from '@/components/filters/filter-bar';
import { MovieCard, MovieCardSkeleton } from '@/components/movie/movie-card';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import type { ContentFilters, Content } from '@/types';
import type { BrowseInitialData } from '@/lib/fetch-browse-data';

const ITEMS_PER_PAGE = 24;

interface BrowsePageClientProps {
  initialData: BrowseInitialData;
}

/**
 * Client-side Browse page component
 *
 * Receives initial data from server (ISR cached)
 * Handles filter changes client-side with React Query
 */
export function BrowsePageClient({ initialData }: BrowsePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');
  const [hasFiltersChanged, setHasFiltersChanged] = useState(false);

  // Parse filters from URL
  const getFiltersFromURL = useCallback((): ContentFilters => {
    const filters: ContentFilters = {};

    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const genre = searchParams.get('genre');
    const language = searchParams.get('language');
    const year = searchParams.get('year');
    const minRating = searchParams.get('min_rating');
    const sort = searchParams.get('sort');
    const order = searchParams.get('order');
    const page = searchParams.get('page');

    if (search) filters.search = search;
    if (type) filters.type = type as 'movie' | 'show';
    if (genre) filters.genre = genre;
    if (language) filters.language = language;
    if (year) filters.year = parseInt(year);
    if (minRating) filters.min_rating = parseInt(minRating);
    if (sort) filters.sort = sort as ContentFilters['sort'];
    if (order) filters.order = order as 'asc' | 'desc';
    if (page) filters.page = parseInt(page);

    return filters;
  }, [searchParams]);

  const filters = getFiltersFromURL();
  const currentPage = filters.page || 1;

  // Check if filters have changed from default
  useEffect(() => {
    const hasFilters = Object.keys(filters).some(key => key !== 'page' && filters[key as keyof ContentFilters] !== undefined);
    setHasFiltersChanged(hasFilters || currentPage > 1);
  }, [filters, currentPage]);

  // Update URL with filters
  const updateFilters = useCallback((newFilters: ContentFilters) => {
    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      }
    });

    router.push(`/browse?${params.toString()}`);
  }, [router]);

  const handleFilterChange = useCallback((newFilters: ContentFilters) => {
    // Reset to page 1 when filters change
    updateFilters({ ...newFilters, page: 1 });
  }, [updateFilters]);

  const handlePageChange = useCallback((page: number) => {
    updateFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, updateFilters]);

  const removeFilter = useCallback((key: keyof ContentFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    handleFilterChange(newFilters);
  }, [filters, handleFilterChange]);

  // Fetch content - only when filters have changed from initial state
  const { data, isLoading, error } = useQuery({
    queryKey: ['browse', filters],
    queryFn: () => api.getContent({
      ...filters,
      limit: ITEMS_PER_PAGE,
      page: currentPage,
    }),
    // Use initial data only when no filters are applied
    enabled: hasFiltersChanged,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Use initial data when no filters, otherwise use fetched data
  const displayData = hasFiltersChanged ? data : {
    items: initialData.items,
    total: initialData.total,
    pagination: initialData.pagination,
  };

  const totalPages = displayData ? Math.ceil(displayData.total / ITEMS_PER_PAGE) : 0;
  const showLoading = hasFiltersChanged && isLoading;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse</h1>
          <p className="text-muted-foreground">
            Discover movies and TV shows from around the world
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterBar filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Active Filters */}
        <div className="mb-6">
          <ActiveFilters filters={filters} onRemove={removeFilter} />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {displayData && (
              <p className="text-muted-foreground">
                {displayData.total.toLocaleString()} results
                {filters.search && (
                  <span> for &quot;{filters.search}&quot;</span>
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
              title="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('large')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'large' ? 'bg-card-hover text-white' : 'text-muted-foreground hover:text-white'
              )}
              title="Large view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Grid */}
        {error ? (
          <div className="text-center py-20">
            <p className="text-accent mb-2">Failed to load content</p>
            <p className="text-muted-foreground text-sm">Please try again later</p>
          </div>
        ) : showLoading ? (
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
        ) : displayData?.items.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-4">
              {filters.type === 'show' ? (
                <Tv className="w-16 h-16 mx-auto text-muted-foreground" />
              ) : (
                <Film className="w-16 h-16 mx-auto text-muted-foreground" />
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => handleFilterChange({})}
              className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              'grid gap-4',
              viewMode === 'grid'
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            )}
          >
            {displayData?.items.map((content, index) => (
              <m.div
                key={content._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <MovieCard content={content} size={viewMode === 'large' ? 'lg' : 'md'} />
              </m.div>
            ))}
          </m.div>
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
      </div>
    </div>
  );
}
