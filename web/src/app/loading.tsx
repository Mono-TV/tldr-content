import { SpotlightCarouselSkeleton, ContentRowSkeleton } from '@/components/ui/skeletons';

/**
 * Homepage loading state
 *
 * This loading.tsx file is automatically wrapped in a Suspense boundary by Next.js.
 * It displays immediately on navigation while the homepage data is being fetched.
 *
 * The homepage uses on-demand ISR (force-dynamic), so the first visitor
 * will see this loading state while data is fetched. Subsequent visitors
 * get the cached version instantly.
 *
 * Benefits:
 * - Zero blank screens during navigation
 * - Instant visual feedback
 * - Matches final page layout with spotlight and content rows
 */
export default function HomeLoading() {
  return (
    <div className="min-h-screen pb-20">
      {/* Spotlight Carousel Skeleton */}
      <SpotlightCarouselSkeleton />

      {/* Content Rows Skeleton */}
      <div className="-mt-20 relative z-10 space-y-8 pl-12 lg:pl-16">
        <ContentRowSkeleton count={8} />
      </div>
    </div>
  );
}
