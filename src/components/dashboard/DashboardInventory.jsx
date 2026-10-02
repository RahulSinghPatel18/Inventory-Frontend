import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CircleX, TrendingUp } from "lucide-react";
import Spinner from "../common/Spinner";

const DashboardInventory = ({
  products,
  alertsLoading,
  alertsError,
  lowStockProducts,
  outOfStockProducts,
  hasAlerts
}) => (
  <div className="mt-5 grid gap-5 lg:grid-cols-3">
    <section className="overflow-hidden rounded-2xl border theme-border theme-surface shadow-sm lg:col-span-2">
      <header className="flex items-center justify-between border-b theme-border-subtle px-5 py-4">
        <div>
          <h2 className="text-base font-semibold theme-text-primary">Recent Products</h2>
          <p className="mt-1 text-xs theme-text-muted">Latest products in your inventory</p>
        </div>
        <Link to="/products" className="flex items-center gap-1 text-xs font-semibold theme-primary-text hover:underline">
          View all <ArrowRight size={14} />
        </Link>
      </header>
      {products.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center text-sm theme-text-muted">No products available</div>
      ) : (
        <ul className="divide-y theme-divide-y">
          {products.map((product) => (
            <li key={product._id} className="flex items-center justify-between gap-4 px-5 py-4 theme-hover-surface">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl theme-primary-soft font-semibold theme-primary-text">
                  {product.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium theme-text-primary">{product.name}</p>
                  <p className="mt-0.5 truncate text-xs theme-text-muted">{product.category?.name ?? "—"}</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold theme-text-primary">₹{product.price}</p>
                <p className="mt-0.5 text-xs theme-text-muted">{product.quantity} units</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>

    <section className="rounded-2xl border theme-border theme-surface shadow-sm">
      <header className="border-b theme-border-subtle px-5 py-4">
        <h2 className="text-base font-semibold theme-text-primary">Inventory Alerts</h2>
        <p className="mt-1 text-xs theme-text-muted">Products that need attention</p>
      </header>
      <div className="space-y-3 p-5">
        {alertsLoading ? (
          <div className="flex min-h-[180px] items-center justify-center" role="status">
            <Spinner size="sm" /><span className="sr-only">Loading inventory alerts</span>
          </div>
        ) : alertsError ? (
          <p role="alert" className="py-8 text-center text-sm theme-danger">{alertsError}</p>
        ) : !hasAlerts ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl theme-success-soft theme-success"><TrendingUp size={20} /></span>
            <p className="mt-3 text-sm font-semibold theme-text-primary">Inventory looks good</p>
            <p className="mt-1 text-xs theme-text-muted">No products need attention right now.</p>
          </div>
        ) : (
          <>
            {outOfStockProducts.map((product) => (
              <div key={product._id} className="flex items-center gap-3 rounded-xl theme-danger-soft p-3">
                <CircleX size={18} className="shrink-0 theme-danger" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium theme-text-primary">{product.name}</p>
                  <p className="text-xs theme-danger">Out of stock</p>
                </div>
              </div>
            ))}
            {lowStockProducts.map((product) => (
              <div key={product._id} className="flex items-center gap-3 rounded-xl theme-warning-soft p-3">
                <AlertTriangle size={18} className="shrink-0 theme-warning" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium theme-text-primary">{product.name}</p>
                  <p className="text-xs theme-warning">Only {product.quantity} units left</p>
                </div>
              </div>
            ))}
            <Link to="/stock" className="inline-flex items-center gap-1 pt-1 text-xs font-semibold theme-primary-text hover:underline">
              Review stock <ArrowRight size={13} />
            </Link>
          </>
        )}
      </div>
    </section>
  </div>
);

export default DashboardInventory;
