import { SportsHeroSkeleton } from '@/components/sports/sports-hero';

export default function SportsLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <SportsHeroSkeleton />

      {/* Content Rows Container */}
      <div className="-mt-20 relative z-10 pb-20 space-y-2">
        {/* Row Skeletons */}
        {[1, 2, 3, 4, 5].map((i) => (
          <section key={i} className="relative py-6">
            {/* Header */}
            <div className="px-4 sm:px-6 lg:px-8 mb-4">
              <div className="h-8 w-48 bg-card rounded skeleton" />
            </div>

            {/* Cards Row */}
            <div className="flex gap-4 md:gap-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
              {Array.from({ length: 6 }).map((_, j) => (
                <div
                  key={j}
                  className="flex-shrink-0 w-44 md:w-48 lg:w-56"
                >
                  <div className="aspect-video rounded-lg bg-card skeleton" />
                  <div className="mt-3 space-y-2">
                    <div className="h-4 w-full rounded bg-card skeleton" />
                    <div className="h-3 w-2/3 rounded bg-card skeleton" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* All Sports Grid Skeleton */}
        <section className="pt-8 px-12 lg:px-16">
          <div className="h-8 w-32 bg-card rounded skeleton mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-xl bg-card skeleton"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
