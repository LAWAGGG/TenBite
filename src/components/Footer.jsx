import { GinghamBorder } from './GinghamBorder.jsx'

/**
 * Footer kain gingham + keranjang stroberi (config/design.md §5.1).
 * `pb-14` memberi ruang untuk taplak gingham tetap di tepi bawah layar
 * dari PageBackdrop, supaya tidak ada teks yang tertutup.
 */
export function Footer({ settings = {} }) {
  return (
    <footer className="mt-12">
      <GinghamBorder fine className="h-6" />
      <div className="bg-olive/95 px-4 pt-8 pb-20 text-center text-lime-cream">
        <p className="font-round text-base font-semibold">TenBite 59 </p>
        <p className="mt-1 font-body text-xs opacity-90">Pesan Sekarang!</p>
      </div>
    </footer>
  )
}
