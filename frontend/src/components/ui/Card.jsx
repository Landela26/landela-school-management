import { cn } from './utils';

export default function Card({ className = '', children, ...props }) {
  return (
    <div
      {...props}
      className={cn(
        'rounded-[14px] border border-landela-border bg-landela-surface shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}
