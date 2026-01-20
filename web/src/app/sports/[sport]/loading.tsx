export default function SportLoading() {
  return (
    <div className="min-h-screen pb-20">
      {/* Header Skeleton */}
      <div className="pt-24 pb-8 px-12 lg:px-16">
        <div className="h-4 w-24 bg-card rounded skeleton mb-4" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-card skeleton" />
          <div>
            <div className="h-10 w-48 bg-card rounded skeleton mb-2" />
            <div className="h-5 w-32 bg-card rounded skeleton" />
          </div>
        </div>
      </div>

      {/* Featured Row Skeleton */}
      <section className="mb-12">
        <div className="px-12 lg:px-16 mb-4">
          <div className="h-7 w-32 bg-card rounded skeleton" />
        </div>
        <div className="flex gap-4 overflow-x-auto px-12 lg:px-16">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] aspect-video rounded-xl bg-card skeleton"
            />
          ))}
        </div>
      </section>

      {/* Tournaments Grid Skeleton */}
      <section className="px-12 lg:px-16">
        <div className="h-7 w-48 bg-card rounded skeleton mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[16/10] rounded-xl bg-card skeleton"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
