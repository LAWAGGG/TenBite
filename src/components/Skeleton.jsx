/**
 * Placeholder loading produk. Bentuknya meniru box model ProductCard
 * (foto + label nama & harga kiri-kanan + tombol ikon & Detail) agar tidak ada
 * pergeseran tata letak saat produk asli muncul.
 */
export function Skeleton({ count = 6 }) {
  return (
    <div aria-hidden="true" className="grid gap-6 sm:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex animate-pulse flex-col rounded-card border-2 border-cream-dark bg-paper p-3.5 sm:p-4"
        >
          <div className="aspect-square rounded-xl border-[3px] border-wood-dark/30 bg-wood/40 sm:aspect-[4/3]" />

          <div className="mt-4 flex flex-1 flex-col">
            <div className="flex items-center justify-between gap-3">
              <div className="h-7 w-1/2 rounded bg-cream-dark/70" />
              <div className="h-5 w-20 rounded bg-ink/10" />
            </div>

            <div className="mt-auto flex w-full gap-2 pt-4">
              <div className="size-11 shrink-0 rounded-lg bg-olive/30" />
              <div className="h-11 flex-1 rounded-lg bg-cream/80" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
