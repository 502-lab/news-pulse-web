export default function NewsFeedSkeleton() {
  return (
    <ul aria-busy="true" aria-label="뉴스 로딩 중">
      {Array.from({ length: 10 }).map((_, i) => (
        <li key={i} className="flex gap-4 p-4 border-b border-white/5">
          <div className="skel w-40 h-[90px] rounded-lg shrink-0" />
          <div className="flex-1 flex flex-col gap-2 pt-1">
            <div className="skel h-4 w-full rounded" />
            <div className="skel h-4 w-3/4 rounded" />
            <div className="skel h-3 w-24 rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}
