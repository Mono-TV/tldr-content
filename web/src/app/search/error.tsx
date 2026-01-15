'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCcw, Home, Film } from 'lucide-react';

/**
 * Search page error boundary
 *
 * Catches and displays errors that occur during rendering of the search page.
 * Provides user-friendly error message and recovery options.
 */
export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Search page error:', error);
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Search unavailable</h2>
          <p className="text-muted-foreground">
            We couldn&apos;t load the search page. Please try again or browse our content instead.
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
          <Link
            href="/browse"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-card text-foreground rounded-lg font-semibold hover:bg-card-hover transition-colors"
          >
            <Film className="w-4 h-4" />
            Browse Content
          </Link>
        </div>

        {/* Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
