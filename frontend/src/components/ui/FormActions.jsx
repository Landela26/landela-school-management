import { cn } from './utils';

export default function FormActions({ children, className = '' }) {
  return (
    <div className={cn('flex flex-col-reverse gap-3 border-t border-landela-border bg-landela-background/50 p-6 sm:flex-row sm:justify-end lg:px-8', className)}>
      {children}
    </div>
  );
}
