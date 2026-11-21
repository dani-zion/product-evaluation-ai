/** Same shape as ProductCard, shown while a page of products loads. */
export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex h-full flex-col overflow-hidden rounded-xl border bg-card motion-safe:animate-pulse"
    >
      <div className="aspect-[4/3] border-b bg-secondary" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-5 w-3/4 rounded bg-secondary" />
        <div className="flex flex-col gap-2">
          <div className="h-3.5 w-full rounded bg-secondary/70" />
          <div className="h-3.5 w-5/6 rounded bg-secondary/70" />
        </div>
        <div className="mt-3 h-7 w-12 rounded bg-secondary" />
      </div>
    </div>
  );
}
