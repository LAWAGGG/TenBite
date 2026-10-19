import { useCallback, useEffect, useState } from 'react'
import { getBootstrap } from '../api/sheets.js'

/**
 * Memuat produk + settings sekali, lalu menyediakan reload().
 * Saat gagal, produk dari pemuatan terakhir dibiarkan tetap tampil,
 * sehingga tombol "Muat Ulang" tidak pernah mengosongkan halaman.
 */
export function useBootstrap() {
  const [state, setState] = useState({
    products: [],
    settings: {},
    loading: true,
    error: null,
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: null }))

    getBootstrap()
      .then((data) => {
        if (cancelled) return
        setState({ products: data.products, settings: data.settings, loading: false, error: null })
      })
      .catch((err) => {
        if (cancelled) return
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err?.message || 'Gagal memuat daftar produk.',
        }))
      })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  return { ...state, reload }
}
