'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCcw, Home, ChevronLeft, Search } from 'lucide-react';

/**
 * Content detail page error boundary
 *
 * Catches and displays errors that occur during rendering of content detail pages.
 * Provides user-friendly error message and recovery options.
 */
export default function ContentDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Content detail page error:', error);
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
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Content not available</h2>
          <p className="text-muted-foreground">
            We couldn&apos;t load this content. It may have been removed or there might be a temporary issue.
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
            <ChevronLeft className="w-4 h-4" />
            Browse Content
          </Link>
        </div>

        {/* Additional Links */}
        <div className="flex items-center justify-center gap-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="w-4 h-4" />
            Search
          </Link>
        </div>
      </div>
    </div>
  );
}
