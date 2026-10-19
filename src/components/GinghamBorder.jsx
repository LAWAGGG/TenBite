/**
 * Pembatas bermotif kotak-kotak merah-putih.
 * Tinggi diatur pemanggil lewat className — pakai `gingham-fine` untuk strip
 * tipis, karena pola 28px tidak muat di bawah ~24px dan akan tampak seperti
 * garis merah biasa.
 */
export function GinghamBorder({ fine = false, className = '' }) {
  return <div aria-hidden="true" className={`${fine ? 'gingham-fine' : 'gingham'} ${className}`} />
}
