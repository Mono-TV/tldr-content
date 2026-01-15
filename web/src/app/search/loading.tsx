import { SearchSkeleton } from '@/components/ui/skeletons';

/**
 * Search page loading state
 *
 * This loading.tsx file is automatically wrapped in a Suspense boundary by Next.js.
 * It displays immediately on navigation while the page initializes.
 *
 * Benefits:
 * - Zero blank screens during navigation
 * - Instant visual feedback
 * - Shows search bar and results grid placeholder
 */
export default function SearchLoading() {
  return <SearchSkeleton />;
}
