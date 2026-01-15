'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCcw, Film, Tv, Search } from 'lucide-react';

/**
 * Homepage error boundary
 *
 * Catches and displays errors that occur during rendering of the homepage.
 * Provides user-friendly error message and recovery options.
 */
export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Homepage error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Error Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground">
            We couldn&apos;t load the homepage. This might be a temporary issue with our servers.
          </p>
        </div>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="p-4 bg-card rounded-lg text-left">
            <p className="text-sm font-mono text-muted-foreground break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>

        {/* Alternative Navigation */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Or try navigating to:</p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/movies"
              className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-lg hover:bg-card-hover transition-colors"
            >
              <Film className="w-4 h-4" />
              Movies
            </Link>
            <Link
              href="/shows"
              className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-lg hover:bg-card-hover transition-colors"
            >
              <Tv className="w-4 h-4" />
              TV Shows
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-lg hover:bg-card-hover transition-colors"
            >
              <Search className="w-4 h-4" />
              Search
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
