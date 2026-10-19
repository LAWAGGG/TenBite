/**
 * Aturan validasi form pemesanan — satu-satunya tempat aturan ini hidup.
 * Dipakai bersama oleh halaman detail produk dan checkout dari keranjang.
 *
 * Cermin dari validasi server (Apps Script). Validasi di sini hanya untuk UX:
 * server tetap menghitung ulang total dan memvalidasi ulang setiap field.
 */

// 08xxxxxxxx (9-14 digit) atau +628xxxxxxxx / 628xxxxxxxx
const PHONE_RE = /^(?:\+62|62|0)8\d{7,12}$/

/** Batas keras dari server: qty harus bilangan bulat 1-99. */
export const SERVER_MAX_QTY = 99

/**
 * Aturan jumlah untuk satu item. Dipakai form jumlah di halaman detail
 * maupun pengecekan ulang tiap baris keranjang sebelum dikirim.
 * Mengembalikan string pesan error, atau string kosong bila valid.
 */
export function validateItemQty(qty, stok) {
  const cap = Math.min(Number(stok) || 0, SERVER_MAX_QTY)
  const n = Number(qty)
  if (!Number.isInteger(n) || n < 1) return 'Jumlah minimal 1.'
  if (n > cap) return cap > 0 ? `Jumlah maksimal ${cap}.` : 'Stok sedang habis.'
  return ''
}

/**
 * `checkQty: false` dipakai checkout keranjang, yang punya satu jumlah per item
 * dan memvalidasi tiap barisnya sendiri lewat `validateItemQty`.
 */
export function validateOrder(fields, { maxQty = SERVER_MAX_QTY, checkQty = true } = {}) {
  const errors = {}

  const nama = (fields.nama ?? '').trim()
  const kelas = (fields.kelas ?? '').trim()
  const noTelp = (fields.no_telp ?? '').trim()
  const catatan = (fields.catatan ?? '').trim()
  const metode = fields.metode_bayar ?? ''

  if (nama.length < 2 || nama.length > 50) {
    errors.nama = 'Nama wajib diisi, 2–50 karakter.'
  }

  if (kelas.length === 0 || kelas.length > 20) {
    errors.kelas = 'Kelas wajib diisi, maksimal 20 karakter.'
  }

  const digits = noTelp.replace(/[\s.\-()]/g, '')
  if (digits.length === 0) {
    errors.no_telp = 'Nomor telepon wajib diisi.'
  } else if (!PHONE_RE.test(digits)) {
    errors.no_telp = 'Gunakan format 08xxxxxxxx atau +628xxxxxxxx.'
  }

  if (checkQty) {
    const qtyError = validateItemQty(fields.jumlah, maxQty)
    if (qtyError) errors.jumlah = qtyError
  }

  if (catatan.length > 200) {
    errors.catatan = 'Catatan maksimal 200 karakter.'
  }

  if (metode !== 'QRIS' && metode !== 'COD') {
    errors.metode_bayar = 'Pilih metode pembayaran.'
  }

  return { ok: Object.keys(errors).length === 0, errors }
}
