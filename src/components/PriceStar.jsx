import { formatRupiah, formatShortPrice } from '../utils/format.js'

// Bintang 5 sudut, jari-jari luar 50, dalam 22, sudut atas menghadap ke atas.
const STAR_PATH =
  'M50 0 L62.93 32.2 L97.55 34.55 L70.92 56.8 L79.39 90.45 L50 72 L20.61 90.45 L29.08 56.8 L2.45 34.55 L37.07 32.2 Z'

/** Badge harga berbentuk bintang kuning. Harga ditulis singkat: "10k". */
export function PriceStar({ value, className = '' }) {
  const text = formatShortPrice(value)

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={`Harga ${formatRupiah(value)}`}
    >
      <path
        d={STAR_PATH}
        fill="var(--color-star)"
        stroke="var(--color-star-border)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <text
        x="50"
        y="57"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Fredoka, sans-serif"
        fontWeight="700"
        fontSize={text.length <= 2 ? 32 : text.length === 3 ? 27 : 23}
        fill="#fff"
        stroke="#8a5220"
        strokeWidth="1.7"
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {text}
      </text>
    </svg>
  )
}
