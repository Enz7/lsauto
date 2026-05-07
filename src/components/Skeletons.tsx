
export const CarSkeleton = () => (
  <div className="bg-dark-card border border-white/5 rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-[16/10] bg-white/5" />
    <div className="p-4 space-y-4">
      <div className="h-6 bg-white/5 rounded w-3/4" />
      <div className="h-4 bg-white/5 rounded w-1/2" />
      <div className="flex justify-between items-end pt-4">
        <div className="h-8 bg-white/5 rounded w-1/3" />
        <div className="h-4 bg-white/5 rounded w-1/4" />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-10 bg-white/5 rounded w-1/4" />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl" />)}
    </div>
    <div className="h-64 bg-white/5 rounded-3xl" />
  </div>
);
