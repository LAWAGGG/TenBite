import { Header } from '../components/Header.jsx'
import { Banner } from '../components/Banner.jsx'
import { ProductCard } from '../components/ProductCard.jsx'
import { ContactCard } from '../components/ContactCard.jsx'
import { Skeleton } from '../components/Skeleton.jsx'
import { ErrorState } from '../components/ErrorState.jsx'

/**
 * Halaman 1 — daftar produk.
 * Urutan bagian mengikuti config/design.md §5.1.
 */
export function ProductListPage({ products, settings, loading, error, onRetry, onAdd, storeOpen }) {
  const firstLoad = loading && products.length === 0
  const totalFailure = !loading && products.length === 0 && Boolean(error)

  return (
    <div>
      <Header />

      <main className="mt-2 space-y-8">
        {!storeOpen && (
          <div className="flex justify-center">
            <Banner text="Pemesanan sedang ditutup. Kami buka lagi nanti ya!" />
          </div>
        )}

        {error && products.length > 0 && (
          <p
            role="status"
            className="rounded-2xl border-2 border-danger/40 bg-cream px-4 py-3 text-center font-body text-sm text-ink"
          >
            Gagal menyegarkan data terbaru. Yang tampil sekarang adalah data terakhir.
          </p>
        )}

        {firstLoad ? (
          <Skeleton />
        ) : totalFailure ? (
          <ErrorState message={error} settings={settings} onRetry={onRetry} />
        ) : (
          <section
            aria-labelledby="menu-judul"
            className="cork-board rounded-card border-[10px] border-wood-dark p-4 shadow-lift sm:p-7"
          >
            <h1 id="menu-judul" className="sr-only">
              Menu danusan TenBite
            </h1>

            {products.length === 0 ? (
              <p className="py-14 text-center font-round text-base text-[#4a3418]">
                Belum ada danusan yang siap dijual hari ini.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    storeOpen={storeOpen}
                    onAdd={onAdd}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        <ContactCard settings={settings} />
      </main>
    </div>
  )
}
