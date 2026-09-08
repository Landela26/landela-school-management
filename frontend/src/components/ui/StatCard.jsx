import { cn } from './utils';

export default function StatCard({
  label,
  value,
  hint,
  icon,
  iconClassName = '',
  className = '',
}) {
  return (
    <div
      className={cn(
        'min-h-[170px] rounded-[14px] border border-landela-border bg-landela-surface p-7 shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-landela-text-secondary">{label}</p>
          <p className="mt-4 text-4xl font-bold tracking-tight text-landela-text">{value}</p>
        </div>

        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-[12px]',
            iconClassName,
          )}
        >
          {icon}
        </div>
      </div>

      <p className="mt-5 text-xs text-landela-text-light">{hint}</p>
    </div>
  );
}
