import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  CircleX,
  IndianRupee,
  Package
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import {
  CHART_COLORS,
  currencyFormatter,
  numberFormatter
} from "../../hooks/useInventoryReport";

const SummaryCard = ({ label, value, icon: Icon, tone }) => (
  <article className="rounded-xl border theme-border theme-surface p-4 shadow-sm sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm font-medium theme-text-muted">{label}</p>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon size={18} /></span>
    </div>
    <p className="mt-3 break-words text-2xl font-bold theme-text-primary">{value}</p>
  </article>
);

const ReportPanel = ({ title, description, children, className = "" }) => (
  <section className={`overflow-hidden rounded-xl border theme-border theme-surface shadow-sm ${className}`}>
    <header className="border-b theme-border-subtle px-5 py-4 sm:px-6">
      <h2 className="text-base font-semibold theme-text-primary">{title}</h2>
      {description && <p className="mt-1 text-xs theme-text-muted">{description}</p>}
    </header>
    {children}
  </section>
);

const TableFrame = ({ headers, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[620px] text-left text-sm">
      <thead className="theme-surface-secondary text-xs uppercase theme-text-muted">
        <tr>{headers.map((header) => <th key={header} className="px-5 py-3 font-semibold">{header}</th>)}</tr>
      </thead>
      <tbody className="divide-y theme-border-subtle">{children}</tbody>
    </table>
  </div>
);

const ReportVisualizations = ({
  loading,
  productsError,
  historyError,
  summary,
  categoryData,
  stockOverview,
  topProducts,
  lowStockProducts,
  recentActivity,
  formatDate
}) => {
  const summaries = [
    { label: "Total Products", value: numberFormatter.format(summary.totalProducts), icon: Package, tone: "theme-primary-soft theme-primary-text" },
    { label: "Total Stock", value: numberFormatter.format(summary.totalStock), icon: Boxes, tone: "theme-info-soft theme-info" },
    { label: "Inventory Value", value: currencyFormatter.format(summary.inventoryValue), icon: IndianRupee, tone: "theme-success-soft theme-success" },
    { label: "Low Stock", value: numberFormatter.format(summary.lowStock), icon: AlertTriangle, tone: "theme-warning-soft theme-warning" },
    { label: "Out of Stock", value: numberFormatter.format(summary.outOfStock), icon: CircleX, tone: "theme-danger-soft theme-danger" }
  ];

  return (
    <>
      <section aria-label="Inventory summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {summaries.map((item) => <SummaryCard key={item.label} {...item} value={loading || productsError ? "—" : item.value} />)}
      </section>

      {loading ? (
        <div className="flex min-h-72 items-center justify-center rounded-xl border theme-border theme-surface">
          <span role="status" aria-label="Loading report" className="theme-spinner h-11 w-11 animate-spin rounded-full border-[3px] border-solid border-r-transparent" />
        </div>
      ) : (
        <>
          <div className="grid gap-5 xl:grid-cols-5">
            <ReportPanel title="Stock overview" description="Units moved by day in the selected period" className="xl:col-span-3">
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
            </ReportPanel>

            <ReportPanel title="Inventory by category" description="Current units available" className="xl:col-span-2">
              {productsError ? <ErrorState message={productsError} /> : categoryData.length === 0 ? (
                <EmptyState title="No category inventory" message="Products will appear here when inventory is available." />
              ) : (
                <div className="flex flex-col items-center gap-2 p-4 sm:flex-row sm:justify-center">
                  <div className="h-[250px] w-full max-w-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} dataKey="stock" nameKey="name" innerRadius={58} outerRadius={94} paddingAngle={3}>
                          {categoryData.map((item, index) => <Cell key={item.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value) => [numberFormatter.format(value), "Units"]} contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="grid w-full gap-2 sm:max-w-[170px]">
                    {categoryData.map((item, index) => (
                      <li key={item.name} className="flex min-w-0 items-center justify-between gap-3 text-xs">
                        <span className="flex min-w-0 items-center gap-2 theme-text-secondary">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                          <span className="truncate">{item.name}</span>
                        </span>
                        <span className="shrink-0 font-semibold theme-text-primary">{numberFormatter.format(item.stock)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </ReportPanel>
          </div>

          <ReportPanel title="Most valuable products" description="Products ranked by unit price × current stock">
            {productsError ? <ErrorState message={productsError} /> : topProducts.length === 0 ? (
              <EmptyState title="No products to report" message="Add inventory to see product value rankings." />
            ) : (
              <TableFrame headers={["Product", "Category", "Unit price", "Stock", "Total value"]}>
                {topProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-5 py-3.5 font-medium theme-text-primary">{product.name}</td>
                    <td className="px-5 py-3.5 theme-text-secondary">{product.category?.name || "Uncategorized"}</td>
                    <td className="px-5 py-3.5 theme-text-secondary">{currencyFormatter.format(product.price)}</td>
                    <td className="px-5 py-3.5 theme-text-secondary">{numberFormatter.format(product.quantity)}</td>
                    <td className="px-5 py-3.5 font-semibold theme-text-primary">{currencyFormatter.format(product.price * product.quantity)}</td>
                  </tr>
                ))}
              </TableFrame>
            )}
          </ReportPanel>

          <ReportPanel title="Low stock products" description="Products with 1 to 5 units remaining">
            {productsError ? <ErrorState message={productsError} /> : lowStockProducts.length === 0 ? (
              <EmptyState title="No low stock products" message="No products are currently at or below the low-stock threshold." />
            ) : (
              <TableFrame headers={["Product", "Category", "Unit price", "Stock remaining", "Total value"]}>
                {lowStockProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-5 py-3.5 font-medium theme-text-primary">{product.name}</td>
                    <td className="px-5 py-3.5 theme-text-secondary">{product.category?.name || "Uncategorized"}</td>
                    <td className="px-5 py-3.5 theme-text-secondary">{currencyFormatter.format(product.price)}</td>
                    <td className="px-5 py-3.5"><span className="inline-flex rounded-full theme-warning-soft px-2.5 py-1 text-xs font-semibold theme-warning">{numberFormatter.format(product.quantity)}</span></td>
                    <td className="px-5 py-3.5 theme-text-secondary">{currencyFormatter.format(product.price * product.quantity)}</td>
                  </tr>
                ))}
              </TableFrame>
            )}
          </ReportPanel>

          <ReportPanel title="Recent stock activity" description="Latest movements matching the selected filters">
            {historyError ? <ErrorState message={historyError} /> : recentActivity.length === 0 ? (
              <EmptyState title="No recent activity" message="Stock movements will appear here when recorded." />
            ) : (
              <TableFrame headers={["Product", "Type", "Quantity", "User", "Date"]}>
                {recentActivity.map((entry) => {
                  const isStockIn = entry.type === "in";
                  return (
                    <tr key={entry._id}>
                      <td className="px-5 py-3.5 font-medium theme-text-primary">{entry.productId?.name || "Product unavailable"}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${isStockIn ? "theme-success-soft theme-success" : "theme-warning-soft theme-warning"}`}>
                          {isStockIn ? <ArrowDownToLine size={13} /> : <ArrowUpFromLine size={13} />}
                          {isStockIn ? "In" : "Out"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 theme-text-secondary">{numberFormatter.format(entry.quantity)}</td>
                      <td className="px-5 py-3.5 theme-text-secondary">{entry.createdBy?.name || "User unavailable"}</td>
                      <td className="px-5 py-3.5 theme-text-secondary">{formatDate(entry.createdAt)}</td>
                    </tr>
                  );
                })}
              </TableFrame>
            )}
          </ReportPanel>
        </>
      )}
    </>
  );
};

const tooltipStyle = {
  border: "1px solid var(--theme-border)",
  borderRadius: "10px",
  backgroundColor: "var(--theme-chart-tooltip)",
  color: "var(--theme-text-primary)"
};

export default ReportVisualizations;
