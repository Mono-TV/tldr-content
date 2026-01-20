export default function SportsLoading() {
  return (
    <div className="min-h-screen pb-20">
      {/* Header Skeleton */}
      <div className="pt-24 pb-8 px-12 lg:px-16">
        <div className="h-12 w-48 bg-card rounded skeleton mb-2" />
        <div className="h-6 w-64 bg-card rounded skeleton" />
      </div>

      {/* Sport Collections Grid Skeleton */}
      <div className="px-12 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-xl bg-card skeleton"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
