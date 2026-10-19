import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Dihitung, bukan disimpan sebagai boolean, supaya drawer + modal yang sempat
// terbuka bersamaan tidak saling membuka kunci scroll lebih awal.
let scrollLocks = 0

function lockScroll() {
  if (scrollLocks === 0) document.body.style.overflow = 'hidden'
  scrollLocks += 1
}

function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1)
  if (scrollLocks === 0) document.body.style.overflow = ''
}

/**
 * Perilaku dialog yang diwajibkan config/design.md §12: Esc menutup, fokus
 * terkurung di dalam panel, fokus dikembalikan ke pemicu, scroll body terkunci.
 * Mengembalikan ref yang harus dipasang ke elemen panel.
 */
export function useDialogA11y(open, onClose) {
  const panelRef = useRef(null)
  const restoreRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const panel = panelRef.current
    restoreRef.current = document.activeElement
    lockScroll()

    const focusables = () =>
      Array.from(panel?.querySelectorAll(FOCUSABLE) ?? []).filter((el) => el.offsetParent !== null)

    if (!panel?.contains(document.activeElement)) focusables()[0]?.focus()

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const list = focusables()
      if (list.length === 0) return

      const first = list[0]
      const last = list[list.length - 1]
      const active = document.activeElement

      if (!panel.contains(active)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      unlockScroll()
      const target = restoreRef.current
      if (target instanceof HTMLElement && document.contains(target)) target.focus()
    }
  }, [open, onClose])

  return panelRef
}
