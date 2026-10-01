import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  CircleX,
  Download,
  Filter,
  IndianRupee,
  Package,
  RefreshCw
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
import { toast } from "react-toastify";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Layout from "../components/layout/Layout";
import Select from "../components/common/Select";
import Spinner from "../components/common/Spinner";
import categoryService from "../services/categoryService";
import productService from "../services/productService";
import stockService from "../services/stockService";

const PAGE_SIZE = 100;
const PAGE_BATCH_SIZE = 4;
const TABLE_LIMIT = 10;
const CHART_COLORS = [
  "var(--theme-primary)",
  "var(--theme-info)",
  "var(--theme-warning)",
  "var(--theme-danger)",
  "var(--theme-success)"
];
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});
const numberFormatter = new Intl.NumberFormat("en-IN");

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getInitialFilters = () => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  return {
    category: "",
    type: "",
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end)
  };
};

const getCategoryId = (product) => {
  const category = product?.category;
  return typeof category === "string" ? category : category?._id || "";
};

const getCategoryName = (product) => {
  const category = product?.category;
  return typeof category === "object" ? category?.name || "Uncategorized" : "Uncategorized";
};

const fetchAllProducts = async (category) => {
  const params = { page: 1, limit: PAGE_SIZE };
  if (category) params.category = category;

  const firstPage = await productService.getProducts(params);
  const products = [...(firstPage.products || [])];
  const totalPages = Number(firstPage.totalPages) || 1;

  for (let firstPageInBatch = 2; firstPageInBatch <= totalPages; firstPageInBatch += PAGE_BATCH_SIZE) {
    const pages = Array.from(
      { length: Math.min(PAGE_BATCH_SIZE, totalPages - firstPageInBatch + 1) },
      (_, index) => firstPageInBatch + index
    );
    const results = await Promise.all(
      pages.map((page) => productService.getProducts({ ...params, page }))
    );
    results.forEach((result) => products.push(...(result.products || [])));
  }

  return products;
};

const fetchAllHistory = async (filters) => {
  const params = { page: 1, limit: PAGE_SIZE };
  if (filters.type) params.type = filters.type;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;

  const firstPage = await stockService.getHistory(params);
  const history = [...(firstPage.history || [])];
  const totalPages = Number(firstPage.totalPages) || 1;

  for (let firstPageInBatch = 2; firstPageInBatch <= totalPages; firstPageInBatch += PAGE_BATCH_SIZE) {
    const pages = Array.from(
      { length: Math.min(PAGE_BATCH_SIZE, totalPages - firstPageInBatch + 1) },
      (_, index) => firstPageInBatch + index
    );
    const results = await Promise.all(
      pages.map((page) => stockService.getHistory({ ...params, page }))
    );
    results.forEach((result) => history.push(...(result.history || [])));
  }

  return history;
};

const SummaryCard = ({ label, value, icon: Icon, tone }) => (
  <article className="rounded-xl border theme-border theme-surface p-4 shadow-sm sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm font-medium theme-text-muted">{label}</p>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
        <Icon size={18} />
      </span>
    </div>
    <p className="mt-3 break-words text-2xl font-bold theme-text-primary">{value}</p>
  </article>
);

