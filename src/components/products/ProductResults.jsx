import { Pencil, Trash2 } from "lucide-react";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import Pagination from "../common/Pagination";
import Spinner from "../common/Spinner";

const ProductResults = ({
  products,
  loading,
  error,
  hasFilters,
  onRetry,
  onEdit,
  onDelete,
  pagination,
  onPageChange
}) => {
  if (loading) {
    return <div className="flex min-h-[300px] items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (products.length === 0) {
    return (
      <EmptyState
        title={hasFilters ? "No matching products" : "No products found"}
        message={hasFilters ? "Try adjusting your search or filters." : "Add a product to your inventory to get started."}
        className="min-h-[420px]"
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b theme-border-subtle theme-surface-secondary text-left">
              {["Product", "Category", "Unit price", "Stock", "Total value"].map((label) => (
                <th key={label} className="px-6 py-4 text-xs font-semibold uppercase tracking-wide theme-text-muted">{label}</th>
              ))}
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide theme-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b theme-border-subtle transition theme-hover-surface">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <ProductInitial name={product.name} />
                    <span className="font-medium theme-text-primary">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full theme-neutral-soft px-3 py-1 text-xs font-medium theme-text-secondary">
                    {product.category?.name ?? "—"}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium theme-text-primary">₹{product.price}</td>
                <td className="px-6 py-4"><StockBadge quantity={product.quantity} /></td>
                <td className="px-6 py-4 font-medium theme-text-primary">₹{product.price * product.quantity}</td>
                <td className="px-6 py-4"><ProductActions product={product} onEdit={onEdit} onDelete={onDelete} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {products.map((product) => (
          <article key={product._id} className="rounded-xl border theme-border theme-surface p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <ProductInitial name={product.name} />
                <div className="min-w-0">
                  <p className="truncate font-medium theme-text-primary">{product.name}</p>
                  <p className="mt-0.5 text-xs theme-text-muted">{product.category?.name ?? "—"}</p>
                </div>
              </div>
              <ProductActions product={product} onEdit={onEdit} onDelete={onDelete} compact />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MobileValue label="Unit price" value={`₹${product.price}`} />
              <MobileValue label="Stock" value={product.quantity} />
              <div className="col-span-2"><MobileValue label="Total value" value={`₹${product.price * product.quantity}`} /></div>
            </div>
          </article>
        ))}
      </div>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        hasNextPage={pagination.hasNextPage}
        hasPreviousPage={pagination.hasPreviousPage}
        onPageChange={onPageChange}
      />
    </>
  );
};

const ProductInitial = ({ name }) => (
  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl theme-primary-soft font-semibold theme-primary-text">
    {name.charAt(0).toUpperCase()}
  </span>
);

const ProductActions = ({ product, onEdit, onDelete, compact = false }) => (
  <div className="flex shrink-0 gap-2">
    <button
      type="button"
      onClick={() => onEdit(product)}
      title="Edit product"
      aria-label={`Edit ${product.name}`}
      className={`flex items-center justify-center rounded-lg border theme-border theme-surface theme-text-muted transition theme-hover-primary theme-hover-border-primary ${compact ? "h-8 w-8" : "h-9 w-9"}`}
    >
      <Pencil size={compact ? 15 : 16} />
    </button>
    <button
      type="button"
      onClick={() => onDelete(product)}
      title="Delete product"
      aria-label={`Delete ${product.name}`}
      className={`flex items-center justify-center rounded-lg border theme-border theme-surface theme-text-muted transition theme-hover-danger theme-hover-danger-text ${compact ? "h-8 w-8" : "h-9 w-9"}`}
    >
      <Trash2 size={compact ? 15 : 16} />
    </button>
  </div>
);

const StockBadge = ({ quantity }) => {
  if (quantity === 0) {
    return <span className="inline-flex rounded-full theme-danger-soft px-3 py-1 text-xs font-medium theme-danger">Out of stock</span>;
  }
  if (quantity <= 5) {
    return <span className="inline-flex rounded-full theme-warning-soft px-3 py-1 text-xs font-medium theme-warning">Low stock · {quantity}</span>;
  }
  return <span className="inline-flex rounded-full theme-success-soft px-3 py-1 text-xs font-medium theme-success">{quantity} available</span>;
};

const MobileValue = ({ label, value }) => (
  <div className="rounded-lg theme-surface-secondary p-3">
    <p className="text-xs theme-text-muted">{label}</p>
    <p className="mt-1 font-semibold theme-text-primary">{value}</p>
  </div>
);

export default ProductResults;
