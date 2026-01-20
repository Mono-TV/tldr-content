import { ContentRowSkeleton } from '@/components/ui/skeletons';
import { SportsHeroSkeleton } from '@/components/sports/sports-hero';

export default function SportsLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton - Spotlight style */}
      <SportsHeroSkeleton />

      {/* Content Rows Skeletons */}
      <div className="-mt-20 relative z-10 pb-20 space-y-8 pl-12 lg:pl-16">
        <ContentRowSkeleton count={8} />
        <ContentRowSkeleton count={8} />
        <ContentRowSkeleton count={8} />
        <ContentRowSkeleton count={8} />
        <ContentRowSkeleton count={8} />
      </div>
    </div>
  );
}