const ReportPanel = ({ title, description, children, className = "" }) => (
  <section className={`overflow-hidden rounded-xl border theme-border theme-surface shadow-sm ${className}`}>
    <div className="border-b theme-border-subtle px-5 py-4 sm:px-6">
      <h2 className="text-base font-semibold theme-text-primary">{title}</h2>
      {description && <p className="mt-1 text-xs theme-text-muted">{description}</p>}
    </div>
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

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const Reports = () => {
  const [draftFilters, setDraftFilters] = useState(getInitialFilters);
  const [filters, setFilters] = useState(getInitialFilters);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    let active = true;

    categoryService.getCategories()
      .then((data) => {
        if (active) setCategories(data.categories || []);
      })
      .catch((error) => {
        if (active) {
          setCategoryError(true);
          toast.error(error.response?.data?.message || "Failed to load categories");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      fetchAllProducts(filters.category),
      fetchAllHistory(filters)
    ]).then(([productResult, historyResult]) => {
      if (!active) return;

      if (productResult.status === "fulfilled") {
        setProducts(productResult.value);
      } else {
        setProducts([]);
        const message = productResult.reason.response?.data?.message || "Unable to load product reports.";
        setProductsError(message);
        toast.error(message);
      }

      if (historyResult.status === "fulfilled") {
        setHistory(historyResult.value);
      } else {
        setHistory([]);
        const message = historyResult.reason.response?.data?.message || "Unable to load stock activity.";
        setHistoryError(message);
        toast.error(message);
      }

      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [filters]);

  const reportProducts = useMemo(() => (
    filters.category
      ? products.filter((product) => getCategoryId(product) === filters.category)
      : products
  ), [filters.category, products]);

  const reportHistory = useMemo(() => {
    if (!filters.category) return history;
    const productCategories = new Map(products.map((product) => [product._id, getCategoryId(product)]));
    return history.filter((entry) => {
      const productId = typeof entry.productId === "object" ? entry.productId?._id : entry.productId;
      return productCategories.get(productId) === filters.category;
    });
  }, [filters.category, history, products]);

  const summary = useMemo(() => reportProducts.reduce((result, product) => {
    const quantity = Number(product.quantity) || 0;
    result.totalStock += quantity;
    result.inventoryValue += (Number(product.price) || 0) * quantity;
    if (quantity > 0 && quantity <= 5) result.lowStock += 1;
    if (quantity === 0) result.outOfStock += 1;
    return result;
  }, {
    totalProducts: reportProducts.length,
    totalStock: 0,
    inventoryValue: 0,
    lowStock: 0,
    outOfStock: 0
  }), [reportProducts]);

  const categoryData = useMemo(() => {
    const totals = new Map();
    reportProducts.forEach((product) => {
      const categoryName = getCategoryName(product);
      totals.set(categoryName, (totals.get(categoryName) || 0) + (Number(product.quantity) || 0));
    });
    return [...totals.entries()]
      .map(([name, stock]) => ({ name, stock }))
      .sort((first, second) => second.stock - first.stock);
  }, [reportProducts]);

  const stockOverview = useMemo(() => {
    const totals = new Map();
    reportHistory.forEach((entry) => {
      const date = new Date(entry.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const key = toDateInputValue(date);
      const current = totals.get(key) || { date: key, stockIn: 0, stockOut: 0 };
      if (entry.type === "in") current.stockIn += Number(entry.quantity) || 0;
      if (entry.type === "out") current.stockOut += Number(entry.quantity) || 0;
      totals.set(key, current);
    });
    return [...totals.values()]
      .sort((first, second) => first.date.localeCompare(second.date))
      .map((item) => ({
        ...item,
        dateLabel: new Date(`${item.date}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
      }));
  }, [reportHistory]);

  const topProducts = useMemo(() => [...reportProducts]
    .sort((first, second) => (Number(second.price) || 0) * (Number(second.quantity) || 0) - (Number(first.price) || 0) * (Number(first.quantity) || 0))
    .slice(0, TABLE_LIMIT), [reportProducts]);

  const lowStockProducts = useMemo(() => reportProducts
    .filter((product) => Number(product.quantity) > 0 && Number(product.quantity) <= 5)
    .sort((first, second) => Number(first.quantity) - Number(second.quantity))
    .slice(0, TABLE_LIMIT), [reportProducts]);

  const recentActivity = useMemo(() => [...reportHistory]
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
    .slice(0, TABLE_LIMIT), [reportHistory]);

  const updateDraftFilter = (key, value) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    if (draftFilters.startDate && draftFilters.endDate && draftFilters.startDate > draftFilters.endDate) {
      toast.error("End date must be on or after the start date");
      return;
    }
    setLoading(true);
    setProductsError("");
    setHistoryError("");
    setFilters({ ...draftFilters });
  };

  const resetFilters = () => {
    const nextFilters = getInitialFilters();
    setLoading(true);
    setProductsError("");
    setHistoryError("");
    setDraftFilters(nextFilters);
    setFilters(nextFilters);
  };

  const summaries = [
    { label: "Total Products", value: numberFormatter.format(summary.totalProducts), icon: Package, tone: "theme-primary-soft theme-primary-text" },
    { label: "Total Stock", value: numberFormatter.format(summary.totalStock), icon: Boxes, tone: "theme-info-soft theme-info" },
    { label: "Inventory Value", value: currencyFormatter.format(summary.inventoryValue), icon: IndianRupee, tone: "theme-success-soft theme-success" },
    { label: "Low Stock", value: numberFormatter.format(summary.lowStock), icon: AlertTriangle, tone: "theme-warning-soft theme-warning" },
    { label: "Out of Stock", value: numberFormatter.format(summary.outOfStock), icon: CircleX, tone: "theme-danger-soft theme-danger" }
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold theme-text-primary">Reports</h1>
            <p className="mt-1 text-sm theme-text-muted">Inventory performance and stock movement</p>
          </div>
          <button
            type="button"
            disabled
            title="Report download is not available in the current API"
            aria-label="Download report unavailable"
            className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border theme-border theme-surface px-4 py-2.5 text-sm font-semibold theme-text-muted opacity-70 sm:w-auto"
          >
            <Download size={16} />
            Download report
          </button>
        </header>

        <form onSubmit={applyFilters} className="rounded-xl border theme-border theme-surface p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2 theme-text-secondary">
            <Filter size={17} />
            <h2 className="text-sm font-semibold">Report filters</h2>
          </div>
          <div className="grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
            <Select
              label="Category"
              name="reportCategory"
              value={draftFilters.category}
              onChange={(event) => updateDraftFilter("category", event.target.value)}
              placeholder={categoryError ? "Categories unavailable" : "All categories"}
              options={categories.map((category) => ({ value: category._id, label: category.name }))}
              disabled={categoryError}
            />
            <Select
              label="Stock type"
              name="reportStockType"
              value={draftFilters.type}
              onChange={(event) => updateDraftFilter("type", event.target.value)}
              placeholder="In and out"
              options={[
                { value: "in", label: "Stock in" },
                { value: "out", label: "Stock out" }
              ]}
            />
            <div>
              <label htmlFor="reportStartDate" className="mb-1.5 block text-sm font-semibold theme-text-primary">From</label>
              <input
                id="reportStartDate"
                type="date"
                value={draftFilters.startDate}
                onChange={(event) => updateDraftFilter("startDate", event.target.value)}
                className="theme-input w-full rounded-xl border px-4 py-3 text-sm theme-text-primary outline-none"
              />
            </div>
            <div>
              <label htmlFor="reportEndDate" className="mb-1.5 block text-sm font-semibold theme-text-primary">To</label>
              <input
                id="reportEndDate"
                type="date"
                value={draftFilters.endDate}
                onChange={(event) => updateDraftFilter("endDate", event.target.value)}
                className="theme-input w-full rounded-xl border px-4 py-3 text-sm theme-text-primary outline-none"
              />
            </div>
            <div className="flex gap-2 sm:col-span-2 xl:col-span-1">
              <Button type="submit" disabled={loading} className="flex-1 xl:flex-none">Apply</Button>
              <Button type="button" variant="outline" onClick={resetFilters} disabled={loading} aria-label="Reset filters" title="Reset filters" className="px-3">
                <RefreshCw size={16} />
              </Button>
            </div>
          </div>
        </form>

        <section aria-label="Inventory summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {summaries.map((item) => (
            <SummaryCard key={item.label} {...item} value={loading || productsError ? "—" : item.value} />
          ))}
        </section>

        {loading && (
          <div className="flex min-h-72 items-center justify-center rounded-xl border theme-border theme-surface">
            <Spinner size="lg" />
          </div>
        )}

        {!loading && (
          <>
            <div className="grid gap-5 xl:grid-cols-5">
              <ReportPanel title="Stock overview" description="Units moved by day in the selected period" className="xl:col-span-3">
                {historyError ? (
                  <ErrorState message={historyError} />
                ) : stockOverview.length === 0 ? (
                  <EmptyState title="No stock activity" message="No stock movements match the selected filters." />
                ) : (
                  <div className="h-[300px] w-full px-2 py-4 sm:px-5">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stockOverview} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--theme-chart-grid)" />
                        <XAxis dataKey="dateLabel" axisLine={false} tickLine={false} tick={{ fill: "var(--theme-chart-label)", fontSize: 11 }} minTickGap={24} />
                        <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: "var(--theme-chart-muted)", fontSize: 11 }} />
                        <Tooltip
                          cursor={{ fill: "var(--theme-surface-secondary)" }}
                          contentStyle={{ border: "1px solid var(--theme-border)", borderRadius: "10px", backgroundColor: "var(--theme-chart-tooltip)", color: "var(--theme-text-primary)" }}
                        />
                        <Legend />
                        <Bar dataKey="stockIn" name="Stock in" fill="var(--theme-success)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                        <Bar dataKey="stockOut" name="Stock out" fill="var(--theme-warning)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </ReportPanel>

              <ReportPanel title="Inventory by category" description="Current units available" className="xl:col-span-2">
                {productsError ? (
                  <ErrorState message={productsError} />
                ) : categoryData.length === 0 ? (
                  <EmptyState title="No category inventory" message="Products will appear here when inventory is available." />
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 sm:flex-row sm:items-center sm:justify-center">
                    <div className="h-[250px] w-full max-w-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryData} dataKey="stock" nameKey="name" innerRadius={58} outerRadius={94} paddingAngle={3}>
                            {categoryData.map((entry, index) => (
                              <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [numberFormatter.format(value), "Units"]}
                            contentStyle={{ border: "1px solid var(--theme-border)", borderRadius: "10px", backgroundColor: "var(--theme-chart-tooltip)", color: "var(--theme-text-primary)" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="grid w-full gap-2 sm:max-w-[170px]">
                      {categoryData.map((category, index) => (
                        <li key={category.name} className="flex min-w-0 items-center justify-between gap-3 text-xs">
                          <span className="flex min-w-0 items-center gap-2 theme-text-secondary">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                            <span className="truncate">{category.name}</span>
                          </span>
                          <span className="shrink-0 font-semibold theme-text-primary">{numberFormatter.format(category.stock)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </ReportPanel>
            </div>

            <ReportPanel title="Most valuable products" description={`Top ${TABLE_LIMIT} products ranked by unit price × current stock`}>
              {productsError ? <ErrorState message={productsError} /> : topProducts.length === 0 ? (
                <EmptyState title="No products to report" message="Add inventory to see product value rankings." />
              ) : (
                <TableFrame headers={["Product", "Category", "Unit price", "Stock", "Total value"]}>
                  {topProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="px-5 py-3.5 font-medium theme-text-primary">{product.name}</td>
                      <td className="px-5 py-3.5 theme-text-secondary">{getCategoryName(product)}</td>
                      <td className="px-5 py-3.5 theme-text-secondary">{currencyFormatter.format(Number(product.price) || 0)}</td>
                      <td className="px-5 py-3.5 theme-text-secondary">{numberFormatter.format(Number(product.quantity) || 0)}</td>
                      <td className="px-5 py-3.5 font-semibold theme-text-primary">{currencyFormatter.format((Number(product.price) || 0) * (Number(product.quantity) || 0))}</td>
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
                      <td className="px-5 py-3.5 theme-text-secondary">{getCategoryName(product)}</td>
                      <td className="px-5 py-3.5 theme-text-secondary">{currencyFormatter.format(Number(product.price) || 0)}</td>
                      <td className="px-5 py-3.5"><span className="inline-flex rounded-full theme-warning-soft px-2.5 py-1 text-xs font-semibold theme-warning">{numberFormatter.format(Number(product.quantity) || 0)}</span></td>
                      <td className="px-5 py-3.5 theme-text-secondary">{currencyFormatter.format((Number(product.price) || 0) * (Number(product.quantity) || 0))}</td>
                    </tr>
                  ))}
                </TableFrame>
              )}
            </ReportPanel>

            <ReportPanel title="Recent stock activity" description={`Latest ${TABLE_LIMIT} movements matching the selected filters`}>
              {historyError ? <ErrorState message={historyError} /> : recentActivity.length === 0 ? (
                <EmptyState title="No recent activity" message="Stock movements will appear here when recorded." />
              ) : (
                <TableFrame headers={["Product", "Type", "Quantity", "User", "Date"]}>
                  {recentActivity.map((entry) => {
                    const product = entry.productId && typeof entry.productId === "object" ? entry.productId : null;
                    const user = entry.createdBy && typeof entry.createdBy === "object" ? entry.createdBy : null;
                    const isStockIn = entry.type === "in";
                    return (
                      <tr key={entry._id}>
                        <td className="px-5 py-3.5 font-medium theme-text-primary">{product?.name || "Product unavailable"}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${isStockIn ? "theme-success-soft theme-success" : "theme-warning-soft theme-warning"}`}>
                            {isStockIn ? <ArrowDownToLine size={13} /> : <ArrowUpFromLine size={13} />}
                            {isStockIn ? "In" : "Out"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 theme-text-secondary">{numberFormatter.format(Number(entry.quantity) || 0)}</td>
                        <td className="px-5 py-3.5 theme-text-secondary">{user?.name || "User unavailable"}</td>
                        <td className="px-5 py-3.5 theme-text-secondary">{formatDate(entry.createdAt)}</td>
                      </tr>
                    );
                  })}
                </TableFrame>
              )}
            </ReportPanel>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Reports;