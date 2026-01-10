import { Suspense } from 'react';
import { MovieCardSkeleton } from '@/components/movie/movie-card';
import { SearchContent } from './search-content';

// Force dynamic rendering to prevent static optimization
export const dynamic = 'force-dynamic';

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
