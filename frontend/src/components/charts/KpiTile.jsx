import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

/**
 * Tuile de chiffre clé. Avec `to`, la tuile entière mène à la section
 * correspondante du menu.
 */
export default function KpiTile({ label, value, icon: Icon, color, caption, to }) {
  const navigate = useNavigate()
  const Tag = to ? 'button' : 'div'

  return (
    <Tag
      {...(to ? { type: 'button', onClick: () => navigate(to) } : {})}
      className={`group flex w-full flex-col rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm ${
        to ? 'transition hover:border-navy/30 hover:shadow-md active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{label}</p>
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: `${color}1a`, color }}>
            <Icon size={16} strokeWidth={2.2} />
          </span>
        )}
      </div>
      <p className="mt-1 text-[30px] font-bold leading-none tracking-tight text-slate-900">{value}</p>
      <div className="mt-2 flex min-h-[18px] w-full items-center justify-between gap-2 text-xs text-slate-500">
        <span>{caption}</span>
        {to && <ChevronRight size={15} className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-navy" />}
      </div>
    </Tag>
  )
}
