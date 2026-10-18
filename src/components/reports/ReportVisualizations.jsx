import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Boxes,
  CircleX,
  IndianRupee,
  Package
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import ProductImage from "../products/ProductImage";
import { currencyFormatter, numberFormatter } from "../../hooks/useInventoryReport";

const SummaryCard = ({ label, value, icon: Icon, tone }) => (
  <article className="rounded-xl border theme-border theme-surface p-4 shadow-sm sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm font-medium theme-text-muted">{label}</p>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon size={18} /></span>
    </div>
    <p className="mt-3 break-words text-2xl font-bold theme-text-primary">{value}</p>
  </article>
);

const ReportPanel = ({ title, description, children }) => (
  <section className="overflow-hidden rounded-xl border theme-border theme-surface shadow-sm">
    <header className="border-b theme-border-subtle px-5 py-4 sm:px-6">
      <h2 className="text-base font-semibold theme-text-primary">{title}</h2>
      {description && <p className="mt-1 text-xs theme-text-muted">{description}</p>}
    </header>
    {children}
  </section>
);

const TableFrame = ({ headers, children, mobileCards }) => (
  <>
    {mobileCards && <div className="divide-y theme-border-subtle md:hidden">{mobileCards}</div>}
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="theme-surface-secondary text-xs uppercase theme-text-muted">
          <tr>{headers.map((header) => <th key={header} className="px-5 py-3 font-semibold">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y theme-border-subtle">{children}</tbody>
      </table>
    </div>
  </>
);

const ReportVisualizations = ({
  loading,
  productsError,
  historyError,
  summary,
  stockOverview,
  lowStockProducts,
  canViewProducts,
  canViewStock,
  canViewProductDetails
}) => {
  const summaries = [
    { label: "Total Products", value: numberFormatter.format(summary.totalProducts), icon: Package, tone: "theme-primary-soft theme-primary-text" },
    { label: "Total Stock", value: numberFormatter.format(summary.totalStock), icon: Boxes, tone: "theme-info-soft theme-info" },
    { label: "Inventory Value", value: currencyFormatter.format(summary.inventoryValue), icon: IndianRupee, tone: "theme-success-soft theme-success" },
    { label: "Low Stock", value: numberFormatter.format(summary.lowStock), icon: AlertTriangle, tone: "theme-warning-soft theme-warning" },
    { label: "Out of Stock", value: numberFormatter.format(summary.outOfStock), icon: CircleX, tone: "theme-danger-soft theme-danger" },
    { label: "Units moved", value: numberFormatter.format(summary.monthlyMovements), icon: Boxes, tone: "theme-info-soft theme-info" }
  ];
  const lowStockCards = lowStockProducts.map((product) => (
    <article key={product._id} className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <ProductImage src={product.image} alt={product.name} className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="min-w-0">
          {canViewProductDetails
            ? <Link to={`/products/${product._id}`} className="block truncate text-sm font-semibold theme-text-primary hover:underline">{product.name}</Link>
            : <p className="truncate text-sm font-semibold theme-text-primary">{product.name}</p>}
          <p className="mt-0.5 truncate text-xs theme-text-muted">{product.category?.name || "Uncategorized"} · {currencyFormatter.format(product.price)} each</p>
        </div>
      </div>
      <span className="shrink-0 rounded-full theme-warning-soft px-2.5 py-1 text-xs font-semibold theme-warning">
        {numberFormatter.format(product.quantity)} left
      </span>
    </article>
  ));
  return (
    <div className="space-y-5 motion-safe:animate-[report-enter_360ms_ease-out_both]">
      {(canViewProducts || canViewStock) && <section aria-label="Inventory summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {summaries
          .filter((item) => canViewProducts || item.label === "Units moved")
          .filter((item) => canViewStock || item.label !== "Units moved")
          .map((item) => (
            <SummaryCard
              key={item.label}
              {...item}
              value={loading || (item.label === "Units moved" ? historyError : productsError) ? "—" : item.value}
            />
          ))}
      </section>}

      {loading ? (
        <div className="flex min-h-72 items-center justify-center rounded-xl border theme-border theme-surface">
          <span role="status" aria-label="Loading report" className="theme-spinner h-11 w-11 animate-spin rounded-full border-[3px] border-solid border-r-transparent" />
        </div>
      ) : (
        <>
          {!canViewProducts && !canViewStock ? (
            <p className="rounded-xl border theme-border theme-surface p-5 text-sm theme-text-muted">
              No specific report permissions are enabled for your account. Ask your administrator to grant access to a report.
            </p>
          ) : <>
          <div className="grid gap-5">
            {canViewStock && <ReportPanel title="Stock overview" description="Units moved by day in the selected period">
              {historyError ? <ErrorState message={historyError} /> : stockOverview.length === 0 ? (
                <EmptyState title="No stock activity" message="No stock movements match the selected filters." />
              ) : (
                <div className="h-[300px] w-full px-2 py-4 sm:px-5">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockOverview} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--theme-chart-grid)" />
                      <XAxis dataKey="dateLabel" axisLine={false} tickLine={false} tick={{ fill: "var(--theme-chart-label)", fontSize: 11 }} minTickGap={24} />
                      <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: "var(--theme-chart-muted)", fontSize: 11 }} />
                      <Tooltip cursor={{ fill: "var(--theme-surface-secondary)" }} contentStyle={tooltipStyle} />
                      <Legend />
                      <Bar dataKey="stockIn" name="Stock in" fill="var(--theme-success)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                      <Bar dataKey="stockOut" name="Stock out" fill="var(--theme-warning)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ReportPanel>}

          </div>

          {canViewProducts && <ReportPanel title="Low stock products" description="Up to 8 products with 1 to 5 units remaining">
            {productsError ? <ErrorState message={productsError} /> : lowStockProducts.length === 0 ? (
              <EmptyState title="No low stock products" message="No products are currently at or below the low-stock threshold." />
            ) : (
              <TableFrame headers={["Product", "Category", "Unit price", "Stock remaining", "Total value"]} mobileCards={lowStockCards}>
                {lowStockProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-5 py-3.5 font-medium theme-text-primary"><span className="inline-flex items-center gap-3"><ProductImage src={product.image} alt={product.name} className="h-9 w-9 rounded-lg" />{canViewProductDetails ? <Link to={`/products/${product._id}`} className="hover:underline">{product.name}</Link> : product.name}</span></td>
                    <td className="px-5 py-3.5 theme-text-secondary">{product.category?.name || "Uncategorized"}</td>
                    <td className="px-5 py-3.5 theme-text-secondary">{currencyFormatter.format(product.price)}</td>
                    <td className="px-5 py-3.5"><span className="inline-flex rounded-full theme-warning-soft px-2.5 py-1 text-xs font-semibold theme-warning">{numberFormatter.format(product.quantity)}</span></td>
                    <td className="px-5 py-3.5 theme-text-secondary">{currencyFormatter.format(product.price * product.quantity)}</td>
                  </tr>
                ))}
              </TableFrame>
            )}
          </ReportPanel>}

          </>}
        </>
      )}
    </div>
  );
};

const tooltipStyle = {
  border: "1px solid var(--theme-border)",
  borderRadius: "10px",
  backgroundColor: "var(--theme-chart-tooltip)",
  color: "var(--theme-text-primary)"
};

export default ReportVisualizations;
