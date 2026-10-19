import { useState } from 'react'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { formatRupiah } from '../utils/format.js'
import { SERVER_MAX_QTY } from '../utils/validate.js'
import { useDialogA11y } from '../hooks/useDialogA11y.js'
import { ProductImage } from './ProductImage.jsx'
import { GinghamBorder } from './GinghamBorder.jsx'
import { OrderForm } from './OrderForm.jsx'

function Stepper({ item, onChange }) {
  const cap = Math.min(item.stok, SERVER_MAX_QTY)

  return (
    <div className="flex items-center rounded-full border-2 border-cream-dark bg-white">
      <button
        type="button"
        onClick={() => onChange(item.id, item.qty - 1)}
        disabled={item.qty <= 1}
        aria-label={`Kurangi jumlah ${item.nama}`}
        className="grid size-11 place-items-center rounded-full text-olive-dark transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
      >
        <Minus aria-hidden="true" className="size-4" />
      </button>

      <span aria-live="polite" className="min-w-6 text-center font-round font-semibold text-ink">
        {item.qty}
      </span>

      <button
        type="button"
        onClick={() => onChange(item.id, item.qty + 1)}
        disabled={item.qty >= cap}
        aria-label={`Tambah jumlah ${item.nama}`}
        className="grid size-11 place-items-center rounded-full text-olive-dark transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}

function CartItem({ item, onChange, onRemove }) {
  return (
    <li className="flex gap-3 border-b border-dashed border-ink/20 py-3 last:border-0">
      <span className="mt-0.5 size-14 shrink-0 overflow-hidden rounded-full border-[3px] border-wood-dark bg-wood">
        <ProductImage product={item} className="h-full w-full object-cover" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-round text-sm font-semibold text-olive-dark">{item.nama}</p>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Hapus ${item.nama} dari keranjang`}
            className="-mt-2 -mr-3 grid size-11 shrink-0 place-items-center rounded-full text-ink-soft transition hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 aria-hidden="true" className="size-5" />
          </button>
        </div>

        <p className="font-body text-xs text-ink-soft">{formatRupiah(item.harga)} / porsi</p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <Stepper item={item} onChange={onChange} />
          <p className="font-round text-sm font-semibold text-ink">
            {formatRupiah(item.harga * item.qty)}
          </p>
        </div>
      </div>
    </li>
  )
}

function EmptyState({ onClose }) {
  return (
    <div className="px-6 py-10 text-center">
      <img
        src="/uploads/basket.svg"
        alt=""
        aria-hidden="true"
        className="mx-auto w-32 drop-shadow-md"
      />
      <p className="mt-3 font-round text-lg font-semibold text-olive-dark">
        Keranjangmu masih kosong
      </p>
      <p className="mt-1 font-body text-sm text-ink-soft">
        Pilih danusan dulu ya. Stoknya terbatas.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-5 inline-flex min-h-11 items-center rounded-full bg-olive px-6 py-2.5 font-round font-semibold text-lime-cream shadow-soft transition hover:-translate-y-0.5 hover:bg-olive-dark"
      >
        Lihat Menu
      </button>
    </div>
  )
}

function ReceiptSummary({ items, total, count }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-ink/30 bg-white/70 p-4">
      <p className="font-round text-sm font-semibold text-olive-dark">Ringkasan pesanan</p>
      <ul className="mt-2">
        {items.map((it) => (
          <li key={it.id} className="flex justify-between gap-3 py-1 font-body text-sm">
            <span className="min-w-0 text-ink">
              {it.nama} <span className="text-ink-soft">×{it.qty}</span>
            </span>
            <span className="shrink-0 text-ink-soft">{formatRupiah(it.harga * it.qty)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center justify-between border-t-2 border-dashed border-ink/25 pt-2 font-round">
        <span className="font-semibold text-olive-dark">Total ({count} porsi)</span>
        <span className="text-lg font-bold text-olive-dark">{formatRupiah(total)}</span>
      </div>
    </div>
  )
}

/**
 * Drawer keranjang (config/design.md §5.4).
 * Langkah `cart` menampilkan daftar item; langkah `checkout` menampilkan
 * form pemesanan dengan ringkasan seluruh isi keranjang.
 */
export function CartDrawer({ open, onClose, storeOpen = true, onOrdered, onFailed }) {
  const { items, count, total, setQty, remove } = useCart()
  const [step, setStep] = useState('cart')
  const panelRef = useDialogA11y(open, onClose)

  // Drawer selalu dibuka pada daftar item, bukan di langkah checkout terakhir.
  const [wasOpen, setWasOpen] = useState(open)
  if (wasOpen !== open) {
    setWasOpen(open)
    if (!open) setStep('cart')
  }

  const showCheckout = step === 'checkout' && items.length > 0

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}
      inert={open ? undefined : true}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink/50 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="keranjang-judul"
        className={`receipt-paper absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-3xl shadow-lift transition-transform duration-250 ease-out sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[430px] sm:rounded-t-none sm:rounded-l-3xl ${
          open ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full sm:translate-y-0'
        }`}
      >
        <GinghamBorder fine className="h-4 shrink-0 rounded-t-3xl sm:rounded-t-none sm:rounded-tl-3xl" />

        <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
          <h2 id="keranjang-judul" className="font-round text-lg font-semibold text-olive-dark">
            {showCheckout ? 'Data Pemesan' : 'Keranjang'}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup keranjang"
            className="grid size-11 place-items-center rounded-full text-ink-soft transition hover:bg-cream hover:text-ink"
          >
            <X aria-hidden="true" className="size-6" />
          </button>
        </header>

        {items.length === 0 ? (
          <EmptyState onClose={onClose} />
        ) : showCheckout ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-6">
            <OrderForm
              items={items}
              storeOpen={storeOpen}
              onOrdered={onOrdered}
              onFailed={onFailed}
              secondaryAction={
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-olive bg-cream px-6 py-3 font-round font-semibold text-olive-dark transition hover:bg-cream-dark"
                >
                  Ubah Keranjang
                </button>
              }
            >
              <ReceiptSummary items={items} total={total} count={count} />
            </OrderForm>
          </div>
        ) : (
          <>
            <ul className="min-h-0 flex-1 overflow-y-auto px-5 pt-1">
              {items.map((item) => (
                <CartItem key={item.id} item={item} onChange={setQty} onRemove={remove} />
              ))}
            </ul>

            <div className="shrink-0 border-t-2 border-dashed border-ink/25 px-5 pt-3 pb-6">
              <div className="flex items-baseline justify-between font-round">
                <span className="font-semibold text-olive-dark">Total</span>
                <span className="text-2xl font-bold text-olive-dark">{formatRupiah(total)}</span>
              </div>
              <p className="mt-0.5 font-body text-xs text-ink-soft">{count} porsi</p>

              <button
                type="button"
                onClick={() => setStep('checkout')}
                disabled={!storeOpen}
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-olive px-6 py-3 font-round text-base font-semibold text-lime-cream shadow-soft transition hover:-translate-y-0.5 hover:bg-olive-dark disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                Pesan Semua
              </button>

              {!storeOpen && (
                <p role="status" className="mt-2 text-center font-body text-sm text-danger">
                  Pemesanan sedang ditutup.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
