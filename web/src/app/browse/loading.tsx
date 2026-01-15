import { BrowseSkeleton } from '@/components/ui/skeletons';

/**
 * Browse page loading state
 *
 * This loading.tsx file is automatically wrapped in a Suspense boundary by Next.js.
 * It displays immediately on navigation while the page data is being fetched.
 *
 * Benefits:
 * - Zero blank screens during navigation
 * - Instant visual feedback
 * - Shows filter bar and grid layout placeholder
 */
export default function BrowseLoading() {
  return <BrowseSkeleton />;
}
