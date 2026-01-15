/**
 * Network-aware utilities for intelligent prefetching
 *
 * These utilities check network conditions before prefetching to:
 * - Respect user's data saver preferences
 * - Avoid prefetching on slow connections (2G, slow-2G)
 * - Optimize for good network conditions (3G+, WiFi)
 */

/**
 * Network Information API types
 * Note: This API is not fully standardized and may not be available in all browsers
 */
interface NetworkInformation {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  saveData: boolean;
  downlink: number; // Mbps
  rtt: number; // Round-trip time in ms
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

/**
 * Get the Network Information API connection object
 * Returns null if not available
 */
function getConnection(): NetworkInformation | null {
  if (typeof window === 'undefined') return null;

  const nav = navigator as NavigatorWithConnection;
  return nav.connection || nav.mozConnection || nav.webkitConnection || null;
}

/**
 * Check if prefetching should be performed based on network conditions
 *
 * Returns false if:
 * - User has data saver enabled
 * - Connection is slow-2g or 2g
 * - Device memory is very low (<2GB)
 *
 * Returns true if:
 * - Network Information API is not available (assume good connection)
 * - Connection is 3g or 4g
 * - User has not enabled data saver
 */
export function shouldPrefetch(): boolean {
  // Server-side: always return false (prefetching is client-only)
  if (typeof window === 'undefined') return false;

  const connection = getConnection();

  // If Network Information API is not available, assume good connection
  if (!connection) return true;

  // Respect user's data saver preference
  if (connection.saveData) {
    console.log('[Prefetch] Skipping: Data saver enabled');
    return false;
  }

  // Don't prefetch on very slow connections
  const slowConnections = ['slow-2g', '2g'];
  if (slowConnections.includes(connection.effectiveType)) {
    console.log(`[Prefetch] Skipping: Slow connection (${connection.effectiveType})`);
    return false;
  }

  // Check device memory if available (in GB)
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory !== undefined && deviceMemory < 2) {
    console.log(`[Prefetch] Skipping: Low device memory (${deviceMemory}GB)`);
    return false;
  }

  return true;
}

/**
 * Check if the browser is currently idle (no ongoing interactions)
 * Uses requestIdleCallback if available
 */
export function scheduleWhenIdle(callback: () => void, timeout: number = 2000): void {
  if (typeof window === 'undefined') return;

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    // Fallback: Use setTimeout with the same timeout
    setTimeout(callback, timeout);
  }
}

/**
 * Get detailed network information for analytics/debugging
 */
export interface NetworkInfo {
  available: boolean;
  effectiveType: string | null;
  saveData: boolean;
  downlink: number | null;
  rtt: number | null;
  type: string | null;
  deviceMemory: number | null;
}

export function getNetworkInfo(): NetworkInfo {
  if (typeof window === 'undefined') {
    return {
      available: false,
      effectiveType: null,
      saveData: false,
      downlink: null,
      rtt: null,
      type: null,
      deviceMemory: null,
    };
  }

  const connection = getConnection();
  const deviceMemory = (navigator as any).deviceMemory;

  return {
    available: !!connection,
    effectiveType: connection?.effectiveType || null,
    saveData: connection?.saveData || false,
    downlink: connection?.downlink || null,
    rtt: connection?.rtt || null,
    type: connection?.type || null,
    deviceMemory: deviceMemory || null,
  };
}

/**
 * Check if the device supports hover (is not touch-only)
 * Useful for determining if hover prefetch should be enabled
 */
export function supportsHover(): boolean {
  if (typeof window === 'undefined') return false;

  // Check if the primary pointing device supports hover
  return window.matchMedia('(hover: hover)').matches;
}

/**
 * Debounce function for hover prefetching
 * Prevents excessive prefetch calls when quickly moving over links
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Cancel a debounced function's pending execution
 */
export function cancelDebounce(debouncedFn: any): void {
  if (debouncedFn.cancel) {
    debouncedFn.cancel();
  }
}
