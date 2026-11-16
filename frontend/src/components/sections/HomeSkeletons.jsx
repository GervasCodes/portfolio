import Skeleton from '@/components/ui/Skeleton';

/** Placeholder for Hero while `profile` is still loading. Same box model as Hero, so nothing shifts. */
export function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden" aria-hidden="true">
      <div
        className="container-page grid gap-12 pb-20 lg:min-h-[min(calc(100svh-4rem),56rem)] lg:grid-cols-12 lg:items-center lg:gap-8 lg:pb-24"
        style={{ paddingTop: 'calc(var(--navbar-h) + 2.5rem)' }}
      >
        <div className="lg:col-span-8">
          <Skeleton className="h-8 w-56 rounded-full" />
          <Skeleton className="mt-8 h-4 w-40" />
          <Skeleton className="mt-4 h-16 w-full max-w-2xl md:h-28" />
          <Skeleton className="mt-3 h-16 w-2/3 max-w-lg md:h-28" />
          <Skeleton className="mt-8 h-6 w-full max-w-xl" />
          <div className="mt-10 flex gap-3">
            <Skeleton className="h-14 w-44 rounded-full" />
            <Skeleton className="h-14 w-36 rounded-full" />
          </div>
        </div>
        <div className="mx-auto w-full max-w-xs sm:max-w-sm lg:col-span-4 lg:max-w-none">
          <Skeleton className="aspect-[4/5] w-full rounded-3xl" />
        </div>
      </div>
    </section>
  );
}

/** Placeholder for the sections under the hero while their data loads. */
export function BelowFoldSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="border-y border-line py-6">
        <Skeleton className="mx-auto h-5 w-3/4 max-w-3xl" />
      </div>
      <section className="py-section">
        <div className="container-page">
          <Skeleton className="mb-4 h-4 w-28" />
          <Skeleton className="mb-10 h-12 w-72" />
          <div className="grid gap-5 lg:grid-cols-6">
            <div className="card lg:col-span-6">
              <Skeleton className="aspect-[16/10] w-full rounded-none lg:aspect-[16/6]" />
            </div>
            <div className="card lg:col-span-3"><Skeleton className="aspect-[16/10] w-full rounded-none" /></div>
            <div className="card lg:col-span-3"><Skeleton className="aspect-[16/10] w-full rounded-none" /></div>
          </div>
        </div>
      </section>
    </div>
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
            <div key={i} className="card p-6">
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
            <div key={i} className="card overflow-hidden">
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
