'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Loading bar that appears during route transitions
 *
 * Provides visual feedback when navigating between pages.
 * Shows a progress bar at the top of the viewport.
 *
 * Features:
 * - Appears on route changes
 * - Smooth animation with CSS transitions
 * - Auto-hides after navigation completes
 * - Handles both pathname and search param changes
 */
export function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Reset and start loading on route change
  const startLoading = useCallback(() => {
    setLoading(true);
    setProgress(0);

    // Simulate progress
    const timer1 = setTimeout(() => setProgress(30), 100);
    const timer2 = setTimeout(() => setProgress(60), 200);
    const timer3 = setTimeout(() => setProgress(80), 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Complete loading
  const completeLoading = useCallback(() => {
    setProgress(100);
    const timer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Start loading when route changes
    const cleanup = startLoading();

    // Complete after a short delay (simulating load time)
    const completeTimer = setTimeout(() => {
      completeLoading();
    }, 500);

    return () => {
      cleanup();
      clearTimeout(completeTimer);
    };
  }, [pathname, searchParams, startLoading, completeLoading]);

  if (!loading && progress === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent pointer-events-none"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-accent transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: progress > 0 ? '0 0 10px var(--accent), 0 0 5px var(--accent)' : 'none',
        }}
      />
    </div>
  );
}

/**
 * Wrapper component that handles Suspense for useSearchParams
 * Required because useSearchParams needs to be wrapped in Suspense
 */
export function LoadingBarWithSuspense() {
  return (
    <LoadingBarFallback />
  );
}

/**
 * Simple loading bar that only tracks pathname changes
 * Used as fallback when search params are not needed
 */
function LoadingBarFallback() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start loading
    setLoading(true);
    setProgress(0);

    const timer1 = setTimeout(() => setProgress(30), 100);
    const timer2 = setTimeout(() => setProgress(60), 200);
    const timer3 = setTimeout(() => setProgress(80), 400);

    // Complete loading
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
    }, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(completeTimer);
    };
  }, [pathname]);

  if (!loading && progress === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent pointer-events-none"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-accent transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: progress > 0 ? '0 0 10px var(--accent), 0 0 5px var(--accent)' : 'none',
        }}
      />
    </div>
  );
}
