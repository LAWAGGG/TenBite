import { buildWaLink } from '../utils/whatsapp.js'

/**
 * Keadaan gagal memuat produk. Menyediakan tombol coba lagi dan, sesuai
 * config/prd.md §10, kontak WhatsApp penjual sebagai jalur cadangan.
 */
export function ErrorState({ message, settings = {}, onRetry }) {
  const waLink = settings.contact_phone
    ? buildWaLink(
        settings.contact_phone,
        'Halo, saya tidak bisa membuka daftar produk di website TenBite.',
      )
    : ''

  return (
    <div
      role="alert"
      className="mx-auto w-full max-w-md rounded-card border-4 border-danger/35 bg-paper p-6 text-center shadow-soft"
    >
      <p className="font-round text-lg font-semibold text-danger">Gagal memuat produk</p>
      <p className="mt-2 font-body text-sm text-ink">{message}</p>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center rounded-full bg-olive px-5 py-2.5 font-round font-semibold text-lime-cream shadow-soft transition hover:-translate-y-0.5 hover:bg-olive-dark"
        >
          Muat Ulang
        </button>

        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-full border-2 border-olive bg-cream px-5 py-2.5 font-round font-semibold text-olive-dark transition hover:-translate-y-0.5 hover:bg-cream-dark"
          >
            Tanya penjual
          </a>
        )}
      </div>
    </div>
  )
}
