import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import ProductImage from "./ProductImage";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import Pagination from "../common/Pagination";
import Spinner from "../common/Spinner";
import SortableHeader from "../common/SortableHeader";
import formatCurrency from "../../utils/formatCurrency";

const ProductResults = ({
  products,
  loading,
  error,
  hasFilters,
  onRetry,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  canViewDetails,
  pagination,
  onPageChange,
  sortBy,
  sortOrder,
  onSort
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
              {[
                ["Product", "name"],
                ["Category", "category"],
                ["Unit price", "price"],
                ["Stock", "quantity"],
                ["Total value", "totalValue"]
              ].map(([label, field]) => (
                <th key={label} className="px-6 py-4 text-xs font-semibold uppercase tracking-wide theme-text-muted">
                  <SortableHeader field={field} sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>{label}</SortableHeader>
                </th>
              ))}
              {(canEdit || canDelete) && <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide theme-text-muted">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b theme-border-subtle transition theme-hover-surface">
                <td className="px-6 py-4">
                  {canViewDetails ? <Link to={`/products/${product._id}`} className="inline-flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                    <ProductImage src={product.image} alt={product.name} className="h-10 w-10" />
                    <span className="font-medium theme-text-primary hover:underline">{product.name}</span>
                  </Link> : <span className="inline-flex items-center gap-3">
                    <ProductImage src={product.image} alt={product.name} className="h-10 w-10" />
                    <span className="font-medium theme-text-primary">{product.name}</span>
                  </span>}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full theme-neutral-soft px-3 py-1 text-xs font-medium theme-text-secondary">
                    {product.category?.name ?? "—"}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium theme-text-primary">{formatCurrency(product.price)}</td>
                <td className="px-6 py-4"><StockBadge quantity={product.quantity} /></td>
                <td className="px-6 py-4 font-medium theme-text-primary">{formatCurrency(product.price * product.quantity)}</td>
                {(canEdit || canDelete) && <td className="px-6 py-4"><ProductActions product={product} onEdit={onEdit} onDelete={onDelete} canEdit={canEdit} canDelete={canDelete} /></td>}
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
                <div className="min-w-0">
                  {canViewDetails ? <Link to={`/products/${product._id}`} className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                    <ProductImage src={product.image} alt={product.name} className="h-10 w-10" />
                    <span className="truncate font-medium theme-text-primary hover:underline">{product.name}</span>
                  </Link> : <span className="flex min-w-0 items-center gap-3">
                    <ProductImage src={product.image} alt={product.name} className="h-10 w-10" />
                    <span className="truncate font-medium theme-text-primary">{product.name}</span>
                  </span>}
                  <p className="mt-0.5 text-xs theme-text-muted">{product.category?.name ?? "—"}</p>
                </div>
              </div>
              {(canEdit || canDelete) && <ProductActions product={product} onEdit={onEdit} onDelete={onDelete} canEdit={canEdit} canDelete={canDelete} compact />}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MobileValue label="Unit price" value={formatCurrency(product.price)} />
              <MobileValue label="Stock" value={product.quantity} />
              <div className="col-span-2"><MobileValue label="Total value" value={formatCurrency(product.price * product.quantity)} /></div>
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

const ProductActions = ({ product, onEdit, onDelete, canEdit, canDelete, compact = false }) => (
  <div className="flex shrink-0 gap-2">
    {canEdit && <button
      type="button"
      onClick={() => onEdit(product)}
      title="Edit "
      aria-label={`Edit ${product.name}`}
      className={`flex items-center justify-center rounded-lg border theme-border theme-surface theme-text-muted transition theme-hover-primary theme-hover-border-primary ${compact ? "h-8 w-8" : "h-9 w-9"}`}
    >
      <Pencil size={compact ? 15 : 16} />
    </button>}
    {canDelete && <button
      type="button"
      onClick={() => onDelete(product)}
      title="Delete "
      aria-label={`Delete ${product.name}`}
      className={`flex items-center justify-center rounded-lg border theme-border theme-surface theme-text-muted transition theme-hover-danger theme-hover-danger-text ${compact ? "h-8 w-8" : "h-9 w-9"}`}
    >
      <Trash2 size={compact ? 15 : 16} />
    </button>}
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
