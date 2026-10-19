import { ShoppingBasket } from 'lucide-react'

/**
 * Tombol keranjang melayang (config/design.md §5.3).
 * `pulse` bertambah setiap item masuk; nilainya dipakai sebagai `key`
 * sehingga animasi bounce diputar ulang.
 */
export function CartFab({ count, pulse = 0, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Buka keranjang, ${count} item`}
      className="gingham-fine fixed right-4 bottom-4 z-50 rounded-full p-[5px] shadow-lift transition hover:scale-105 active:scale-95"
    >
      <span
        key={pulse}
        className={`grid size-16 place-items-center rounded-full bg-olive ${pulse > 0 ? 'animate-fab-pop' : ''}`}
      >
        <ShoppingBasket aria-hidden="true" className="size-8 text-lime-cream" />
      </span>

      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 grid min-w-7 place-items-center rounded-full border-2 border-white bg-gingham-red px-1.5 py-0.5 font-round text-sm font-bold text-white"
        >
          {count}
        </span>
      )}
    </button>
  )
}
