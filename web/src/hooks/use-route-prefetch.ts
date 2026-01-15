'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { shouldPrefetch, scheduleWhenIdle, supportsHover, debounce } from '@/lib/network-utils';
import { prefetchCriticalMoviesData, prefetchCriticalShowsData } from '@/lib/client-api';

/**
 * Route prefetch configuration
 */
interface PrefetchConfig {
  /** Routes to prefetch from the current page */
  routes: string[];
  /** Delay before prefetching starts (in ms) */
  delay?: number;
  /** Whether to use idle callback for prefetching */
  useIdleCallback?: boolean;
}

/**
 * Prediction map: Current page -> Likely next destinations
 */
const PREDICTION_MAP: Record<string, string[]> = {
  '/': ['/movies', '/shows'],
  '/movies': ['/shows', '/browse'],
  '/shows': ['/movies', '/browse'],
  '/browse': ['/movies', '/shows'],
  '/sports': ['/movies', '/shows'],
  '/music': ['/movies', '/shows'],
};

/**
 * Route to data prefetch function mapping
 */
const ROUTE_DATA_PREFETCHERS: Record<string, () => Promise<any>> = {
  '/movies': prefetchCriticalMoviesData,
  '/shows': prefetchCriticalShowsData,
};

/**
 * Query key mapping for React Query cache
 */
const ROUTE_QUERY_KEYS: Record<string, string[]> = {
  '/movies': ['movies-critical'],
  '/shows': ['shows-critical'],
};

/**
 * Custom hook for automatic route prefetching
 *
 * Intelligently prefetches routes and data based on:
 * 1. Current page (prediction map)
 * 2. Network conditions
 * 3. Browser idle state
 *
 * @param config - Optional configuration
 * @returns Object with prefetch utilities
 */
export function useRoutePrefetch(config?: Partial<PrefetchConfig>) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const prefetchedRoutes = useRef<Set<string>>(new Set());
  const hasPrefetched = useRef(false);

  const { delay = 2000, useIdleCallback = true } = config || {};

  /**
   * Prefetch a single route and its data
   */
  const prefetchRoute = useCallback(
    async (route: string) => {
      // Skip if already prefetched this session
      if (prefetchedRoutes.current.has(route)) {
        console.log(`[Prefetch] Route already prefetched: ${route}`);
        return;
      }

      // Check network conditions
      if (!shouldPrefetch()) {
        console.log(`[Prefetch] Skipping due to network conditions: ${route}`);
        return;
      }

      console.log(`[Prefetch] Prefetching route: ${route}`);

      // Mark as prefetched immediately to prevent duplicate calls
      prefetchedRoutes.current.add(route);

      try {
        // Prefetch the route (Next.js handles HTML and JS bundles)
        router.prefetch(route);

        // Prefetch route-specific data if available
        const dataFetcher = ROUTE_DATA_PREFETCHERS[route];
        const queryKey = ROUTE_QUERY_KEYS[route];

        if (dataFetcher && queryKey) {
          // Check if data is already in cache
          const existingData = queryClient.getQueryData(queryKey);
          if (!existingData) {
            console.log(`[Prefetch] Prefetching data for: ${route}`);
            await queryClient.prefetchQuery({
              queryKey,
              queryFn: dataFetcher,
              staleTime: 5 * 60 * 1000, // 5 minutes
            });
          } else {
            console.log(`[Prefetch] Data already cached for: ${route}`);
          }
        }
      } catch (error) {
        console.error(`[Prefetch] Error prefetching ${route}:`, error);
        // Remove from prefetched set to allow retry
        prefetchedRoutes.current.delete(route);
      }
    },
    [router, queryClient]
  );

  /**
   * Prefetch multiple routes in sequence (to avoid overwhelming the network)
   */
  const prefetchRoutes = useCallback(
    async (routes: string[]) => {
      for (const route of routes) {
        await prefetchRoute(route);
        // Small delay between routes to avoid network congestion
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    },
    [prefetchRoute]
  );

  /**
   * Start automatic prefetching based on prediction map
   */
  useEffect(() => {
    // Skip if already prefetched for this page
    if (hasPrefetched.current) return;

    // Get predicted routes for current page
    const predictedRoutes = config?.routes || PREDICTION_MAP[pathname || ''] || [];

    if (predictedRoutes.length === 0) {
      console.log(`[Prefetch] No predicted routes for: ${pathname}`);
      return;
    }

    console.log(`[Prefetch] Scheduling prefetch for: ${predictedRoutes.join(', ')}`);

    // Schedule prefetching
    const executePrefetch = () => {
      if (!shouldPrefetch()) {
        console.log('[Prefetch] Skipping: Network conditions not suitable');
        return;
      }

      hasPrefetched.current = true;
      prefetchRoutes(predictedRoutes);
    };

    // Use idle callback or simple timeout
    const timer = setTimeout(() => {
      if (useIdleCallback) {
        scheduleWhenIdle(executePrefetch, delay);
      } else {
        executePrefetch();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [pathname, delay, useIdleCallback, config?.routes, prefetchRoutes]);

  // Reset prefetch status when page changes
  useEffect(() => {
    hasPrefetched.current = false;
  }, [pathname]);

  return {
    prefetchRoute,
    prefetchRoutes,
    isPrefetched: (route: string) => prefetchedRoutes.current.has(route),
  };
}

/**
 * Hook for navbar link hover prefetching
 *
 * Returns a debounced hover handler that prefetches routes on hover.
 * Only works on devices that support hover (not touch-only).
 */
export function useNavbarPrefetch() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const prefetchedRoutes = useRef<Set<string>>(new Set());

  /**
   * Handle link hover - prefetch route and data
   */
  const handleHover = useCallback(
    async (route: string) => {
      // Skip on touch-only devices
      if (!supportsHover()) return;

      // Skip if already prefetched
      if (prefetchedRoutes.current.has(route)) return;

      // Check network conditions
      if (!shouldPrefetch()) return;

      console.log(`[Prefetch] Navbar hover prefetch: ${route}`);
      prefetchedRoutes.current.add(route);

      try {
        // Prefetch route
        router.prefetch(route);

        // Prefetch data if available
        const dataFetcher = ROUTE_DATA_PREFETCHERS[route];
        const queryKey = ROUTE_QUERY_KEYS[route];

        if (dataFetcher && queryKey) {
          const existingData = queryClient.getQueryData(queryKey);
          if (!existingData) {
            await queryClient.prefetchQuery({
              queryKey,
              queryFn: dataFetcher,
              staleTime: 5 * 60 * 1000,
            });
          }
        }
      } catch (error) {
        console.error(`[Prefetch] Navbar hover error for ${route}:`, error);
        prefetchedRoutes.current.delete(route);
      }
    },
    [router, queryClient]
  );

  // Debounced version to prevent excessive calls during quick mouse movements
  const debouncedHover = useCallback(debounce(handleHover, 150), [handleHover]);

  return {
    onMouseEnter: debouncedHover,
    isPrefetched: (route: string) => prefetchedRoutes.current.has(route),
  };
}

/**
 * Hook for predictive prefetching based on current page
 * This is a more aggressive prefetch strategy
 */
export function usePredictivePrefetch() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!shouldPrefetch()) return;

    const likelyDestinations = PREDICTION_MAP[pathname || ''] || [];

    // Low priority prefetch after 3 seconds
    const timer = setTimeout(() => {
      scheduleWhenIdle(() => {
        likelyDestinations.forEach((route) => {
          router.prefetch(route);
        });
        console.log(`[Prefetch] Predictive prefetch for: ${likelyDestinations.join(', ')}`);
      }, 3000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [pathname, router]);
}
