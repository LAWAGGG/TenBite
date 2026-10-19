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
        <img
          src="/uploads/basket.svg"
          alt=""
          aria-hidden="true"
          className="mx-auto mb-3 w-24 drop-shadow-md sm:w-28"
        />
        <p className="font-round text-base font-semibold">TenBite · danusan piknik</p>
        {settings.contact_name && (
          <p className="mt-1 font-body text-xs opacity-90">Pesan lewat {settings.contact_name}</p>
        )}
      </div>
    </footer>
  )
}
