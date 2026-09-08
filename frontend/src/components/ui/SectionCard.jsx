import { cn } from './utils';

export default function SectionCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={cn('rounded-[14px] border border-landela-border bg-landela-surface p-7 shadow-sm lg:p-8', className)}>
      <div className="mb-7">
        <h3 className="text-xl font-bold text-landela-text">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-landela-text-secondary">{subtitle}</p>}
      </div>

      {children}
    </div>
  );
}
