/**
 * Comprehensive skeleton loader components
 * Used during data fetching and route transitions
 *
 * These components provide visual feedback during loading states,
 * ensuring zero blank screens and a professional user experience.
 */

import { cn } from '@/lib/utils';

/**
 * Movie card skeleton - matches MovieCard component layout
 */
export function MovieCardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-32 md:w-36 lg:w-40',
    md: 'w-36 md:w-40 lg:w-48',
    lg: 'w-36 md:w-40 lg:w-48',
  };

  return (
    <div className={cn('flex-shrink-0', sizeClasses[size])}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-card">
        {/* Shimmer effect */}
        <div className="absolute inset-0 image-shimmer" />
      </div>
    </div>
  );
}

/**
 * Content row skeleton - matches ContentRow component layout
 * Use count prop to render multiple rows
 */
export function ContentRowSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-4 py-6">
          {/* Row Title */}
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="h-7 w-48 bg-card rounded skeleton" />
          </div>

          {/* Row Content */}
          <div className="flex gap-8 overflow-x-auto hide-scrollbar px-4 sm:px-6 lg:px-8">
            {Array.from({ length: 8 }).map((_, j) => (
              <MovieCardSkeleton key={j} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Hero carousel skeleton - matches HeroCarousel component layout
 * Shows a loading spinner centered in the hero area
 */
export function HeroCarouselSkeleton() {
  return (
    <div className="relative h-[80vh] w-full bg-gradient-to-b from-card via-card/80 to-background overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 image-shimmer opacity-30" />

      {/* Centered spinner */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

      {/* Content info placeholder */}
      <div className="absolute bottom-20 left-12 lg:left-16 space-y-4 max-w-xl">
        <div className="h-10 w-64 bg-card/50 rounded skeleton" />
        <div className="h-6 w-48 bg-card/50 rounded skeleton" />
        <div className="flex gap-3">
          <div className="h-12 w-32 bg-card/50 rounded-lg skeleton" />
          <div className="h-12 w-40 bg-card/50 rounded-lg skeleton" />
        </div>
      </div>
    </div>
  );
}

/**
 * Spotlight carousel skeleton - matches SpotlightCarousel component layout
 * Used for the homepage spotlight section
 */
export function SpotlightCarouselSkeleton() {
  return (
    <div className="relative h-[85vh] w-full bg-gradient-to-b from-card via-card/80 to-background overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 image-shimmer opacity-30" />

      {/* Centered spinner */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-background via-background/80 to-transparent" />

      {/* Poster carousel placeholder */}
      <div className="absolute bottom-8 left-0 right-0 px-12 lg:px-16">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[120px] md:w-[140px] lg:w-[160px] aspect-[2/3] bg-card/50 rounded-lg skeleton"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Navbar skeleton - matches Navbar component layout
 */
export function NavbarSkeleton() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/20 backdrop-blur-xl">
      <div className="w-full px-12 lg:px-16 h-16 flex items-center justify-between">
        {/* Logo skeleton */}
        <div className="h-8 w-20 bg-card/50 rounded skeleton" />

        {/* Nav items skeleton */}
        <div className="hidden md:flex gap-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-5 w-16 bg-card/50 rounded skeleton" />
          ))}
        </div>

        {/* Profile skeleton */}
        <div className="w-9 h-9 rounded-full bg-card/50 skeleton" />
      </div>
    </div>
  );
}

/**
 * Filter bar skeleton - matches filter controls layout
 */
export function FilterBarSkeleton() {
  return (
    <div className="flex flex-wrap gap-4 items-center p-4 bg-card/50 rounded-lg backdrop-blur-sm">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 w-32 bg-card rounded skeleton" />
      ))}
    </div>
  );
}

/**
 * Content detail skeleton - matches ContentDetail component layout
 */
export function ContentDetailSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Backdrop skeleton */}
      <div className="relative h-[60vh] md:h-[70vh] bg-gradient-to-b from-card via-card/80 to-background">
        <div className="absolute inset-0 image-shimmer opacity-30" />

        {/* Centered spinner */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>

        {/* Back button placeholder */}
        <div className="absolute top-20 left-4 md:left-8 z-10">
          <div className="h-8 w-20 bg-card/50 rounded-full skeleton" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 -mt-40 relative z-10 pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="w-48 md:w-64 aspect-[2/3] bg-card rounded-lg shadow-2xl skeleton" />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            {/* Type badge */}
            <div className="flex justify-center md:justify-start">
              <div className="h-6 w-20 bg-card rounded skeleton" />
            </div>

            {/* Title */}
            <div className="h-12 w-3/4 bg-card rounded skeleton mx-auto md:mx-0" />

            {/* Meta info */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="h-6 w-20 bg-card rounded skeleton" />
              <div className="h-6 w-24 bg-card rounded skeleton" />
              <div className="h-6 w-28 bg-card rounded skeleton" />
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 w-20 bg-card rounded-full skeleton" />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="h-12 w-36 bg-card rounded-lg skeleton" />
              <div className="h-12 w-40 bg-card rounded-lg skeleton" />
              <div className="h-12 w-12 bg-card rounded-lg skeleton" />
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <div className="h-6 w-24 bg-card rounded skeleton mx-auto md:mx-0" />
              <div className="h-4 w-full bg-card rounded skeleton" />
              <div className="h-4 w-full bg-card rounded skeleton" />
              <div className="h-4 w-3/4 bg-card rounded skeleton mx-auto md:mx-0" />
            </div>
          </div>
        </div>

        {/* Cast skeleton */}
        <div className="mt-12">
          <div className="h-7 w-16 bg-card rounded skeleton mb-4" />
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 text-center w-24">
                <div className="w-20 h-20 mx-auto rounded-full bg-card skeleton mb-2" />
                <div className="h-4 w-16 mx-auto bg-card rounded skeleton mb-1" />
                <div className="h-3 w-12 mx-auto bg-card rounded skeleton" />
              </div>
            ))}
          </div>
        </div>

        {/* Similar content skeleton */}
        <div className="mt-12">
          <ContentRowSkeleton count={1} />
        </div>
      </div>
    </div>
  );
}

/**
 * Search page skeleton - matches SearchContent component layout
 */
export function SearchSkeleton() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Title skeleton */}
        <div className="text-center mb-8">
          <div className="h-12 w-32 mx-auto bg-card rounded skeleton mb-4" />
        </div>

        {/* Search bar skeleton */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="h-16 bg-card rounded-2xl skeleton" />
        </div>

        {/* Results skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Browse page skeleton - matches BrowsePage layout
 */
export function BrowseSkeleton() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-card rounded skeleton mb-2" />
          <div className="h-5 w-80 bg-card rounded skeleton" />
        </div>

        {/* Filter bar skeleton */}
        <FilterBarSkeleton />

        {/* Grid skeleton */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Movies/Shows page skeleton - matches movies/shows page layout with hero + rows
 */
export function ContentPageSkeleton({ rowCount = 8 }: { rowCount?: number }) {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero Skeleton */}
      <HeroCarouselSkeleton />

      {/* Content Rows Skeleton */}
      <div className="-mt-20 relative z-10 space-y-8 pl-12 lg:pl-16">
        <ContentRowSkeleton count={rowCount} />
      </div>
    </div>
  );
}

/**
 * Generic page loading skeleton with centered spinner
 */
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-card border-t-accent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Inline loading spinner for smaller components
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={cn(
      'border-card border-t-accent rounded-full animate-spin',
      sizeClasses[size]
    )} />
  );
}
