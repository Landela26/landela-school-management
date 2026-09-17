import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * Modale accessible et animée (portée sur <body>).
 * - Entrée : scale 0.95 -> 1 + opacity, ease-out ~200ms (respecte prefers-reduced-motion)
 * - Fermeture : Escape, clic sur le fond, ou bouton ✕
 * - Verrouille le scroll de la page pendant l'ouverture
 */
export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)

  // Montage + animation d'entrée / sortie
  useEffect(() => {
    if (open) {
      setMounted(true)
      const id = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(id)
    }
    setVisible(false)
    const t = setTimeout(() => setMounted(false), 200)
    return () => clearTimeout(t)
  }, [open])

  // Escape + verrou du scroll pendant que la modale est montée
  useEffect(() => {
    if (!mounted) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [mounted, onClose])

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Fond (scrim) */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-200 motion-reduce:transition-none ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panneau */}
      <div
        className={`relative flex max-h-[calc(100vh-2rem)] w-full ${maxWidth} flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl transition duration-200 ease-out motion-reduce:transition-none ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
