import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock3,
  Package,
  PackageX,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp
} from "lucide-react";

import Layout from "../components/layout/Layout";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import Input from "../components/common/Input";
import Pagination from "../components/common/Pagination";
import Select from "../components/common/Select";
import Spinner from "../components/common/Spinner";
import productService from "../services/productService";
import stockService from "../services/stockService";

const PAGE_LIMIT = 10;

const Stock = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productsLoading, setProductsLoading] = useState(true);
  const [movementType, setMovementType] = useState("in");
  const [quantity, setQuantity] = useState("");
  const [savingMovement, setSavingMovement] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("history");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [historyDraft, setHistoryDraft] = useState({
    productId: "",
    type: "",
    startDate: "",
    endDate: ""
  });
  const [historyFilters, setHistoryFilters] = useState(historyDraft);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const data = await productService.getProducts({ page: 1, limit: 100 });
        if (active) {
          const fetchedProducts = data.products || [];
          setProducts(fetchedProducts);
          setSelectedProductId((currentId) =>
            currentId || fetchedProducts[0]?._id || ""
          );
        }
      } catch (error) {
        if (active) {
          toast.error(error.response?.data?.message || "Failed to load products");
        }
      } finally {
        if (active) setProductsLoading(false);
      }
    };

    loadProducts();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    let active = true;

    const loadAlerts = async () => {
      try {
        setAlertsLoading(true);
        const [lowStockData, outOfStockData] = await Promise.all([
          stockService.getLowStock(),
          stockService.getOutOfStock()
        ]);
        if (active) {
          setLowStockProducts(lowStockData.products || []);
          setOutOfStockProducts(outOfStockData.products || []);
        }
      } catch (error) {
        if (active) {
          toast.error(error.response?.data?.message || "Failed to load stock alerts");
        }
      } finally {
        if (active) setAlertsLoading(false);
      }
    };

    loadAlerts();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    if (!selectedProductId) {
      return undefined;
    }

    let active = true;

    const loadSummary = async () => {
      try {
        setSummaryLoading(true);
        const data = await stockService.getSummary(selectedProductId);
        if (active) setSummary(data);
      } catch (error) {
        if (active) {
          setSummary(null);
          toast.error(error.response?.data?.message || "Failed to load stock summary");
        }
      } finally {
        if (active) setSummaryLoading(false);
      }
    };

    loadSummary();
    return () => {
      active = false;
    };
  }, [selectedProductId, refreshKey]);

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError("");
        const params = { page: historyPage, limit: PAGE_LIMIT };
        Object.entries(historyFilters).forEach(([key, value]) => {
          if (value) params[key] = value;
        });

        const data = await stockService.getHistory(params);
        if (active) {
          setHistory(data.history || []);
          setHistoryPagination({
            page: data.page,
            totalPages: data.totalPages,
            hasNextPage: data.hasNextPage,
            hasPreviousPage: data.hasPreviousPage
          });
        }
      } catch (error) {
        if (active) {
          setHistoryError(error.response?.data?.message || "Failed to load stock history");
        }
      } finally {
        if (active) setHistoryLoading(false);
      }
    };

    loadHistory();
    return () => {
      active = false;
    };
  }, [historyFilters, historyPage, refreshKey]);

  const handleMovement = async (event) => {
    event.preventDefault();
    if (!selectedProductId || Number(quantity) < 1) return;

    try {
      setSavingMovement(true);
      const submitMovement = movementType === "in"
        ? stockService.stockIn
        : stockService.stockOut;
      const result = await submitMovement({
        productId: selectedProductId,
        quantity: Number(quantity)
      });

      toast.success(result.message || "Stock updated successfully");
      setQuantity("");
      setRefreshKey((currentKey) => currentKey + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update stock");
    } finally {
      setSavingMovement(false);
    }
  };

  const applyHistoryFilters = (event) => {
    event.preventDefault();
    setHistoryPage(1);
    setHistoryFilters({ ...historyDraft });
  };

  const selectedProduct = products.find(
    (product) => product._id === selectedProductId
  );
  const currentSummary = summary?.product?.id === selectedProductId ? summary : null;
  const visibleAlerts = activeTab === "low"
    ? lowStockProducts
    : outOfStockProducts;

  const tabs = [
    { id: "history", label: "History", count: null, icon: Clock3 },
    { id: "low", label: "Low stock", count: lowStockProducts.length, icon: TrendingDown },
    { id: "out", label: "Out of stock", count: outOfStockProducts.length, icon: PackageX }
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Stock Management"
          description="Record stock movements and review availability"
        />

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Current stock", value: currentSummary?.product?.currentStock, icon: Package },
            { label: "Total stock in", value: currentSummary?.summary?.totalStockIn, icon: TrendingUp },
            { label: "Total stock out", value: currentSummary?.summary?.totalStockOut, icon: TrendingDown }
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border theme-border theme-surface p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm theme-text-muted">{label}</p>
                <Icon size={18} className="theme-text-muted" />
              </div>
              <p className="mt-2 text-2xl font-bold theme-text-primary">
                {productsLoading || summaryLoading ? "—" : value ?? "—"}
              </p>
            </div>
          ))}
        </div>

        <section className="mb-6 rounded-2xl border theme-border theme-surface p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold theme-text-primary">Record stock movement</h2>
            <p className="mt-1 text-sm theme-text-muted">
              {selectedProduct
                ? `${selectedProduct.name} · ${selectedProduct.quantity} currently available`
                : "Select a product to record a movement"}
            </p>
          </div>

          <div className="mb-4 inline-flex rounded-xl border theme-border theme-surface-secondary p-1">
            <button
              type="button"
              aria-pressed={movementType === "in"}
              onClick={() => setMovementType("in")}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${movementType === "in" ? "theme-success-soft theme-success" : "theme-text-muted theme-hover-surface"}`}
            >
              <ArrowDownToLine size={16} /> Stock In
            </button>
            <button
              type="button"
              aria-pressed={movementType === "out"}
              onClick={() => setMovementType("out")}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${movementType === "out" ? "theme-warning-soft theme-warning" : "theme-text-muted theme-hover-surface"}`}
            >
              <ArrowUpFromLine size={16} /> Stock Out
            </button>
          </div>

          <form onSubmit={handleMovement} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
            <Select
              label="Product"
              name="stockProduct"
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
              placeholder={productsLoading ? "Loading products..." : "Select a product"}
              options={products.map((product) => ({
                value: product._id,
                label: product.name
              }))}
              disabled={productsLoading || products.length === 0 || savingMovement}
            />
            <Input
              label="Quantity"
              name="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Enter quantity"
              required
              disabled={!selectedProductId || savingMovement}
            />
            <Button
              type="submit"
              loading={savingMovement}
              disabled={!selectedProductId || !quantity}
              className="w-full sm:w-auto"
            >
              {movementType === "in" ? "Add stock" : "Remove stock"}
            </Button>
          </form>
          {!productsLoading && products.length === 0 && (
            <p className="mt-3 text-sm theme-text-muted">Add a product before recording stock movements.</p>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border theme-border theme-surface shadow-sm">
          <div className="flex flex-col gap-4 border-b theme-border-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Stock views">
              {tabs.map(({ id, label, count, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === id}
                  onClick={() => setActiveTab(id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${activeTab === id ? "theme-primary-soft theme-primary-text" : "theme-text-muted theme-hover-surface"}`}
                >
                  <Icon size={16} />
                  {label}
                  {count !== null && <span className="text-xs">{count}</span>}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "history" ? (
            <>
              <form onSubmit={applyHistoryFilters} className="grid gap-3 border-b theme-border-subtle p-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="w-full">
                  <label htmlFor="historyProductId" className="mb-1.5 block text-sm font-semibold theme-text-primary">
                    Product
                  </label>
                  <select
                    id="historyProductId"
                    value={historyDraft.productId}
                    onChange={(event) => setHistoryDraft((draft) => ({ ...draft, productId: event.target.value }))}
                    className="theme-input h-[46px] w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  >
                    <option value="">All products</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full">
                  <label htmlFor="historyType" className="mb-1.5 block text-sm font-semibold theme-text-primary">
                    Movement
                  </label>
                  <select
                    id="historyType"
                    value={historyDraft.type}
                    onChange={(event) => setHistoryDraft((draft) => ({ ...draft, type: event.target.value }))}
                    className="theme-input h-[46px] w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  >
                    <option value="">All movements</option>
                    <option value="in">Stock in</option>
                    <option value="out">Stock out</option>
                  </select>
                </div>
                <Input
                  label="Start date"
                  name="startDate"
                  type="date"
                  value={historyDraft.startDate}
                  onChange={(event) => setHistoryDraft((draft) => ({ ...draft, startDate: event.target.value }))}
                />
                <Input
                  label="End date"
                  name="endDate"
                  type="date"
                  value={historyDraft.endDate}
                  onChange={(event) => setHistoryDraft((draft) => ({ ...draft, endDate: event.target.value }))}
                />
                <Button type="submit" variant="primary" className="h-[46px] w-full self-end py-0">
                  <SlidersHorizontal size={16} />
                  Apply filters
                </Button>
              </form>

              {historyLoading ? (
                <div className="flex min-h-[240px] items-center justify-center"><Spinner size="lg" /></div>
              ) : historyError ? (
                <div className="p-5 text-sm theme-danger">{historyError}</div>
              ) : history.length === 0 ? (
                <EmptyState
                  title="No stock movements yet"
                  message="Stock in and stock out activity will appear here."
                  icon={Clock3}
                  className="min-h-[260px]"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b theme-border-subtle theme-surface-secondary text-left">
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide theme-text-muted">Product</th>
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide theme-text-muted">Movement</th>
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide theme-text-muted">Quantity</th>
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide theme-text-muted">Recorded by</th>
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide theme-text-muted">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((entry) => (
                        <tr key={entry._id} className="border-b theme-border-subtle transition theme-hover-surface">
                          <td className="px-5 py-4 font-medium theme-text-primary">{entry.productId?.name || "Product unavailable"}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${entry.type === "in" ? "theme-success-soft theme-success" : "theme-warning-soft theme-warning"}`}>
                              {entry.type === "in" ? "Stock in" : "Stock out"}
                            </span>
                          </td>
                          <td className="px-5 py-4 theme-text-primary">{entry.quantity}</td>
                          <td className="px-5 py-4 theme-text-secondary">{entry.createdBy?.name || "—"}</td>
                          <td className="px-5 py-4 text-sm theme-text-muted">{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination
                    page={historyPagination.page}
                    totalPages={historyPagination.totalPages}
                    hasNextPage={historyPagination.hasNextPage}
                    hasPreviousPage={historyPagination.hasPreviousPage}
                    onPageChange={setHistoryPage}
                  />
                </div>
              )}
            </>
          ) : (
            alertsLoading ? (
              <div className="flex min-h-[240px] items-center justify-center"><Spinner size="lg" /></div>
            ) : visibleAlerts.length === 0 ? (
              <EmptyState
                title={activeTab === "low" ? "No low stock products" : "No products out of stock"}
                message={activeTab === "low" ? "Products with five or fewer units will appear here." : "Products with zero units will appear here."}
                icon={activeTab === "low" ? TrendingDown : PackageX}
                className="min-h-[260px]"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b theme-border-subtle theme-surface-secondary text-left">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide theme-text-muted">Product</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide theme-text-muted">Unit price</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide theme-text-muted">Available stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleAlerts.map((product) => (
                      <tr key={product._id} className="border-b theme-border-subtle transition theme-hover-surface">
                        <td className="px-5 py-4 font-medium theme-text-primary">{product.name}</td>
                        <td className="px-5 py-4 theme-text-secondary">₹{product.price}</td>
                        <td className="px-5 py-4 font-semibold theme-text-primary">{product.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Stock;