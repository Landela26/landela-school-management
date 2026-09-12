import { cn } from './utils';

export default function FormSection({ title, description, children, className = '' }) {
  return (
    <section className={cn('p-6 lg:p-8', className)}>
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-landela-text">{title}</h2>
        {description && <p className="mt-1 text-sm text-landela-text-secondary">{description}</p>}
      </div>

      {children}
    </section>
  );
}
