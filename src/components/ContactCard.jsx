import { FileText } from 'lucide-react'
import { buildWaLink } from '../utils/whatsapp.js'

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2m5.8 14.13c-.25.7-1.44 1.34-1.99 1.39-.55.06-1.06.25-3.57-.83-2.94-1.27-4.77-4.38-4.91-4.58-.15-.2-1.17-1.6-1.17-3.05s.75-2.16 1.02-2.46c.27-.3.59-.37.79-.37s.4 0 .57.01c.18.01.42-.07.66.5.25.59.83 2.03.9 2.18.07.15.12.32.02.51-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.45.3.15.47.13.64-.08.17-.2.74-.86.94-1.16.2-.3.4-.24.66-.15.27.1 1.7.8 1.99.95.3.15.49.22.56.34.07.12.07.71-.18 1.41" />
    </svg>
  )
}

/** Kontak penjual: WhatsApp + tautan Google Form (config/design.md §5.1). */
export function ContactCard({ settings }) {
  const { contact_name, contact_phone, contact_form_url } = settings
  if (!contact_name && !contact_phone && !contact_form_url) return null

  const waLink = buildWaLink(contact_phone, `Halo ${contact_name || 'kak'}, saya mau tanya soal danusan TenBite.`)

  return (
    <section
      aria-labelledby="kontak-heading"
      className="w-full rounded-card border-4 border-cream-dark bg-cream p-5 shadow-soft sm:p-6"
    >
      <h2 id="kontak-heading" className="font-round text-lg font-semibold text-olive-dark md:text-xl">
        Tanya atau pesan langsung
      </h2>

      {contact_name && (
        <p className="mt-1 font-body text-sm text-ink-soft md:text-base">
          {contact_name}
          {contact_phone ? ` · ${contact_phone}` : ''}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {contact_phone && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-olive px-4 py-2.5 font-round font-semibold text-lime-cream shadow-soft transition hover:-translate-y-0.5 hover:bg-olive-dark"
          >
            <WhatsAppIcon />
            Chat WhatsApp
          </a>
        )}

        {contact_form_url && (
          <a
            href={contact_form_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-olive bg-cream px-4 py-2.5 font-round font-semibold text-olive-dark transition hover:-translate-y-0.5 hover:bg-cream-dark"
          >
            <FileText aria-hidden="true" className="size-5 shrink-0" />
            Isi formulir
          </a>
        )}
      </div>
    </section>
  )
}
