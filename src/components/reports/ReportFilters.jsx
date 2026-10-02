import { Filter, RefreshCw } from "lucide-react";
import Button from "../common/Button";
import Select from "../common/Select";

const ReportFilters = ({
  filters,
  categories,
  categoryError,
  loading,
  onChange,
  onApply,
  onReset
}) => (
  <form onSubmit={onApply} className="rounded-xl border theme-border theme-surface p-4 shadow-sm sm:p-5">
    <div className="mb-4 flex items-center gap-2 theme-text-secondary">
      <Filter size={17} /><h2 className="text-sm font-semibold">Report filters</h2>
    </div>
    <div className="grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
      <Select
        label="Category"
        name="reportCategory"
        value={filters.category}
        onChange={(event) => onChange("category", event.target.value)}
        placeholder={categoryError ? "Categories unavailable" : "All categories"}
        options={categories.map((category) => ({ value: category._id, label: category.name }))}
        disabled={!!categoryError}
      />
      <Select
        label="Stock type"
        name="reportStockType"
        value={filters.type}
        onChange={(event) => onChange("type", event.target.value)}
        placeholder="In and out"
        options={[
          { value: "in", label: "Stock in" },
          { value: "out", label: "Stock out" }
        ]}
      />
      <DateFilter label="From" name="reportStartDate" value={filters.startDate} onChange={(value) => onChange("startDate", value)} />
      <DateFilter label="To" name="reportEndDate" value={filters.endDate} onChange={(value) => onChange("endDate", value)} />
      <div className="flex gap-2 sm:col-span-2 xl:col-span-1">
        <Button type="submit" disabled={loading} className="flex-1 xl:flex-none">Apply</Button>
        <Button type="button" variant="outline" onClick={onReset} disabled={loading} aria-label="Reset filters" title="Reset filters" className="px-3">
          <RefreshCw size={16} />
        </Button>
      </div>
    </div>
  </form>
);

const DateFilter = ({ label, name, value, onChange }) => (
  <div>
    <label htmlFor={name} className="mb-1.5 block text-sm font-semibold theme-text-primary">{label}</label>
    <input
      id={name}
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="theme-input w-full rounded-xl border px-4 py-3 text-sm theme-text-primary outline-none"
    />
  </div>
);

export default ReportFilters;
