const PageHeader = ({
  title,
  description,
  action,
  icon: Icon
}) => {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div className={Icon ? "flex items-center gap-4" : ""}>
        {Icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border theme-primary-border theme-primary-soft theme-primary-text shadow-sm transition-transform duration-200 hover:scale-105">
            <Icon size={24} strokeWidth={2} />
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold theme-text-primary">
            {title}
          </h1>

          {description && (
            <p className="mt-1 text-sm theme-text-muted">
              {description}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div>
          {action}
        </div>
      )}

    </div>
  );
};

export default PageHeader;