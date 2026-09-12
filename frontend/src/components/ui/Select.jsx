import { cn } from './utils';

export default function Select({
  className = '',
  invalid = false,
  children,
  ...props
}) {
  return (
    <select
      {...props}
      className={cn(
        'w-full rounded-lg border bg-white px-4 py-3 text-sm text-landela-text outline-none transition',
        invalid
          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
          : 'border-landela-border focus:border-landela-blue focus:ring-2 focus:ring-landela-blue/10',
        className,
      )}
    >
      {children}
    </select>
  );
}
