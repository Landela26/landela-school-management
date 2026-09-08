export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  icon,
}) {
  return (
    <header className="border-b border-landela-border bg-landela-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-6 lg:px-8">
        <div className="flex items-center gap-4">
          {action && action}

          <div>
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-landela-blue">
                {eyebrow}
              </p>
            )}

            {title && (
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-landela-text lg:text-[2.2rem]">
                {title}
              </h1>
            )}

            {subtitle && (
              <p className="mt-2 text-sm text-landela-text-secondary">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {icon && (
          <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-landela-blue-light text-landela-blue shadow-sm sm:flex">
            {icon}
          </div>
        )}
      </div>
    </header>
  );
}
