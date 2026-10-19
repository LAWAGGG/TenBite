/** Ubah nomor Indonesia apa pun menjadi digit format internasional (62...). */
export function normalizePhone(input) {
  const digits = String(input ?? '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('0')) return '62' + digits.slice(1)
  if (digits.startsWith('8')) return '62' + digits
  return digits
}

export function buildWaLink(phone, message) {
  const digits = normalizePhone(phone)
  const text = encodeURIComponent(message ?? '')
  return digits ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`
}

const rupiah = (n) => 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID')

// Nama metode untuk dibaca manusia di chat penjual: kode server 'COD' tampil 'Cash'.
const METODE_LABEL = { QRIS: 'QRIS', COD: 'Cash' }

function metodeLabel(metode) {
  return METODE_LABEL[metode] || metode || '-'
}

/**
 * Ringkasan pesanan untuk dikirim ke penjual lewat WhatsApp setelah sukses.
 * Server tetap menyimpan data aslinya di sheet `Orders`; pesan ini hanya
 * jembatan konfirmasi dan bukti bayar.
 */
export function buildOrderMessage(order) {
  const lines = [
    `Halo, saya sudah pesan di TenBite.`,
    ``,
    `Kode pesanan: ${order.orderId || '-'}`,
    `Nama: ${order.nama || '-'}`,
    `Kelas: ${order.kelas || '-'}`,
    `No. HP: ${order.no_telp || '-'}`,
    ``,
    `Pesanan:`,
  ]

  for (const it of order.items ?? []) {
    lines.push(`- ${it.nama} x${it.qty} = ${rupiah(it.harga * it.qty)}`)
  }

  lines.push(``, `Total: ${rupiah(order.total)}`, `Metode: ${metodeLabel(order.metode_bayar)}`)

  if (order.catatan) lines.push(`Catatan: ${order.catatan}`)
  if (order.metode_bayar === 'QRIS') {
    lines.push(``, `Saya kirim bukti transfer QRIS-nya di chat ini ya.`)
  }

  return lines.join('\n')
}
