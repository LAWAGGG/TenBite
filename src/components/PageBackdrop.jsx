/**
 * Latar halaman berlapis (config/design.md §4):
 * foto taman yang di-blur, lalu taplak gingham di tepi bawah layar.
 * `isolate` pada pembungkus di App menjaga -z-10 tetap di belakang konten.
 */
export function PageBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 scale-105 bg-[url('/uploads/bg-garden.svg')] bg-cover bg-center blur-[4px]" />
      <div className="gingham absolute inset-x-0 bottom-0 h-11 shadow-[0_-6px_18px_rgba(58,46,34,0.18)]" />
    </div>
  )
}
