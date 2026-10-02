import Input from "../common/Input";

const ProductFilters = ({
  categories,
  categoriesLoading,
  categoriesError,
  onRetryCategories,
  category,
  onCategoryChange,
  search,
  onSearchChange,
  sort,
  onSortChange
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

      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value)}
        aria-label="Sort products"
        className="theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none sm:w-48"
      >
        <option value="">Default order</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
      </select>
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
