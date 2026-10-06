import Input from "../common/Input";
import SortableHeader from "../common/SortableHeader";

const ProductFilters = ({
  categories,
  categoriesLoading,
  categoriesError,
  onRetryCategories,
  category,
  onCategoryChange,
  search,
  onSearchChange,
  sortBy,
  sortOrder,
  onSort
}) => (
  <div className="flex flex-col gap-4 border-b theme-border-subtle p-5 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-lg font-semibold theme-text-primary">All Products</h2>
      <p className="mt-1 text-sm theme-text-muted">View and manage your products</p>
    </div>

    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
      <select
        value={category}
        onChange={(event) => onCategoryChange(event.target.value)}
        disabled={categoriesLoading || !!categoriesError}
        aria-label="Filter by category"
        className="theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70 sm:w-52"
      >
        <option value="">{categoriesLoading ? "Loading categories..." : "All categories"}</option>
        {categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
      </select>

      <Input
        name="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search products..."
        showSearchIcon
      />

    </div>

    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium theme-text-muted" aria-label="Sort products">
      <span>Sort:</span>
      {[
        ["name", "Name"],
        ["category", "Category"],
        ["price", "Price"],
        ["quantity", "Stock"],
        ["totalValue", "Value"]
      ].map(([field, label]) => (
        <SortableHeader key={field} field={field} sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
          {label}
        </SortableHeader>
      ))}
    </div>

    {categoriesError && (
      <div className="flex items-center gap-2 text-sm theme-danger">
        <span>{categoriesError}</span>
        <button type="button" onClick={onRetryCategories} className="font-semibold underline">
          Retry
        </button>
      </div>
    )}
  </div>
);

export default ProductFilters;
