import { useState } from 'react'

/**
 * Rantai fallback foto produk:
 *   1. path dari kolom `gambar` di sheet (kalau diisi)
 *   2. ilustrasi lokal /uploads/products/<id>.svg
 *   3. gambar netral sebagai jalan terakhir
 *
 * Kolom `gambar` di sheet saat ini masih kosong untuk semua produk, jadi
 * ilustrasi lokal yang tampil. Begitu foto diunggah, cukup isi kolom itu.
 */
const NEUTRAL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f2e7cf'/%3E%3Ccircle cx='50' cy='52' r='28' fill='none' stroke='%23c9b28a' stroke-width='5'/%3E%3Ccircle cx='50' cy='52' r='12' fill='%23c9b28a'/%3E%3C/svg%3E"

export function ProductImage({ product, className = '' }) {
  const local = `/uploads/products/${product.id}.svg`
  const fromSheet = (product.gambar ?? '').trim()

  const sources = []
  if (fromSheet) sources.push(fromSheet)
  sources.push(local, NEUTRAL)

  const key = `${product.id}|${fromSheet}`
  const [state, setState] = useState({ key, step: 0 })

  // Produk berganti (atau foto di sheet diubah) -> mulai lagi dari sumber
  // pertama. Disesuaikan saat render agar tidak perlu render tambahan.
  if (state.key !== key) setState({ key, step: 0 })

  const step = state.key === key ? state.step : 0
  const src = sources[Math.min(step, sources.length - 1)]

  return (
    <img
      src={src}
      alt={product.nama}
      loading="lazy"
      decoding="async"
      onError={() =>
        setState((prev) => {
          const current = prev.key === key ? prev.step : 0
          // Berhenti di sumber terakhir supaya tidak ada loop error tanpa henti.
          return { key, step: Math.min(current + 1, sources.length - 1) }
        })
      }
      className={className}
    />
  )
}
