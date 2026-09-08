import { cn } from './utils';

export default function Input({
  className = '',
  invalid = false,
  iconLeft,
  ...props
}) {
  return (
    <div className="relative w-full">
      {iconLeft && (
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-landela-text-light">
          {iconLeft}
        </div>
      )}

      <input
        {...props}
        className={cn(
          'w-full rounded-lg border bg-white px-4 py-3 text-sm text-landela-text outline-none transition placeholder:text-landela-text-light',
          iconLeft && 'pl-11',
          invalid
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-landela-border focus:border-landela-blue focus:ring-2 focus:ring-landela-blue/10',
          className,
        )}
      />
    </div>
  );
}
