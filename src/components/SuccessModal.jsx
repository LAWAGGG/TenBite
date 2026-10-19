import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleCheck } from 'lucide-react'
import { buildOrderMessage, buildWaLink } from '../utils/whatsapp.js'
import { formatRupiah } from '../utils/format.js'
import { useDialogA11y } from '../hooks/useDialogA11y.js'

/** Jeda sebelum pindah otomatis ke WhatsApp, supaya kode pesanan sempat terbaca. */
const REDIRECT_DELAY = 1400

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2m5.8 14.13c-.25.7-1.44 1.34-1.99 1.39-.55.06-1.06.25-3.57-.83-2.94-1.27-4.77-4.38-4.91-4.58-.15-.2-1.17-1.6-1.17-3.05s.75-2.16 1.02-2.46c.27-.3.59-.37.79-.37s.4 0 .57.01c.18.01.42-.07.66.5.25.59.83 2.03.9 2.18.07.15.12.32.02.51-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.45.3.15.47.13.64-.08.17-.2.74-.86.94-1.16.2-.3.4-.24.66-.15.27.1 1.7.8 1.99.95.3.15.49.22.56.34.07.12.07.71-.18 1.41" />
    </svg>
  )
}

/**
 * Modal konfirmasi pesanan (config/prd.md FR-28, FR-43).
 *
 * Konfirmasi ke WhatsApp penjual bersifat wajib, jadi halaman langsung
 * dialihkan setelah jeda singkat. Tombol manual tetap disediakan sebagai
 * jalan keluar bila pengalihan diblokir atau gagal.
 */
export function SuccessModal({ order, settings = {}, onClose }) {
  const panelRef = useDialogA11y(true, onClose)
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  const waLink = useMemo(
    () => buildWaLink(settings.contact_phone, buildOrderMessage(order)),
    [settings.contact_phone, order],
  )

  const redirecting = Boolean(waLink) && !dismissed

  useEffect(() => {
    if (!waLink) return
    const timer = setTimeout(() => window.location.assign(waLink), REDIRECT_DELAY)
    return () => clearTimeout(timer)
  }, [waLink])

  function handleClose() {
    onClose()
    navigate('/')
  }

  return (
    <div className="fixed inset-0 z-60 grid place-items-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]" onClick={handleClose} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sukses-judul"
        className="animate-rise relative my-auto w-full max-w-md rounded-card border-[6px] border-cream-dark bg-paper p-6 text-center shadow-lift"
      >
        <img
          src="/uploads/chef.svg"
          alt=""
          aria-hidden="true"
          className="mx-auto w-24 drop-shadow-md"
        />

        <p className="mt-2 inline-flex items-center gap-2 font-round text-sm font-semibold text-success">
          <CircleCheck aria-hidden="true" className="size-5 shrink-0" />
          Pesanan terkirim
        </p>

        <h2 id="sukses-judul" className="mt-2 font-script text-3xl text-[#b8893f]">
          Makasih, {order.nama || 'kak'}!
        </h2>

        <p className="mt-2 font-body text-sm text-ink">
          Pesananmu sudah tersimpan. Simpan kode ini ya:
        </p>

        <p className="mt-2 inline-block rounded-xl border-2 border-cream-dark bg-cream px-5 py-2 font-round text-2xl font-bold tracking-wider text-olive-dark">
          {order.orderId || '-'}
        </p>

        <ul className="mt-4 divide-y divide-dashed divide-ink/15 border-y-2 border-dashed border-ink/25 py-2 text-left">
          {(order.items ?? []).map((it) => (
            <li key={it.id} className="flex justify-between gap-3 py-1.5 font-body text-sm">
              <span className="text-ink">
                {it.nama} <span className="text-ink-soft">×{it.qty}</span>
              </span>
              <span className="shrink-0 text-ink-soft">{formatRupiah(it.harga * it.qty)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center justify-between font-round">
          <span className="font-semibold text-olive-dark">Total</span>
          <span className="text-xl font-bold text-olive-dark">
            {formatRupiah(order.total ?? 0)}
          </span>
        </div>

        <p className="mt-1 font-body text-xs text-ink-soft">
          Metode: {order.metode_bayar === 'QRIS' ? 'Scan QRIS' : 'Bayar di Tempat'}
        </p>

        <p aria-live="polite" className="mt-4 font-body text-sm text-ink">
          {waLink && redirecting
            ? 'Mengalihkan ke WhatsApp penjual…'
            : 'Kirim kode pesanan ini ke penjual lewat WhatsApp ya.'}
        </p>

        <div className="mt-3 space-y-2">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setDismissed(true)}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-olive px-5 py-3 font-round font-semibold text-lime-cream shadow-soft transition hover:-translate-y-0.5 hover:bg-olive-dark"
            >
              <WhatsAppIcon />
              Konfirmasi ke WhatsApp
            </a>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full border-2 border-olive bg-cream px-5 py-3 font-round font-semibold text-olive-dark transition hover:bg-cream-dark"
          >
            Kembali Belanja
          </button>
        </div>
      </div>
    </div>
  )
}
