/** Nama produk: teks bulat tebal agar mudah dibaca (config/design.md §3). */
export function NameLabel({ name, className = '' }) {
  return (
    <span
      className={`inline-block font-round text-xl font-semibold leading-tight text-olive-dark md:text-[22px] ${className}`}
    >
      {name}
    </span>
  )
}
