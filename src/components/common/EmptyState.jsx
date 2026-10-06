import { PackageSearch } from "lucide-react";

const EmptyState = ({
  title = "No data found",
  message = "There is nothing to display.",
  icon: Icon = PackageSearch,
  action,
  headingLevel: Heading = "h2",
  className = ""
}) => {
  return (
    <section className={`flex min-h-[250px] flex-col items-center justify-center px-6 py-10 text-center ${className}`}>
      <div className="theme-primary-soft theme-primary-text mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
        <Icon size={28} aria-hidden="true" />
      </div>

      <Heading className="text-lg font-semibold theme-text-primary">
        {title}
      </Heading>

      <p className="mt-2 max-w-sm text-sm theme-text-muted">
        {message}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </section>
  );
};

export default EmptyState;