/**
 * Firebase module (deprecated - use firebase-lazy.ts instead)
 *
 * This module is kept for backward compatibility.
 * New code should import from '@/lib/firebase-lazy' for lazy loading benefits.
 *
 * @deprecated Use firebase-lazy.ts for new implementations
 */

import {
  initializeFirebase,
  isFirebaseConfigured,
} from './firebase-lazy';

// Export types
export type { User } from 'firebase/auth';

// For backward compatibility, export synchronous checks
export { isFirebaseConfigured };

// Placeholder exports that will be null until Firebase is initialized
// These are kept for backward compatibility with any code that imports them
export const app = null;
export const auth = null;
export const googleProvider = null;

// If you need the actual instances, use the async API:
export { initializeFirebase };
