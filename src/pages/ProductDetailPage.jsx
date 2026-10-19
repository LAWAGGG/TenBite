import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Minus, Plus } from 'lucide-react'
import { Header } from '../components/Header.jsx'
import { HabisStamp } from '../components/ProductCard.jsx'
import { NameLabel } from '../components/NameLabel.jsx'
import { PriceStar } from '../components/PriceStar.jsx'
import { ProductImage } from '../components/ProductImage.jsx'
import { OrderForm } from '../components/OrderForm.jsx'
import { ErrorState } from '../components/ErrorState.jsx'
import { formatRupiah } from '../utils/format.js'
import { SERVER_MAX_QTY } from '../utils/validate.js'

function BackLink() {
  return (
    <Link
      to="/"
      className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-olive bg-cream px-4 py-2 font-round font-semibold text-olive-dark transition hover:-translate-y-0.5 hover:bg-cream-dark"
    >
      <ArrowLeft aria-hidden="true" className="size-5" />
      Kembali
    </Link>
  )
}

function QtyStepper({ qty, cap, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-round text-sm font-semibold text-olive-dark">Jumlah</span>
      <div className="flex items-center rounded-full border-2 border-cream-dark bg-white">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, qty - 1))}
          disabled={qty <= 1}
          aria-label="Kurangi jumlah"
          className="grid size-11 place-items-center rounded-full text-olive-dark transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
        >
          <Minus aria-hidden="true" className="size-4" />
        </button>

        <span aria-live="polite" className="min-w-8 text-center font-round text-lg font-semibold text-ink">
          {qty}
        </span>

        <button
          type="button"
          onClick={() => onChange(Math.min(cap, qty + 1))}
          disabled={qty >= cap}
          aria-label="Tambah jumlah"
          className="grid size-11 place-items-center rounded-full text-olive-dark transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
        >
          <Plus aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  )
}

function NotFound({ settings, onRetry }) {
  return (
    <div className="py-10">
      <BackLink />
      <div className="mt-6 rounded-card border-4 border-cream-dark bg-cream p-8 text-center shadow-soft">
        <img
          src="/uploads/chef.svg"
          alt=""
          aria-hidden="true"
          className="mx-auto w-24 opacity-90"
        />
        <h1 className="mt-3 font-round text-xl font-semibold text-olive-dark">
          Produk tidak ditemukan
        </h1>
        <p className="mt-2 font-body text-sm text-ink">
          Mungkin produknya sudah habis atau tautannya salah.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center rounded-full bg-olive px-5 py-2.5 font-round font-semibold text-lime-cream shadow-soft transition hover:-translate-y-0.5 hover:bg-olive-dark"
          >
            Lihat Menu
          </Link>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-11 items-center rounded-full border-2 border-olive bg-cream px-5 py-2.5 font-round font-semibold text-olive-dark transition hover:-translate-y-0.5 hover:bg-cream-dark"
          >
            Muat Ulang
          </button>
        </div>
      </div>
      <div className="mt-8">
        <ErrorState message="Kontak penjual" settings={settings} onRetry={onRetry} />
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto w-full max-w-2xl animate-pulse">
      <BackLink />
      <div className="mt-6 gingham-fine rounded-card p-2">
        <div className="rounded-[14px] bg-cream p-5 sm:p-6">
          <div className="aspect-[4/3] rounded-xl border-[3px] border-wood-dark/30 bg-wood/40" />

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="h-7 w-1/2 rounded bg-cream-dark/70" />
            <div className="h-6 w-24 rounded bg-ink/10" />
          </div>

          <div className="mt-3 h-4 w-full rounded bg-ink/10" />
          <div className="mt-6 h-9 w-40 rounded bg-cream-dark/60" />
          <div className="mt-4 h-72 rounded-2xl bg-cream-dark/40" />
        </div>
      </div>
    </div>
  )
}

