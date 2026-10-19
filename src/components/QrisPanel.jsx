import { useState } from 'react'
import { formatRupiah } from '../utils/format.js'

// qris.png adalah berkas yang diunggah developer. .jpg didukung sebagai
// jalan tengah, lalu placeholder supaya tidak pernah muncul gambar rusak.
const SOURCES = ['/uploads/qris.png', '/uploads/qris.jpg', '/uploads/qris-placeholder.svg']

/** Panel QRIS: gambar kode QR beserta nominal tagihan (config/design.md §6.2). */
export function QrisPanel({ total }) {
  const [step, setStep] = useState(0)
  const src = SOURCES[step]

  return (
    <div className="rounded-2xl border-2 border-cream-dark bg-white p-4 text-center">
      <p className="font-body text-xs tracking-wide text-ink-soft uppercase">Total tagihan</p>
      <p className="font-round text-2xl font-bold text-olive-dark">{formatRupiah(total)}</p>

      <img
        src={src}
        alt="Kode QRIS untuk pembayaran"
        onError={() => setStep((s) => Math.min(s + 1, SOURCES.length - 1))}
        className="mx-auto mt-3 w-full max-w-[240px] rounded-xl border border-cream-dark bg-white object-contain"
      />

      <p className="mt-3 font-body text-sm text-ink">
        Scan lalu tekan <strong className="font-round">Pesan Sekarang</strong>.
      </p>
      <p className="mt-1 font-body text-xs text-ink-soft">
        Pembayaran diverifikasi manual oleh penjual, jadi simpan bukti transfermu.
      </p>
    </div>
  )
}
