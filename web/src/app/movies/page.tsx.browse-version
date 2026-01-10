'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Grid3X3, LayoutGrid, Film } from 'lucide-react';
import { FilterBar, ActiveFilters } from '@/components/filters/filter-bar';
import { MovieCard, MovieCardSkeleton } from '@/components/movie/movie-card';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import type { ContentFilters } from '@/types';

const ITEMS_PER_PAGE = 24;

function MoviesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');

  // Parse filters from URL
  const getFiltersFromURL = useCallback((): ContentFilters => {
    const filters: ContentFilters = { type: 'movie' };

    const search = searchParams.get('search');
    const genre = searchParams.get('genre');
    const language = searchParams.get('language');
    const year = searchParams.get('year');
    const minRating = searchParams.get('min_rating');
    const sort = searchParams.get('sort');
    const order = searchParams.get('order');
    const page = searchParams.get('page');

    if (search) filters.search = search;
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

  // Update URL with filters
  const updateFilters = useCallback((newFilters: ContentFilters) => {
    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && key !== 'type') {
        params.set(key, String(value));
      }
    });

    router.push(`/movies?${params.toString()}`);
  }, [router]);

  const handleFilterChange = useCallback((newFilters: ContentFilters) => {
    updateFilters({ ...newFilters, type: 'movie', page: 1 });
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

  // Fetch content
  const { data, isLoading, error } = useQuery({
    queryKey: ['movies', filters],
    queryFn: () => api.getContent({
      ...filters,
      type: 'movie',
      limit: ITEMS_PER_PAGE,
      page: currentPage,
    }),
  });

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  // Remove type from display filters
  const displayFilters = { ...filters };
  delete displayFilters.type;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Movies</h1>
          <p className="text-muted-foreground">
            Explore thousands of movies from Bollywood to Hollywood
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterBar filters={displayFilters} onFilterChange={handleFilterChange} />
        </div>

        {/* Active Filters */}
        <div className="mb-6">
          <ActiveFilters filters={displayFilters} onRemove={removeFilter} />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {data && (
              <p className="text-muted-foreground">
                {data.total.toLocaleString()} movies
                {filters.search && (
                  <span> matching &quot;{filters.search}&quot;</span>
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
            <p className="text-accent mb-2">Failed to load movies</p>
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
            <Film className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No movies found</h3>
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
      </div>
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="h-10 w-48 bg-card rounded skeleton mb-2" />
            <div className="h-5 w-80 bg-card rounded skeleton" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    }>
      <MoviesContent />
    </Suspense>
  );
}
