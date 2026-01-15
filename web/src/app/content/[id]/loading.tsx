import { ContentDetailSkeleton } from '@/components/ui/skeletons';

/**
 * Content detail page loading state
 *
 * This loading.tsx file is automatically wrapped in a Suspense boundary by Next.js.
 * It displays immediately on navigation while the content data is being fetched.
 *
 * Benefits:
 * - Zero blank screens during navigation
 * - Instant visual feedback
 * - Matches final page layout with backdrop, poster, and info sections
 */
export default function ContentDetailLoading() {
  return <ContentDetailSkeleton />;
}
