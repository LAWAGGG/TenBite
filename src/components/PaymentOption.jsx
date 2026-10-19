import { Banknote, CircleCheck, QrCode } from 'lucide-react'

const OPTIONS = [
  { value: 'QRIS', label: 'QRIS', Icon: QrCode },
  { value: 'COD', label: 'Cash', Icon: Banknote },
]

/**
 * Radio card metode pembayaran (config/design.md §6.2).
 * Input radio asli disembunyikan secara visual (`sr-only`) tetapi tetap
 * fokusable; cincin fokus muncul di kartu lewat `has-[:focus-visible]`.
 */
export function PaymentOption({ value, onChange, error }) {
  return (
    <fieldset>
      <legend className="mb-2 font-round text-sm font-semibold text-olive-dark">
        Metode pembayaran
      </legend>

      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map(({ value: v, label, Icon }) => {
          const selected = value === v
          return (
            <label
              key={v}
              className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border-[3px] p-4 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-olive has-[:focus-visible]:outline-offset-2 ${
                selected
                  ? 'border-olive bg-cream shadow-soft'
                  : 'border-cream-dark bg-white hover:bg-cream/50'
              } ${error ? 'border-danger/60' : ''}`}
            >
              <input
                type="radio"
                name="metode_bayar"
                value={v}
                checked={selected}
                onChange={() => onChange(v)}
                className="sr-only"
              />

              <Icon aria-hidden="true" className="size-6 shrink-0 text-olive-dark" />

              <span className="min-w-0 font-round font-semibold text-olive-dark">{label}</span>

              {selected && (
                <CircleCheck
                  aria-hidden="true"
                  className="absolute top-2 right-2 size-5 text-olive"
                />
              )}
            </label>
          )
        })}
      </div>

      {error && <p className="mt-2 font-body text-sm text-danger">{error}</p>}
    </fieldset>
  )
}
