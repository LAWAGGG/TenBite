export function formatRupiah(value) {
  const n = Math.round(Number(value) || 0)
  return 'Rp' + n.toLocaleString('id-ID')
}

/** Harga singkat untuk badge bintang: 10000 -> "10k", 12500 -> "12,5k". */
export function formatShortPrice(value) {
  const n = Math.round(Number(value) || 0)
  if (n < 1000) return String(n)
  const rounded = Math.round((n / 1000) * 10) / 10
  return String(rounded).replace('.', ',') + 'k'
}
