'use client';

import { useEffect } from 'react';

export default function SportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Sports page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">🏆</div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Sports content unavailable</h2>
          <p className="text-muted-foreground">
            We couldn't load the sports content. Please try again.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-card text-white font-semibold rounded-lg hover:bg-card/80 transition-colors"
          >
            Go Home
          </a>
          <a
            href="/movies"
            className="px-6 py-3 bg-card text-white font-semibold rounded-lg hover:bg-card/80 transition-colors"
          >
            Browse Movies
          </a>
        </div>
      </div>
    </div>
  );
}
