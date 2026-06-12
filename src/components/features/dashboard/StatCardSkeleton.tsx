export default function StatCardSkeleton() {
  return (
    <div className="bg-white/5 rounded-xl p-5 h-[120px] flex flex-col gap-3" aria-hidden="true">
      <div className="skel h-4 w-24 rounded" />
      <div className="skel h-8 w-16 rounded" />
      <div className="skel h-3 w-20 rounded" />
    </div>
  );
}
