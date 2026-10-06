import { Link } from "react-router-dom";
import Button from "./Button";

const BusinessStats = ({ items, loading, error, onRetry }) => {
  const gridColumns = items.length === 4
    ? "sm:grid-cols-2 lg:grid-cols-4"
    : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";

  return (
    <>
      {error && <div role="alert" className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border theme-danger-border theme-danger-soft p-3 text-sm theme-danger"><span>{error}</span>{onRetry && <Button variant="outline" onClick={onRetry}>Retry</Button>}</div>}
      <div className={`mb-5 grid gap-4 ${gridColumns}`}>
        {loading
          ? items.map(({ label }) => (
            <div key={label} className="animate-pulse rounded-2xl border theme-border theme-surface p-4 sm:p-5" aria-label={`Loading ${label}`}>
              <div className="h-4 w-2/3 rounded theme-surface-secondary" />
              <div className="mt-4 h-8 w-4/5 rounded theme-surface-secondary" />
            </div>
          ))
          : items.map(({ label, value, icon: Icon, tone, to }) => {
            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium theme-text-muted">{label}</p>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-3 break-words text-2xl font-bold tracking-tight theme-text-primary">{value ?? "—"}</p>
              </>
            );
            return to
              ? <Link key={label} to={to} className="group rounded-2xl border theme-border theme-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">{content}</Link>
              : <div key={label} className="rounded-2xl border theme-border theme-surface p-4 shadow-sm sm:p-5">{content}</div>;
          })}
      </div>
    </>
  );
};

export default BusinessStats;
