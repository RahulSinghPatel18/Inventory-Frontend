import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CircleX } from "lucide-react";
import EmptyState from "../common/EmptyState";
import Spinner from "../common/Spinner";
import ProductImage from "../products/ProductImage";

const StockProductList = ({ title, products, count, tone, Icon, emptyMessage, error, canViewProductDetails }) => (
  <section className="overflow-hidden rounded-2xl border theme-border theme-surface shadow-sm">
    <header className="flex items-center justify-between border-b theme-border-subtle px-5 py-4">
      <div className="flex items-center gap-2">
        <Icon size={17} className={tone} />
        <h2 className="text-base font-semibold theme-text-primary">{title}</h2>
      </div>
      {typeof count === "number" && <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone === "theme-danger" ? "theme-danger-soft theme-danger" : "theme-warning-soft theme-warning"}`}>{count}</span>}
    </header>
    {error ? (
      <p role="alert" className="p-5 text-sm theme-danger">{error}</p>
    ) : products.length === 0 ? (
      <EmptyState title={count === 0 ? `No ${title.toLowerCase()}` : "No products to show"} message={emptyMessage} className="min-h-[180px]" />
    ) : (
      <ul className="divide-y theme-divide-y">
        {products.map((product) => (
          <li key={product._id} className="flex items-center justify-between gap-4 px-5 py-3 theme-hover-surface">
            <ProductImage src={product.image} alt={product.name} className="h-10 w-10 rounded-lg" />
            {canViewProductDetails
              ? <Link to={`/products/${product._id}`} className="min-w-0 truncate text-sm font-medium theme-text-primary hover:underline">{product.name}</Link>
              : <span className="min-w-0 truncate text-sm font-medium theme-text-primary">{product.name}</span>}
            <span className={`shrink-0 text-xs font-medium ${tone}`}>{product.quantity} {product.quantity === 1 ? "unit" : "units"}</span>
          </li>
        ))}
      </ul>
    )}
  </section>
);

const DashboardInventory = ({
  loading,
  lowStockProducts,
  outOfStockProducts,
  lowStockCount,
  outOfStockCount,
  lowStockError,
  outOfStockError,
  canViewStock,
  canViewProductDetails
}) => (
  <section className="mt-5">
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold theme-text-primary">Stock attention</h2>
        <p className="mt-1 text-sm theme-text-muted">Live counts and products from stock status APIs.</p>
      </div>
      {canViewStock && <Link to="/stock" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold theme-primary-text hover:underline">Stock page <ArrowRight size={14} /></Link>}
    </div>
    {loading ? (
      <div className="flex min-h-[180px] items-center justify-center rounded-2xl border theme-border theme-surface"><Spinner /></div>
    ) : (
      <div className="grid gap-4 lg:grid-cols-2">
        <StockProductList
          title="Low stock"
          products={lowStockProducts}
          count={lowStockCount}
          tone="theme-warning"
          Icon={AlertTriangle}
          emptyMessage="No products currently meet the low-stock threshold."
          error={lowStockError}
          canViewProductDetails={canViewProductDetails}
        />
        <StockProductList
          title="Out of stock"
          products={outOfStockProducts}
          count={outOfStockCount}
          tone="theme-danger"
          Icon={CircleX}
          emptyMessage="No products are currently out of stock."
          error={outOfStockError}
          canViewProductDetails={canViewProductDetails}
        />
      </div>
    )}
  </section>
);

export default DashboardInventory;
