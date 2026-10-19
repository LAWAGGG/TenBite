import { useMemo, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { submitOrder } from '../api/sheets.js'
import { formatRupiah } from '../utils/format.js'
import { validateItemQty, validateOrder } from '../utils/validate.js'
import { PaymentOption } from './PaymentOption.jsx'
import { QrisPanel } from './QrisPanel.jsx'

const BLANK = { nama: '', kelas: '', no_telp: '', catatan: '', metode_bayar: '' }

function Field({ id, label, error, hint, value, onChange, multiline = false, ...rest }) {
  const describedBy =
    [hint ? `${id}-hint` : '', error ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined

  const shared = {
    id,
    value,
    onChange,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy,
    className: `mt-1.5 w-full rounded-xl border-[3px] bg-white px-3.5 py-2.5 font-body text-base text-ink placeholder:text-ink-soft/60 ${
      error ? 'border-danger/70' : 'border-cream-dark'
    }`,
    ...rest,
  }

  return (
    <div>
      <label htmlFor={id} className="block font-round text-sm font-semibold text-olive-dark">
        {label}
      </label>

      {multiline ? <textarea {...shared} /> : <input {...shared} />}

      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 font-body text-xs text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1 font-body text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Form pemesanan yang dipakai dua alur (config/prd.md FR-21, FR-40):
 * halaman detail produk dan checkout dari keranjang.
 *
 * `items` selalu berupa `{ id, nama, harga, qty, stok }` sehingga total
 * dihitung satu kali di sini. Server tetap menghitung ulang totalnya.
 */
export function OrderForm({ items, storeOpen = true, children = null, qtyControl = null, secondaryAction = null, onOrdered, onFailed }) {
  const [fields, setFields] = useState(BLANK)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [sending, setSending] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const total = useMemo(
    () => items.reduce((sum, it) => sum + it.harga * it.qty, 0),
    [items],
  )

  function setField(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const field = (key) => (event) => setField(key, event.target.value)

  async function handleSubmit(event) {
    event.preventDefault()
    if (sending) return

    setServerError('')

    // Stok di sheet bisa berubah setelah halaman dimuat — server akan menolak
    // dengan STOK_TIDAK_CUKUP, tapi lebih ramah bila dicegah lebih dulu.
    const stockErrors = []
    for (const it of items) {
      const message = validateItemQty(it.qty, it.stok)
      if (message) stockErrors.push(`${it.nama}: ${message}`)
    }

    // Jumlah sudah diperiksa per item di atas, jadi aturan `jumlah` tunggal
    // milik validateOrder tidak berlaku di sini.
    const { ok, errors: fieldErrors } = validateOrder(fields, { checkQty: false })
    setErrors(fieldErrors)

    if (!ok || stockErrors.length > 0) {
      setServerError(stockErrors.join(' '))
      setAttempt((n) => n + 1)
      return
    }

    setSending(true)
    try {
      const result = await submitOrder({ ...fields, items, website: honeypot })
      onOrdered(result, { ...fields, items })
    } catch (err) {
      setServerError(err?.message || 'Pesanan gagal dikirim. Coba lagi ya.')
      setAttempt((n) => n + 1)
      onFailed?.(err)
    } finally {
      setSending(false)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      {children}

      {/* Honeypot: tersembunyi dari manusia, tetap terisi oleh bot.
          id/name sengaja tidak memakai kata "website" — Chrome/autofill sering
          mengisinya otomatis, dan honeypot terisi = pesanan asli ditolak spam. */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="hp_ref">Jangan diisi</label>
        <input
          id="hp_ref"
          name="hp_ref"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="nama"
          label="Nama"
          type="text"
          autoComplete="name"
          maxLength={50}
          placeholder="Nama kamu"
          value={fields.nama}
          onChange={field('nama')}
          error={errors.nama}
        />
        <Field
          id="kelas"
          label="Kelas"
          type="text"
          maxLength={20}
          placeholder="XI-MP 1"
          value={fields.kelas}
          onChange={field('kelas')}
          error={errors.kelas}
        />
        <Field
          id="no_telp"
          label="Nomor Telepon"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={20}
          placeholder="081234567890"
          value={fields.no_telp}
          onChange={field('no_telp')}
          error={errors.no_telp}
        />
        <Field
          id="catatan"
          label="Catatan (opsional)"
          multiline
          rows={2}
          maxLength={200}
          placeholder="Tanpa pedas, saus dipisah…"
          value={fields.catatan}
          onChange={field('catatan')}
          error={errors.catatan}
          hint={`${fields.catatan.length}/200 karakter`}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-cream-dark bg-cream px-4 py-3">
        <div>
          <span className="block font-body text-xs tracking-wide text-ink-soft uppercase">
            Total pesanan
          </span>
          <output className="font-round text-2xl font-bold text-olive-dark">
            {formatRupiah(total)}
          </output>
        </div>
        {qtyControl}
      </div>

      <PaymentOption
        value={fields.metode_bayar}
        onChange={(v) => setField('metode_bayar', v)}
        error={errors.metode_bayar}
      />

      {fields.metode_bayar === 'QRIS' && <QrisPanel total={total} />}
      {fields.metode_bayar === 'COD' && (
        <p className="rounded-2xl border-2 border-cream-dark bg-cream px-4 py-3 font-body text-sm text-ink">
          Bayar saat pesanan diterima / diambil.
        </p>
      )}

      {serverError && (
        <div
          role="alert"
          className="rounded-2xl border-[3px] border-danger/50 bg-danger/8 px-4 py-3 text-center"
        >
          <p className="font-round font-semibold text-danger">Pesanan belum terkirim</p>
          <p className="mt-1 font-body text-sm text-ink">{serverError}</p>
          <button
            type="button"
            onClick={handleSubmit}
            className="mt-3 inline-flex min-h-11 items-center rounded-full border-2 border-danger px-5 py-2 font-round font-semibold text-danger transition hover:bg-danger/10"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {!storeOpen && (
        <p
          role="status"
          className="rounded-2xl border-[3px] border-danger/50 bg-cream px-4 py-3 text-center font-body text-sm text-ink"
        >
          Pemesanan sedang ditutup. Pantau terus ya, kami buka lagi nanti.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={sending || !storeOpen}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-olive px-6 py-3 font-round text-base font-semibold text-lime-cream shadow-soft transition hover:-translate-y-0.5 hover:bg-olive-dark disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-olive"
        >
          {sending && <LoaderCircle aria-hidden="true" className="size-5 shrink-0 animate-spin" />}
          {sending ? 'Mengirim pesanan…' : 'Pesan Sekarang'}
        </button>

        {secondaryAction}
      </div>

      <p aria-live="polite" className="sr-only">
        {attempt > 0 ? 'Pengiriman pesanan gagal atau belum lengkap.' : ''}
      </p>
    </form>
  )
}
