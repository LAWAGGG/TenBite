import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { SERVER_MAX_QTY } from '../utils/validate.js'

const STORAGE_KEY = 'tenbite.cart.v1'

const CartContext = createContext(null)

/**
 * Batas qty: minimal 1, maksimal min(stok, 99).
 * 99 adalah batas keras server ("Jumlah harus bilangan bulat 1–99").
 * Mengembalikan 0 bila stok habis — pemanggil memperlakukan itu sebagai "buang item".
 */
function clampQty(qty, stok) {
  const stock = Number(stok) || 0
  const cap = Math.min(stock, SERVER_MAX_QTY)
  if (cap < 1) return 0
  const n = Math.round(Number(qty) || 0)
  return Math.min(Math.max(1, n), cap)
}

function toItem(raw) {
  return {
    id: String(raw?.id ?? ''),
    nama: String(raw?.nama ?? ''),
    harga: Number(raw?.harga) || 0,
    gambar: String(raw?.gambar ?? ''),
    stok: Number(raw?.stok) || 0,
    qty: Math.max(1, Math.round(Number(raw?.qty) || 1)),
  }
}

/** Baca localStorage dengan aman: JSON rusak / mode privat -> keranjang kosong, bukan layar putih. */
function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(toItem).filter((it) => it.id)
  } catch {
    return []
  }
}

function reducer(items, action) {
  switch (action.type) {
    case 'ADD': {
      const p = action.product
      const existing = items.find((it) => it.id === p.id)
      const qty = clampQty((existing?.qty ?? 0) + (action.qty ?? 1), p.stok)
      if (qty < 1) return items
      const merged = {
        id: p.id,
        nama: p.nama,
        harga: p.harga,
        gambar: p.gambar,
        stok: p.stok,
        qty,
      }
      return existing
        ? items.map((it) => (it.id === p.id ? merged : it))
        : [...items, merged]
    }

    case 'SET_QTY': {
      const item = items.find((it) => it.id === action.id)
      if (!item) return items
      const qty = clampQty(action.qty, item.stok)
      if (qty < 1) return items.filter((it) => it.id !== action.id)
      if (qty === item.qty) return items
      return items.map((it) => (it.id === action.id ? { ...it, qty } : it))
    }

    case 'REMOVE':
      return items.some((it) => it.id === action.id)
        ? items.filter((it) => it.id !== action.id)
        : items

    case 'CLEAR':
      return items.length === 0 ? items : []

    /**
     * Segarkan harga/nama/stok dari sheet. Item yang produknya sudah tidak ada
     * atau stoknya habis dibuang. Mengembalikan `items` yang sama persis bila
     * tidak ada perubahan — tanpa ini, efek reconcile di App akan berputar tanpa henti.
     */
    case 'RECONCILE': {
      const byId = new Map(action.products.map((p) => [p.id, p]))
      const next = []
      let changed = false

      for (const it of items) {
        const fresh = byId.get(it.id)
        if (!fresh || fresh.stok < 1) {
          changed = true
          continue
        }
        const qty = clampQty(it.qty, fresh.stok)
        if (qty < 1) {
          changed = true
          continue
        }
        if (
          qty !== it.qty ||
          fresh.harga !== it.harga ||
          fresh.nama !== it.nama ||
          fresh.stok !== it.stok ||
          fresh.gambar !== it.gambar
        ) {
          changed = true
        }
        next.push({
          id: fresh.id,
          nama: fresh.nama,
          harga: fresh.harga,
          gambar: fresh.gambar,
          stok: fresh.stok,
          qty,
        })
      }

      return changed ? next : items
    }

    default:
      return items
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, loadStored)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // localStorage penuh atau diblokir — keranjang tetap jalan untuk sesi ini
    }
  }, [items])

  // Semua aksi stabil, sehingga efek reconcile di App tidak ikut ter-trigger
  // setiap kali isi keranjang berubah.
  const add = useCallback((product, qty = 1) => dispatch({ type: 'ADD', product, qty }), [])
  const setQty = useCallback((id, qty) => dispatch({ type: 'SET_QTY', id, qty }), [])
  const remove = useCallback((id) => dispatch({ type: 'REMOVE', id }), [])
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), [])
  const reconcile = useCallback((products) => dispatch({ type: 'RECONCILE', products }), [])

  const value = useMemo(() => {
    let count = 0
    let total = 0
    for (const it of items) {
      count += it.qty
      total += it.harga * it.qty
    }
    return { items, count, total, add, setQty, remove, clear, reconcile }
  }, [items, add, setQty, remove, clear, reconcile])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart harus dipakai di dalam CartProvider')
  return ctx
}
