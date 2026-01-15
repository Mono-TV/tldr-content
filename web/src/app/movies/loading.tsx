import { ContentPageSkeleton } from '@/components/ui/skeletons';

/**
 * Movies page loading state
 *
 * This loading.tsx file is automatically wrapped in a Suspense boundary by Next.js.
 * It displays immediately on navigation while the page data is being fetched.
 *
 * Benefits:
 * - Zero blank screens during navigation
 * - Instant visual feedback
 * - Matches final page layout for smooth transition
 */
export default function MoviesLoading() {
  return <ContentPageSkeleton rowCount={8} />;
}