/** Halaman 2 — detail produk + form pemesanan (config/design.md §6). */
export function ProductDetailPage({
  products,
  settings,
  loading,
  error,
  onRetry,
  onAdd,
  onOrdered,
  onFailed,
  storeOpen,
}) {
  const { id } = useParams()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [lastId, setLastId] = useState(id)

  const product = products.find((p) => p.id === id)

  // Produk berganti -> jumlah dan pesan "masuk keranjang" kembali ke awal.
  // Disesuaikan saat render, bukan lewat effect, agar tidak ada render ganda.
  if (lastId !== id) {
    setLastId(id)
    setQty(1)
    setAdded(false)
  }

  // Stok bisa turun setelah data disegarkan; jumlah dijaga tetap di rentang sah
  // tanpa perlu effect.
  const cap = product ? Math.min(product.stok, SERVER_MAX_QTY) : 1
  const jumlah = Math.min(Math.max(1, qty), Math.max(1, cap))

  const items = useMemo(
    () =>
      product
        ? [{ id: product.id, nama: product.nama, harga: product.harga, stok: product.stok, qty: jumlah }]
        : [],
    [product, jumlah],
  )

  if (loading && products.length === 0) {
    return (
      <div>
        <Header compact />
        <DetailSkeleton />
      </div>
    )
  }

  if (!product) {
    return (
      <div>
        <Header compact />
        {error ? (
          <ErrorState message={error} settings={settings} onRetry={onRetry} />
        ) : (
          <NotFound settings={settings} onRetry={onRetry} />
        )}
      </div>
    )
  }

  const habis = product.stok < 1
  const bisaPesan = storeOpen && !habis

  function handleAdd() {
    onAdd(product, jumlah)
    setAdded(true)
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Header compact />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink />
        {habis ? (
          <p className="rounded-full border-2 border-danger/60 bg-cream px-4 py-1.5 font-round text-sm font-semibold text-danger">
            Stok habis
          </p>
        ) : (
          <p className="rounded-full border-2 border-olive/40 bg-cream px-4 py-1.5 font-round text-sm text-olive-dark">
            Sisa {product.stok} porsi
          </p>
        )}
      </div>

      {/* Detail produk menyatu di dalam kartu serbet yang sama dengan form. */}
      <section aria-labelledby="form-judul" className="mt-6">
        <div className="gingham-fine rounded-card p-2 shadow-lift">
          <div className="rounded-[14px] bg-cream p-5 sm:p-6">
            {/* Foto full lebar kolom; nama/harga dan deskripsi menumpuk di bawahnya. */}
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-xl border-[3px] border-wood-dark/70 bg-wood">
                <ProductImage
                  product={product}
                  className={`h-full w-full object-cover ${habis ? 'grayscale' : ''}`}
                />
              </div>

              <span className="absolute -top-2 -right-2 block w-[68px] -rotate-[8deg] drop-shadow-md sm:w-[92px]">
                <PriceStar value={product.harga} className="w-full" />
              </span>

              {habis && <HabisStamp />}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <h1>
                <NameLabel name={product.nama} />
              </h1>

              <p className="shrink-0 font-round text-xl font-bold text-olive-dark sm:text-2xl">
                {formatRupiah(product.harga)}
              </p>
            </div>

            {product.deskripsi && (
              <p className="mt-2 font-body text-sm text-ink sm:text-base">{product.deskripsi}</p>
            )}

            <h2 id="form-judul" className="mt-6 font-round text-xl font-semibold text-olive-dark">
              Form Pemesanan
            </h2>
            <p className="mt-1 font-body text-sm text-ink-soft">
              Isi datamu, lalu tekan Pesan Sekarang. Kode pesanan langsung muncul.
            </p>

            <div className="mt-5">
              <OrderForm
                items={items}
                storeOpen={bisaPesan}
                onOrdered={onOrdered}
                onFailed={onFailed}
                qtyControl={<QtyStepper qty={jumlah} cap={cap} onChange={setQty} />}
                secondaryAction={
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!bisaPesan}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-olive bg-cream px-6 py-3 font-round font-semibold text-olive-dark transition hover:bg-cream-dark disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Tambah ke Keranjang
                  </button>
                }
              />
            </div>

            <p aria-live="polite" className="mt-3 font-body text-sm text-success">
              {added ? `${jumlah} ${product.nama} masuk keranjang.` : ''}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
