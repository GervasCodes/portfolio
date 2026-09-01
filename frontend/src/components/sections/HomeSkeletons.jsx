import Skeleton from '@/components/ui/Skeleton';

/** Placeholder for Hero while `profile` is still loading. */
export function HeroSkeleton() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-grid bg-noise">
      <div className="container-page relative z-10 pt-40 md:pt-44 pb-20">
        <Skeleton className="w-28 h-28 md:w-32 md:h-32 rounded-full mb-8" />
        <Skeleton className="w-48 h-7 rounded-full mb-8" />
        <Skeleton className="w-full max-w-2xl h-14 mb-3" />
        <Skeleton className="w-2/3 max-w-lg h-14 mb-6" />
        <Skeleton className="w-full max-w-xl h-5 mb-2" />
        <Skeleton className="w-2/3 max-w-md h-5 mb-10" />
        <div className="flex gap-4">
          <Skeleton className="w-40 h-12 rounded-xl" />
          <Skeleton className="w-44 h-12 rounded-xl" />
        </div>
      </div>
    </section>
  );
}

/** Placeholder for the Skills section while `grouped` is still loading. */
export function SkillsSkeleton() {
  return (
    <section className="py-24">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Skeleton className="w-20 h-4 mx-auto mb-3" />
          <Skeleton className="w-64 h-9 mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-premium p-6">
              <Skeleton className="w-32 h-5 mb-4" />
              <div className="space-y-3">
                <Skeleton className="w-full h-3" />
                <Skeleton className="w-full h-3" />
                <Skeleton className="w-2/3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Placeholder for the featured Projects grid while `projects` is still loading. */
export function ProjectsSkeleton() {
  return (
    <section className="py-24">
      <div className="container-page">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
          <div>
            <Skeleton className="w-28 h-4 mb-3" />
            <Skeleton className="w-56 h-9" />
          </div>
          <Skeleton className="w-40 h-10 rounded-xl" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-premium overflow-hidden">
              <Skeleton className="w-full h-48 rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="w-20 h-3" />
                <Skeleton className="w-3/4 h-5" />
                <Skeleton className="w-full h-3" />
                <Skeleton className="w-2/3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
