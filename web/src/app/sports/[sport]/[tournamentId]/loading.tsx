export default function TournamentLoading() {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero Skeleton */}
      <section className="relative h-[50vh] min-h-[400px] w-full bg-card skeleton overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="absolute bottom-12 left-12 lg:left-16 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/10 skeleton" />
            <div className="h-5 w-32 bg-white/10 rounded skeleton" />
          </div>
          <div className="h-10 w-96 bg-white/10 rounded skeleton mb-4" />
          <div className="flex gap-4 mb-6">
            <div className="h-5 w-24 bg-white/10 rounded skeleton" />
            <div className="h-5 w-20 bg-white/10 rounded skeleton" />
          </div>
          <div className="h-12 w-40 bg-white/10 rounded-full skeleton" />
        </div>
      </section>

      {/* Breadcrumb Skeleton */}
      <div className="px-12 lg:px-16 py-6">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-card rounded skeleton" />
          <span className="text-muted-foreground">/</span>
          <div className="h-4 w-20 bg-card rounded skeleton" />
          <span className="text-muted-foreground">/</span>
          <div className="h-4 w-32 bg-card rounded skeleton" />
        </div>
      </div>

      {/* Header Skeleton */}
      <div className="px-12 lg:px-16 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-card skeleton" />
          <div>
            <div className="h-9 w-64 bg-card rounded skeleton mb-2" />
            <div className="h-5 w-32 bg-card rounded skeleton" />
          </div>
        </div>
      </div>

      {/* Match Row Skeletons */}
      <section className="space-y-8">
        {Array.from({ length: 4 }).map((_, rowIndex) => (
          <div key={rowIndex}>
            {/* Row Header Skeleton */}
            <div className="px-12 lg:px-16 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-48 bg-card rounded skeleton" />
                <div className="h-4 w-32 bg-card rounded skeleton" />
                <div className="h-4 w-16 bg-card rounded skeleton" />
              </div>
            </div>

            {/* Cards Row Skeleton */}
            <div className="flex gap-4 px-12 lg:px-16 overflow-hidden">
              {Array.from({ length: 5 }).map((_, cardIndex) => (
                <div
                  key={cardIndex}
                  className="flex-shrink-0 w-72 sm:w-80 aspect-video rounded-xl bg-card skeleton"
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
