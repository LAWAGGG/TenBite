import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

// "T" script raksasa + "enbite" rounded tebal, keduanya bergaris tebal seperti
// huruf stiker di poster. Dirender sebagai SVG agar outline-nya tajam dan
// `paint-order: stroke` bisa dipakai (tidak didukung andal pada teks HTML).
const T_STYLE = {
  fontFamily: '"Lobster Two", Georgia, cursive',
  fontStyle: 'italic',
  fontWeight: 700,
  fontSize: 152,
}
const ENBITE_STYLE = {
  fontFamily: 'Fredoka, "Trebuchet MS", sans-serif',
  fontWeight: 700,
  fontSize: 88,
}

function Wordmark({ className = '' }) {
  return (
    <svg viewBox="0 0 420 168" className={className} role="img" aria-label="TenBite">
      {/* bayangan jatuh */}
      <g
        transform="translate(5 8)"
        fill="#3f4a24"
        stroke="#3f4a24"
        strokeWidth="18"
        strokeLinejoin="round"
        paintOrder="stroke"
        opacity="0.32"
      >
        <text x="34" y="126" style={T_STYLE}>
          T
        </text>
        <text x="114" y="126" style={ENBITE_STYLE}>
          enbite
        </text>
      </g>

      <text
        x="30"
        y="126"
        style={T_STYLE}
        fill="var(--color-olive)"
        stroke="var(--color-lime-cream)"
        strokeWidth="12"
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        T
      </text>
      <text
        x="110"
        y="126"
        style={ENBITE_STYLE}
        fill="var(--color-lime-cream)"
        stroke="var(--color-olive)"
        strokeWidth="12"
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        enbite
      </text>
    </svg>
  )
}

/**
 * Header halaman: hanya wordmark TenBite (config/design.md §5.1).
 * Badge edisi dan dekorasi koki dihapus; gambar pengganti menyusul.
 */
export function Header({ compact = false }) {
  const reduce = useReducedMotion()

  return (
    <header className={compact ? 'w-full py-4' : 'w-full pt-6 pb-2'}>
      <div className="mx-auto w-full max-w-[420px]">
        <Link
          to="/"
          aria-label="TenBite, ke halaman utama"
          className="block rounded-xl transition hover:scale-[1.02]"
        >
          {/* Wordmark "ditempel" turun dengan sedikit pegas, sekali saja saat muat */}
          <motion.span
            className="block"
            initial={reduce ? false : { opacity: 0, scale: 0.9, y: -12, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 190, damping: 16, mass: 0.9 }}
          >
            <Wordmark className="w-full" />
          </motion.span>
        </Link>
      </div>
    </header>
  )
}
