import { CheckCircle2, X } from 'lucide-react'

/** Bannière de confirmation, avec action facultative (ex. « Voir la fiche »). */
export default function SuccessBanner({ message, onClose, action }) {
  if (!message) return null
  return (
    <div role="status" className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
      <div className="flex-1 text-sm text-emerald-800">
        {message}
        {action && (
          <button type="button" onClick={action.onClick}
            className="ml-2 font-semibold text-emerald-900 underline underline-offset-2 hover:no-underline">
            {action.label}
          </button>
        )}
      </div>
      <button type="button" onClick={onClose} aria-label="Fermer le message"
        className="text-emerald-600 transition hover:text-emerald-800">
        <X size={18} />
      </button>
    </div>
  )
}
