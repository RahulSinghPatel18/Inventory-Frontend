import { Link } from "react-router-dom";
import { Clock3, PackageX, SlidersHorizontal, TrendingDown } from "lucide-react";
import Button from "../common/Button";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import Input from "../common/Input";
import Pagination from "../common/Pagination";
import Spinner from "../common/Spinner";
import SortableHeader from "../common/SortableHeader";
import ProductImage from "../products/ProductImage";

const money = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
}).format(Number(amount || 0));

const StockRecords = (props) => {
  const {
    activeTab,
    onTabChange,
    historyDraft,
    onDraftChange,
    historySortBy,
    historySortOrder,
    onHistorySort,
    onApplyFilters,
    history,
    historyLoading,
    historyError,
    historyPagination,
    onHistoryPageChange,
    alerts,
    alertsLoading,
    alertsError,
    onRetryAlerts,
    alertPagination,
    onAlertPageChange,
    alertSortBy,
    alertSortOrder,
    onAlertSort,
    products,
    canViewHistory,
    canViewLowStock,
    canViewOutOfStock,
    canViewProductDetails
  } = props;
  const selectedHistoryProduct = products.find((product) => product._id === historyDraft.productId);
  return (
  <section className="overflow-hidden rounded-2xl border theme-border theme-surface shadow-sm">
    <div className="border-b theme-border-subtle p-4">
      <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Stock views">
        {[
          ...(canViewHistory ? [{ id: "history", label: "History", count: null, icon: Clock3 }] : []),
          ...(canViewLowStock ? [{ id: "low", label: "Low stock", count: alerts.lowTotal, icon: TrendingDown }] : []),
          ...(canViewOutOfStock ? [{ id: "out", label: "Out of stock", count: alerts.outTotal, icon: PackageX }] : [])
        ].map(({ id, label, count, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => onTabChange(id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${activeTab === id ? "theme-primary-soft theme-primary-text" : "theme-text-muted theme-hover-surface"}`}
          >
            <Icon size={16} /> {label}
            {count !== null && <span className="text-xs">{count}</span>}
          </button>
        ))}
      </div>
    </div>

    {!canViewHistory && !canViewLowStock && !canViewOutOfStock ? (
      <p className="p-5 text-sm theme-text-muted">No stock history or alert permissions are enabled for your account.</p>
    ) : activeTab === "history" ? (
      <>
        <form onSubmit={onApplyFilters} className="grid gap-3 border-b theme-border-subtle p-4 sm:grid-cols-2 lg:grid-cols-7">
          <label className="text-sm font-semibold theme-text-primary">
            Product
            <select
              value={historyDraft.productId}
              onChange={(event) => onDraftChange("productId", event.target.value)}
              className="theme-input mt-1.5 h-[46px] w-full rounded-xl border px-4 py-3 text-sm font-normal outline-none"
            >
              <option value="">All products</option>
              {products.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
            </select>
            {selectedHistoryProduct && (
              <span className="mt-2 inline-flex items-center gap-2 rounded-lg theme-surface-secondary p-2">
                <ProductImage src={selectedHistoryProduct.image} alt={selectedHistoryProduct.name} className="h-8 w-8 rounded-lg" />
                <span className="text-xs theme-text-primary">{selectedHistoryProduct.name}</span>
              </span>
            )}
          </label>
          <label className="text-sm font-semibold theme-text-primary">
            Movement
            <select
              value={historyDraft.type}
              onChange={(event) => onDraftChange("type", event.target.value)}
              className="theme-input mt-1.5 h-[46px] w-full rounded-xl border px-4 py-3 text-sm font-normal outline-none"
            >
              <option value="">All movements</option>
              <option value="in">Stock in</option>
              <option value="out">Stock out</option>
            </select>
          </label>
          <Input label="Start date" name="startDate" type="date" value={historyDraft.startDate} onChange={(event) => onDraftChange("startDate", event.target.value)} />
          <Input label="End date" name="endDate" type="date" value={historyDraft.endDate} onChange={(event) => onDraftChange("endDate", event.target.value)} />
          <Input label="Search product" name="historySearch" value={historyDraft.search} onChange={(event) => onDraftChange("search", event.target.value)} placeholder="Product name" showSearchIcon />
          <Button type="submit" className="h-[46px] w-full self-end py-0">
            <SlidersHorizontal size={16} /> Apply filters
          </Button>
        </form>
        {historyLoading ? (
          <LoadingRows />
        ) : historyError ? (
          <ErrorState message={historyError} />
        ) : history.length === 0 ? (
          <EmptyState title="No stock movements yet" message="Stock in and stock out activity will appear here." icon={Clock3} className="min-h-[260px]" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b theme-border-subtle theme-surface-secondary text-left">
                  {[
                    ["Product", "product"],
                    ["Movement", "type"],
                    ["Quantity", "quantity"],
                    ["Source", null],
                    ["Recorded by", "createdBy"],
                    ["Date", "createdAt"]
                  ].map(([label, field]) => <th key={label} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide theme-text-muted">
                    {field ? <SortableHeader field={field} sortBy={historySortBy} sortOrder={historySortOrder} onSort={onHistorySort}>{label}</SortableHeader> : label}
                  </th>)}
                </tr></thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry._id} className="border-b theme-border-subtle theme-hover-surface">
                      <td className="px-5 py-4 font-medium theme-text-primary">
                        <span className="inline-flex items-center gap-3">
                          <ProductImage src={entry.productId?.image} alt={entry.productId?.name} className="h-9 w-9 rounded-lg" />
                          {canViewProductDetails && entry.productId?._id
                            ? <Link to={`/products/${entry.productId._id}`} className="hover:underline">{entry.productId.name || "Product"}</Link>
                            : entry.productId?.name || "Product unavailable"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${entry.type === "in" ? "theme-success-soft theme-success" : "theme-warning-soft theme-warning"}`}>
                          {entry.type === "in" ? "Stock in" : "Stock out"}
                        </span>
                      </td>
                      <td className="px-5 py-4 theme-text-primary">{entry.type === "out" ? "-" : "+"}{entry.quantity}</td>
                      <td className="px-5 py-4 text-sm capitalize theme-text-secondary">
                        {entry.sourceType ? `${entry.sourceType}${entry.sourceId ? ` #${String(entry.sourceId).slice(-8)}` : ""}` : "—"}
                      </td>
                      <td className="px-5 py-4 theme-text-secondary">{entry.createdBy?.name || "—"}</td>
                      <td className="px-5 py-4 text-sm theme-text-muted">{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...historyPagination} onPageChange={onHistoryPageChange} />
          </>
        )}
      </>
    ) : alertsLoading ? (
      <LoadingRows />
    ) : alertsError ? (
      <ErrorState message={alertsError} onRetry={onRetryAlerts} />
    ) : alerts.products.length === 0 ? (
      <EmptyState
        title={activeTab === "low" ? "No low stock products" : "No products out of stock"}
        message={activeTab === "low" ? "Products with five or fewer units will appear here." : "Products with zero units will appear here."}
        icon={activeTab === "low" ? TrendingDown : PackageX}
        className="min-h-[260px]"
      />
    ) : (
      <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b theme-border-subtle theme-surface-secondary text-left">
              {[
                ["Product", "name"],
                ["Unit price", "price"],
                ["Available stock", "quantity"],
                ["Total value", "totalValue"]
              ].map(([label, field]) => <th key={field} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide theme-text-muted">
                <SortableHeader field={field} sortBy={alertSortBy} sortOrder={alertSortOrder} onSort={onAlertSort}>{label}</SortableHeader>
              </th>)}
            </tr></thead>
            <tbody>
              {alerts.products.map((product) => (
                <tr key={product._id} className="border-b theme-border-subtle theme-hover-surface">
                  <td className="px-5 py-4 font-medium theme-text-primary">
                    <span className="inline-flex items-center gap-3">
                      <ProductImage src={product.image} alt={product.name} className="h-9 w-9 rounded-lg" />
                      {canViewProductDetails ? <Link to={`/products/${product._id}`} className="hover:underline">{product.name}</Link> : product.name}
                    </span>
                  </td>
                  <td className="px-5 py-4 theme-text-secondary">{money(product.price)}</td>
                  <td className="px-5 py-4 font-semibold theme-text-primary">{product.quantity}</td>
                  <td className="px-5 py-4 theme-text-secondary">{money(product.totalValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination {...alertPagination} onPageChange={onAlertPageChange} />
      </>
    )}
  </section>
  );
};

const LoadingRows = () => (
  <div className="flex min-h-[240px] items-center justify-center"><Spinner size="lg" /></div>
);

export default StockRecords;
