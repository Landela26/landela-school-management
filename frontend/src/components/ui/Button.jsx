import { cn } from './utils';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  const variants = {
    primary:
      'bg-landela-blue text-white hover:bg-landela-blue-dark disabled:opacity-60',
    secondary:
      'border border-landela-border bg-white text-landela-text-secondary hover:bg-landela-background hover:text-landela-text disabled:opacity-50',
    ghost:
      'text-landela-text-secondary hover:bg-landela-background hover:text-landela-text',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
