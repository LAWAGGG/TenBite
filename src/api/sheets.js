/**
 * Lapisan data ke Google Apps Script Web App.
 *
 * Catatan penting soal POST:
 * - Content-Type harus "text/plain;charset=utf-8" dengan body berupa string JSON.
 *   Kalau pakai application/json, browser mengirim preflight OPTIONS yang tidak
 *   didukung Apps Script dan request akan gagal.
 * - Apps Script membalas 302 ke script.googleusercontent.com. fetch mengikuti
 *   redirect itu otomatis dan mengubahnya jadi GET (perilaku standar browser),
 *   jadi tidak perlu penanganan khusus. CORS "access-control-allow-origin: *"
 *   sudah ada di kedua hop.
 */

const ENDPOINT = import.meta.env?.VITE_APPS_SCRIPT_URL

// Apps Script butuh 2-4 detik untuk satu panggilan; 20 detik sudah lebih dari
// cukup dan mencegah tombol berputar tanpa akhir saat jaringan menggantung.
const POST_TIMEOUT_MS = 20000
const RETRY_DELAY_MS = 900

function apiError(message, code, retryable = false) {
  const err = new Error(message)
  err.code = code
  err.retryable = retryable
  return err
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function toBool(value, fallback = true) {
  if (typeof value === 'boolean') return value
  if (value === null || value === undefined || value === '') return fallback
  return !['false', '0', 'no', 'tidak', 'off'].includes(String(value).trim().toLowerCase())
}

async function readJson(res, retryable = false) {
  // Apps Script kadang membalas halaman HTML saat kuota habis atau deploy dicabut.
  const raw = await res.text()
  try {
    return JSON.parse(raw)
  } catch {
    throw apiError(
      'Server membalas dengan format yang tidak dikenal. Coba lagi sebentar.',
      'RESPONS_TIDAK_VALID',
      retryable,
    )
  }
}

/**
 * Pesan untuk pembeli, bukan teks mentah dari server.
 * `SERVER_ERROR` sering berisi exception internal (mis. lock timeout) yang
 * membingungkan kalau ditampilkan apa adanya.
 */
function friendlyServerMessage(json) {
  const pesan = typeof json?.message === 'string' ? json.message.trim() : ''

  switch (json?.error) {
    // Pesan server untuk kasus ini sudah spesifik dan berbahasa Indonesia
    // (contoh: "Stok Nasi Ayam Geprek tersisa 1").
    case 'VALIDASI_GAGAL':
    case 'STOK_TIDAK_CUKUP':
    case 'PRODUK_TIDAK_DITEMUKAN':
    case 'TOKO_TUTUP':
      return pesan || 'Pesanan belum bisa diproses. Cek lagi data pesananmu ya.'
    case 'SPAM_TERDETEKSI':
      return 'Pesanan tidak bisa diproses otomatis. Kirim pesananmu lewat WhatsApp penjual ya.'
    default:
      return 'Server sedang ramai memproses pesanan lain. Tunggu sebentar, lalu coba kirim lagi ya.'
  }
}

function normalizeProduct(raw, index) {
  return {
    id: String(raw?.id ?? '').trim(),
    nama: String(raw?.nama ?? '').trim(),
    harga: Number(raw?.harga) || 0,
    deskripsi: String(raw?.deskripsi ?? '').trim(),
    gambar: String(raw?.gambar ?? '').trim(),
    stok: Number(raw?.stok) || 0,
    urutan: Number(raw?.urutan) || index + 1,
  }
}

function normalizeSettings(raw) {
  return {
    banner_text: String(raw?.banner_text ?? '').trim(),
    contact_name: String(raw?.contact_name ?? '').trim(),
    contact_phone: String(raw?.contact_phone ?? '').trim(),
    contact_form_url: String(raw?.contact_form_url ?? '').trim(),
    store_open: toBool(raw?.store_open, true),
  }
}

export async function getBootstrap() {
  if (!ENDPOINT) {
    throw apiError('Alamat server belum diatur. Isi VITE_APPS_SCRIPT_URL di file .env.', 'KONFIGURASI')
  }

  let res
  try {
    res = await fetch(`${ENDPOINT}?action=bootstrap`)
  } catch {
    throw apiError('Tidak bisa menghubungi server. Periksa koneksi internetmu.', 'JARINGAN')
  }

  if (!res.ok) {
    throw apiError('Server sedang tidak bisa dihubungi. Coba muat ulang.', 'JARINGAN')
  }

  const json = await readJson(res)
  if (!json?.ok) {
    throw apiError(json?.message || 'Gagal memuat daftar produk.', json?.error || 'SERVER_ERROR')
  }

  const products = (Array.isArray(json.products) ? json.products : [])
    .map(normalizeProduct)
    .filter((p) => p.id && p.nama)
    .sort((a, b) => a.urutan - b.urutan)

  return { products, settings: normalizeSettings(json.settings) }
}

/** Satu percobaan kirim. Melempar Error dengan `.code` dan `.retryable`. */
async function postOrder(body) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), POST_TIMEOUT_MS)

  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      signal: controller.signal,
    })
  } catch (err) {
    if (err?.name === 'AbortError') {
      // Tidak diulang otomatis: pesanan bisa saja sudah tercatat di sheet.
      throw apiError(
        'Server belum menjawab sampai 20 detik. Pesananmu mungkin sudah masuk — cek dulu ke WhatsApp penjual sebelum mengirim ulang.',
        'BATAS_WAKTU',
      )
    }
    throw apiError('Pesanan gagal terkirim karena masalah koneksi. Coba lagi ya.', 'JARINGAN', true)
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    throw apiError(
      'Server sedang sibuk. Coba kirim lagi sebentar.',
      'SERVER_SIBUK',
      res.status >= 500,
    )
  }

  const json = await readJson(res, true)
  if (!json?.ok) {
    throw apiError(friendlyServerMessage(json), json?.error || 'SERVER_ERROR')
  }

  return { orderId: String(json.orderId ?? ''), total: Number(json.total) || 0 }
}

/**
 * Kirim pesanan. Melempar Error dengan `.code` berisi kode error server
 * (VALIDASI_GAGAL, STOK_TIDAK_CUKUP, TOKO_TUTUP, ...) dan pesan siap tampil.
 */
export async function submitOrder({ nama, kelas, no_telp, catatan, metode_bayar, items, website = '' }) {
  if (!ENDPOINT) {
    throw apiError('Alamat server belum diatur. Isi VITE_APPS_SCRIPT_URL di file .env.', 'KONFIGURASI')
  }

  const body = JSON.stringify({
    nama: nama.trim(),
    kelas: kelas.trim(),
    no_telp: no_telp.trim(),
    catatan: catatan.trim(),
    metode_bayar,
    items: items.map((it) => ({ id: it.id, qty: it.qty })),
    website,
  })

  try {
    return await postOrder(body)
  } catch (err) {
    // Satu percobaan ulang, hanya untuk kegagalan transport (koneksi gagal,
    // server balas 5xx, atau balasan bukan JSON) — di situ server tidak
    // menghasilkan pesanan. Kegagalan bisnis dan habis waktu tidak diulang,
    // supaya pesanan tidak tercatat dua kali.
    // shortcut: server belum punya idempotency key; tambahkan kunci unik per
    // kiriman bila duplikasi pesanan mulai terjadi.
    if (!err?.retryable) throw err

    await sleep(RETRY_DELAY_MS)
    return await postOrder(body)
  }
}
