import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { CartProvider, useCart } from './context/CartContext.jsx'
import { useBootstrap } from './hooks/useBootstrap.js'
import { PageBackdrop } from './components/PageBackdrop.jsx'
import { Footer } from './components/Footer.jsx'
import { CartFab } from './components/CartFab.jsx'
import { CartDrawer } from './components/CartDrawer.jsx'
import { SuccessModal } from './components/SuccessModal.jsx'
import { ProductListPage } from './pages/ProductListPage.jsx'
import { ProductDetailPage } from './pages/ProductDetailPage.jsx'

function RouteNotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="font-round text-2xl font-semibold text-olive-dark">
        Halaman tidak ditemukan
      </h1>
      <Link
        to="/"
        className="mt-5 inline-flex min-h-11 items-center rounded-full bg-olive px-6 py-2.5 font-round font-semibold text-lime-cream shadow-soft transition hover:-translate-y-0.5 hover:bg-olive-dark"
      >
        Lihat Menu
      </Link>
    </div>
  )
}

function Shell() {
  const { products, settings, loading, error, reload } = useBootstrap()
  const { add, count, clear, reconcile } = useCart()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pulse, setPulse] = useState(0)
  const [order, setOrder] = useState(null)

  // Harga, nama, dan stok di keranjang disegarkan setiap produk dimuat ulang.
  // Dijaga oleh `products.length > 0` agar keranjang tidak dikosongkan saat
  // pemuatan gagal dan `products` masih array kosong.
  useEffect(() => {
    if (products.length > 0) reconcile(products)
  }, [products, reconcile])

  const handleAdd = useCallback(
    (product, qty = 1) => {
      add(product, qty)
      setPulse((n) => n + 1)
    },
    [add],
  )

  // Server mengurangi stok setiap pesanan sukses, jadi produk wajib diambil ulang.
  const handleOrdered = useCallback(
    (result, payload) => {
      setOrder({
        orderId: result.orderId,
        total: result.total,
        nama: payload.nama,
        kelas: payload.kelas,
        no_telp: payload.no_telp,
        catatan: payload.catatan,
        metode_bayar: payload.metode_bayar,
        items: payload.items,
      })
      clear()
      setDrawerOpen(false)
      reload()
    },
    [clear, reload],
  )

  const handleFailed = useCallback(() => reload(), [reload])

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const closeSuccess = useCallback(() => setOrder(null), [])

  const pageProps = { products, settings, loading, error, onRetry: reload, storeOpen: settings.store_open !== false }

  return (
    <div className="isolate flex min-h-dvh flex-col">
      <PageBackdrop />

      <div className="mx-auto w-full max-w-[1100px] flex-1 px-4 pb-24">
        <Routes>
          <Route path="/" element={<ProductListPage {...pageProps} onAdd={handleAdd} />} />
          <Route
            path="/product/:id"
            element={
              <ProductDetailPage
                {...pageProps}
                onAdd={handleAdd}
                onOrdered={handleOrdered}
                onFailed={handleFailed}
              />
            }
          />
          <Route path="*" element={<RouteNotFound />} />
        </Routes>
      </div>

      <Footer settings={settings} />

      <CartFab count={count} pulse={pulse} onClick={openDrawer} />

      <CartDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        storeOpen={pageProps.storeOpen}
        onOrdered={handleOrdered}
        onFailed={handleFailed}
      />

      {order && <SuccessModal order={order} settings={settings} onClose={closeSuccess} />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Shell />
      </CartProvider>
    </BrowserRouter>
  )
}
