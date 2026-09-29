const EmptyState = ({
  title = "No data found",
  message = "There is nothing to display."
}) => {
  return (
    <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-dashed theme-border theme-surface">
      <div className="text-center">
        <div className="text-4xl">📦</div>

        <h3 className="mt-3 text-lg font-semibold theme-text-primary">
          {title}
        </h3>

        <p className="mt-1 text-sm theme-text-muted">
          {message}
        </p>
      </div>
    </div>
  );
};

export default EmptyState;