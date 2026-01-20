'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function TournamentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Tournament page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">🏆</div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Tournament not found</h2>
          <p className="text-muted-foreground">
            We couldn't find this tournament or load its matches. Please try again.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/sports"
            className="px-6 py-3 bg-card text-white font-semibold rounded-lg hover:bg-card/80 transition-colors"
          >
            All Sports
          </Link>
        </div>
      </div>
    </div>
  );
}
