// src/components/ui/StatCard.jsx

const TONE_STYLES = {
  default: {
    card: "bg-slate-50 border-slate-200",
    value: "text-slate-900",
    icon: "bg-white text-slate-600 border-slate-200",
  },

  info: {
    card: "bg-sky-50 border-sky-100",
    value: "text-sky-900",
    icon: "bg-white text-sky-600 border-sky-100",
  },

  success: {
    card: "bg-emerald-50 border-emerald-100",
    value: "text-emerald-900",
    icon: "bg-white text-emerald-600 border-emerald-100",
  },

  gold: {
    card: "bg-amber-50 border-amber-100",
    value: "text-amber-900",
    icon: "bg-white text-amber-600 border-amber-100",
  },

  warning: {
    card: "bg-orange-50 border-orange-100",
    value: "text-orange-900",
    icon: "bg-white text-orange-600 border-orange-100",
  },

  danger: {
    card: "bg-rose-50 border-rose-100",
    value: "text-rose-900",
    icon: "bg-white text-rose-600 border-rose-100",
  },
};

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  className = "",
}) {
  const styles = TONE_STYLES[tone] || TONE_STYLES.default;

  const formattedValue =
    typeof value === "number"
      ? value.toLocaleString("fr-FR")
      : value ?? 0;

  return (
    <div
      className={`
        flex min-h-[112px] items-center justify-between
        border px-5 py-4
        rounded-md
        ${styles.card}
        ${className}
      `}
    >
      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
          {label}
        </p>

        <p
          className={`
            mt-2
            font-display
            text-[30px]
            font-bold
            leading-none
            tracking-tight
            tabular-nums
            ${styles.value}
          `}
        >
          {formattedValue}
        </p>
      </div>

      {Icon && (
        <div
          className={`
            ml-5
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-md
            border
            ${styles.icon}
          `}
        >
          <Icon size={19} strokeWidth={2} />
        </div>
      )}
    </div>
  );
}

export default StatCard;