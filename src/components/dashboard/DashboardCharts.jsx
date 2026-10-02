import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import Button from "../common/Button";
import EmptyState from "../common/EmptyState";
import Spinner from "../common/Spinner";

const STOCK_COLORS = [
  "var(--theme-success)",
  "var(--theme-warning)",
  "var(--theme-danger)"
];

const chartTooltipStyle = {
  border: "1px solid var(--theme-border)",
  borderRadius: "12px",
  backgroundColor: "var(--theme-chart-tooltip)",
  color: "var(--theme-text-primary)",
  boxShadow: "var(--theme-shadow)"
};

const DashboardCharts = ({
  stats,
  categoryData,
  categoryLoading,
  categoryError,
  onRetryCategories
}) => {
  const stockData = [
    { name: "In Stock", value: stats.totalProducts - stats.lowStockProducts - stats.outOfStockProducts },
    { name: "Low Stock", value: stats.lowStockProducts },
    { name: "Out of Stock", value: stats.outOfStockProducts }
  ];

  return (
    <div className="mt-5 grid gap-5 xl:grid-cols-3">
      <section className="rounded-2xl border theme-border theme-surface p-5 shadow-sm xl:col-span-2">
        <header className="mb-5">
          <h2 className="text-base font-semibold theme-text-primary">Stock by Category</h2>
          <p className="mt-1 text-xs theme-text-muted">Current stock distribution across categories</p>
        </header>
        {categoryLoading ? (
          <div className="flex h-[280px] items-center justify-center" role="status">
            <Spinner /><span className="sr-only">Loading category statistics</span>
          </div>
        ) : categoryError ? (
          <div className="flex h-[280px] flex-col items-center justify-center gap-3 text-center" role="alert">
            <p className="text-sm theme-danger">{categoryError}</p>
            <Button variant="outline" onClick={onRetryCategories}>Try Again</Button>
          </div>
        ) : categoryData.length === 0 ? (
          <EmptyState title="No category data" message="Category stock data will appear here." className="min-h-[280px]" />
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-chart-grid)" />
                <XAxis dataKey="categoryName" axisLine={false} tickLine={false} tick={{ fill: "var(--theme-chart-label)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--theme-chart-muted)", fontSize: 12 }} />
                <Tooltip cursor={{ fill: "var(--theme-surface-secondary)" }} contentStyle={chartTooltipStyle} />
                <Bar dataKey="totalStock" fill="var(--theme-primary)" radius={[6, 6, 0, 0]} barSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-2xl border theme-border theme-surface p-5 shadow-sm">
        <header>
          <h2 className="text-base font-semibold theme-text-primary">Stock Status</h2>
          <p className="mt-1 text-xs theme-text-muted">Product availability overview</p>
        </header>
        {stats.totalProducts === 0 ? (
          <div className="flex h-[280px] items-center justify-center">
            <EmptyState title="No stock data" message="Add products to see availability." className="min-h-0" />
          </div>
        ) : (
          <>
            <div className="relative mt-4 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stockData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={82} paddingAngle={3} stroke="none">
                    {stockData.map((item, index) => <Cell key={item.name} fill={STOCK_COLORS[index]} />)}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold theme-text-primary">{stats.totalProducts}</p>
                  <p className="text-xs theme-text-muted">Products</p>
                </div>
              </div>
            </div>
            <ul className="mt-2 space-y-3">
              {stockData.map((item, index) => (
                <li key={item.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm theme-text-secondary">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STOCK_COLORS[index] }} />
                    {item.name}
                  </span>
                  <span className="text-sm font-semibold theme-text-primary">{item.value}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <Link to="/stock" className="mt-4 inline-flex text-xs font-semibold theme-primary-text hover:underline">Manage stock</Link>
      </section>
    </div>
  );
};

export default DashboardCharts;
