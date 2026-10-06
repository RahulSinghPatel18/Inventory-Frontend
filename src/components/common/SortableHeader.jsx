import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

const SortableHeader = ({ field, sortBy, sortOrder, onSort, children, className = "" }) => {
  const active = sortBy === field;
  const nextOrder = active && sortOrder === "asc" ? "desc" : "asc";
  const Icon = !active ? ArrowUpDown : sortOrder === "asc" ? ArrowUp : ArrowDown;

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1 text-left hover:theme-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${className}`}
      onClick={() => onSort(field, nextOrder)}
      aria-label={`Sort by ${children}, currently ${active ? `sorted ${sortOrder}` : "unsorted"}. Activate for ${nextOrder}.`}
      aria-pressed={active}
    >
      {children}
      <Icon size={14} aria-hidden="true" />
      {active && <span className="sr-only">{sortOrder === "asc" ? "ascending" : "descending"}</span>}
    </button>
  );
};

export default SortableHeader;
