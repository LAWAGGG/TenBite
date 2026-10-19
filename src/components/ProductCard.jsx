import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { PriceStar } from './PriceStar.jsx'
import { NameLabel } from './NameLabel.jsx'
import { ProductImage } from './ProductImage.jsx'
import { formatRupiah } from '../utils/format.js'

// Rotasi bintang tetap (bukan acak) supaya tidak berubah tiap render.
const TILT = [
  '-rotate-[9deg]',
  'rotate-[7deg]',
  '-rotate-[6deg]',
  'rotate-[10deg]',
  '-rotate-[11deg]',
  'rotate-[8deg]',
]

/** Paku payung merah yang menancapkan kartu ke papan gabus. */
function Pin() {
  return (
    <span
      aria-hidden="true"
      className="absolute -top-3 left-1/2 z-10 size-7 -translate-x-1/2 rounded-full bg-gradient-to-br from-[#ef6b68] to-[#b6201e] shadow-[0_3px_6px_rgba(58,46,34,0.45),inset_0_-2px_4px_rgba(0,0,0,0.28),inset_0_2px_3px_rgba(255,255,255,0.45)]"
    >
      <span className="absolute top-1 left-1.5 size-1.5 rounded-full bg-white/65" />
    </span>
  )
}

export function HabisStamp() {
  return (
    <span className="pointer-events-none absolute inset-0 grid place-items-center rounded-xl bg-white/45">
      <span className="-rotate-12 rounded-md border-4 border-danger/80 bg-white/70 px-3 py-1 font-round text-lg font-bold tracking-[0.2em] text-danger">
        HABIS
      </span>
    </span>
  )
}

/**
 * Kartu produk: kertas putih yang dipaku ke papan gabus.
 * Foto persegi di dalam bingkai kayu, bintang harga di sudut kanan atas,
 * nama dan harga berdampingan.
 */
export function ProductCard({ product, index = 0, storeOpen = true, onAdd }) {
  const habis = product.stok < 1
  const blocked = habis || !storeOpen
  const reduce = useReducedMotion()

  // Kartu masuk satu per satu seperti ditempel ke papan, lalu terangkat saat hover.
  // Transform dipegang Framer Motion, jadi transisi transform CSS tidak dipakai di sini.
  const enter = {
    initial: reduce ? false : { opacity: 0, y: 28, rotate: index % 2 ? 1.4 : -1.4 },
    animate: { opacity: 1, y: 0, rotate: 0 },
    transition: {
      duration: 0.36,
      ease: 'easeOut',
      delay: reduce ? 0 : Math.min(index, 8) * 0.07,
    },
  }

  return (
    <motion.article
      {...enter}
      whileHover={reduce ? undefined : { y: -4 }}
      className="group relative flex h-full flex-col rounded-card border-2 border-cream-dark bg-paper p-3.5 shadow-soft transition-shadow duration-300 hover:shadow-lift sm:p-4"
    >
      <Pin />

      <div className="relative">
        <div className="aspect-square overflow-hidden rounded-xl border-[3px] border-wood-dark/70 bg-wood sm:aspect-[4/3]">
          <ProductImage
            product={product}
            className={`h-full w-full object-cover ${habis ? 'grayscale' : ''}`}
          />
        </div>

        <span
          className={`absolute -top-2 -right-2 block w-[68px] drop-shadow-md sm:w-[76px] ${TILT[index % TILT.length]}`}
        >
          <PriceStar
            value={product.harga}
            className="w-full group-hover:animate-wobble"
          />
        </span>

        {habis && <HabisStamp />}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <NameLabel name={product.nama} className="max-w-full" />

          <p className="shrink-0 font-round text-lg font-bold text-olive-dark">
            {formatRupiah(product.harga)}
          </p>
        </div>

        {!habis && product.stok <= 5 && (
          <p className="mt-1 font-round text-xs font-semibold text-danger">Sisa {product.stok} lagi</p>
        )}

        <div className="mt-auto flex w-full gap-2 pt-4">
          <button
            type="button"
            onClick={() => onAdd(product, 1)}
            disabled={blocked}
            aria-label={`Tambah ${product.nama} ke keranjang`}
            className="grid size-11 shrink-0 place-items-center rounded-lg bg-olive text-lime-cream shadow-soft transition hover:bg-olive-dark disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-olive"
          >
            <ShoppingCart aria-hidden="true" className="size-5" />
          </button>

          <Link
            to={`/product/${product.id}`}
            aria-label={`Lihat detail ${product.nama}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border-2 border-olive bg-cream px-4 py-2.5 font-round text-sm font-semibold text-olive-dark transition hover:bg-cream-dark sm:text-base"
          >
            Beli
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
