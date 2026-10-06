import { useEffect, useState } from "react";
import { toast } from "sonner";

import Layout from "../components/layout/Layout";
import PageHeader from "../components/common/PageHeader";
import StockMovement from "../components/stock/StockMovement";
import StockRecords from "../components/stock/StockRecords";
import productService from "../services/productService";
import stockService from "../services/stockService";
import { isPositiveInteger, isRequired } from "../utils/validators";
import useAuth from "../hooks/useAuth";
import { hasPermission } from "../utils/permissions";

const EMPTY_HISTORY_FILTERS = {
  productId: "",
  type: "",
  startDate: "",
  endDate: "",
  search: "",
  sortBy: "createdAt",
  sortOrder: "desc"
};

const Stock = () => {
  const { user } = useAuth();
  const canStockIn = hasPermission(user, "stock.in");
  const canStockOut = hasPermission(user, "stock.out");
  const canViewHistory = hasPermission(user, ["stock.history", "reports.stock"]);
  const canViewLowStock = hasPermission(user, ["stock.low-stock", "dashboard.statistics", "reports.stock"]);
  const canViewOutOfStock = hasPermission(user, ["stock.out-of-stock", "dashboard.statistics", "reports.stock"]);
  const canViewProductDetails = hasPermission(user, "products.details");
  const canViewSummary = hasPermission(user, [
    "stock.view", "stock.statistics", "dashboard.statistics", "reports.stock"
  ]);
  const canListProducts = hasPermission(user, [
    "products.view", "stock.view", "sales.create", "udhaar.create", "stock.in", "stock.out"
  ]);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [movementType, setMovementType] = useState(canStockIn ? "in" : "out");
  const [quantity, setQuantity] = useState("");
  const [savingMovement, setSavingMovement] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(
    canViewHistory ? "history" : canViewLowStock ? "low" : "out"
  );
  const activeStockTab = canViewHistory
    ? activeTab
    : canViewLowStock
      ? "low"
      : "out";
  const activeMovementType = canStockIn && !canStockOut
    ? "in"
    : !canStockIn && canStockOut
      ? "out"
      : movementType;
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState(null);
  const [historyDraft, setHistoryDraft] = useState(EMPTY_HISTORY_FILTERS);
  const [historyFilters, setHistoryFilters] = useState(EMPTY_HISTORY_FILTERS);
  const [lowStock, setLowStock] = useState(null);
  const [outOfStock, setOutOfStock] = useState(null);
  const [lowStockPage, setLowStockPage] = useState(1);
  const [outOfStockPage, setOutOfStockPage] = useState(1);
  const [alertSort, setAlertSort] = useState({ sortBy: "name", sortOrder: "asc" });
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadProducts = async () => {
      if (!canListProducts) {
        setProducts([]);
        setProductsLoading(false);
        return;
      }
      setProductsLoading(true);
      setProductsError("");
      try {
        const firstPage = await productService.getProducts({ page: 1 });
        const pages = Array.from(
          { length: Math.max(firstPage.totalPages - 1, 0) },
          (_, index) => index + 2
        );
        const remainingPages = [];
        for (let index = 0; index < pages.length; index += 4) {
          const batch = pages.slice(index, index + 4);
          remainingPages.push(
            ...await Promise.all(batch.map((page) => productService.getProducts({ page })))
          );
        }
        const products = [firstPage, ...remainingPages].flatMap((response) => response.products);
        if (active) {
          setProducts(products);
          setSelectedProductId((current) => current || products[0]?._id || "");
        }
      } catch (error) {
        if (active) setProductsError(error.response?.data?.message || "Failed to load products");
      } finally {
        if (active) setProductsLoading(false);
      }
    };
    loadProducts();

    return () => {
      active = false;
    };
  }, [refreshKey, canListProducts]);

  useEffect(() => {
    let active = true;
    const loadAlerts = async () => {
      setAlertsLoading(true);
      setAlertsError("");
      try {
        const [low, out] = await Promise.allSettled([
          canViewLowStock ? stockService.getLowStock({ page: lowStockPage, ...alertSort }) : Promise.resolve(null),
          canViewOutOfStock ? stockService.getOutOfStock({ page: outOfStockPage, ...alertSort }) : Promise.resolve(null)
        ]);
        if (active) {
          if (low.status === "fulfilled") setLowStock(low.value);
          else setAlertsError(low.reason.response?.data?.message || "Failed to load low-stock products");
          if (out.status === "fulfilled") setOutOfStock(out.value);
          else setAlertsError((current) => [
            current,
            out.reason.response?.data?.message || "Failed to load out-of-stock products"
          ].filter(Boolean).join(" "));
        }
      } finally {
        if (active) setAlertsLoading(false);
      }
    };
    loadAlerts();

    return () => {
      active = false;
    };
  }, [refreshKey, lowStockPage, outOfStockPage, alertSort, canViewLowStock, canViewOutOfStock]);

  useEffect(() => {
    if (!canViewSummary || !selectedProductId) return undefined;

    let active = true;
    const loadSummary = async () => {
      setSummaryLoading(true);
      try {
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
  }, [selectedProductId, refreshKey, canViewSummary]);

  useEffect(() => {
    if (!canViewHistory) return undefined;
    let active = true;
    const params = { page: historyPage };
    Object.entries(historyFilters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });

    const loadHistory = async () => {
      setHistoryLoading(true);
      setHistoryError("");
      try {
        const data = await stockService.getHistory(params);
        if (active) {
          setHistory(data.history);
          setHistoryPagination(data);
        }
      } catch (error) {
        if (active) setHistoryError(error.response?.data?.message || "Failed to load stock history");
      } finally {
        if (active) setHistoryLoading(false);
      }
    };
    loadHistory();

    return () => {
      active = false;
    };
  }, [historyFilters, historyPage, refreshKey, canViewHistory]);

  const handleMovement = async (event) => {
    event.preventDefault();
    if (!isRequired(selectedProductId)) {
      toast.error("Select a product");
      return;
    }
    if (!isPositiveInteger(quantity)) {
      toast.error("Enter a whole-number quantity greater than 0");
      return;
    }

    try {
      setSavingMovement(true);
      if ((activeMovementType === "in" && !canStockIn) || (activeMovementType === "out" && !canStockOut)) return;
      const submit = activeMovementType === "in" ? stockService.stockIn : stockService.stockOut;
      const result = await submit({ productId: selectedProductId, quantity: Number(quantity) });
      toast.success(result.message || "Stock updated successfully");
      setQuantity("");
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update stock");
    } finally {
      setSavingMovement(false);
    }
  };

  const updateHistoryDraft = (key, value) => {
    setHistoryDraft((draft) => ({ ...draft, [key]: value }));
  };

  const updateHistorySort = (field, order) => {
    setHistoryPage(1);
    setHistoryDraft((draft) => ({ ...draft, sortBy: field, sortOrder: order }));
    setHistoryFilters((filters) => ({ ...filters, sortBy: field, sortOrder: order }));
  };

  const applyHistoryFilters = (event) => {
    event.preventDefault();
    if (
      historyDraft.startDate &&
      historyDraft.endDate &&
      historyDraft.startDate > historyDraft.endDate
    ) {
      toast.error("End date must be on or after the start date");
      return;
    }
    setHistoryPage(1);
    setHistoryFilters({ ...historyDraft });
  };

  const selectedProduct = products.find((product) => product._id === selectedProductId);
  const currentSummary = canViewSummary && summary?.product?.id === selectedProductId ? summary : null;
  const visibleAlerts = activeStockTab === "low" ? lowStock : outOfStock;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Stock Management"
          description={`${user?.organizationName || "Your organization"} · Record stock movements and review availability`}
        />
        <StockMovement
          products={canListProducts ? products : []}
          productsLoading={productsLoading}
          productsError={canListProducts ? productsError : ""}
          onRetryProducts={() => setRefreshKey((key) => key + 1)}
          selectedProductId={selectedProductId}
          onProductChange={setSelectedProductId}
          selectedProduct={selectedProduct}
          summary={currentSummary}
          summaryLoading={canViewSummary && summaryLoading}
          movementType={activeMovementType}
          onMovementTypeChange={setMovementType}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onSubmit={handleMovement}
          saving={savingMovement}
          canStockIn={canStockIn}
          canStockOut={canStockOut}
          canViewProductDetails={canViewProductDetails}
        />
        <StockRecords
          activeTab={activeStockTab}
          onTabChange={setActiveTab}
          historyDraft={historyDraft}
          onDraftChange={updateHistoryDraft}
          historySortBy={historyFilters.sortBy}
          historySortOrder={historyFilters.sortOrder}
          onHistorySort={updateHistorySort}
          onApplyFilters={applyHistoryFilters}
          history={history}
          historyLoading={historyLoading}
          historyError={historyError}
          historyPagination={historyPagination || {}}
          onHistoryPageChange={setHistoryPage}
          alerts={{
            products: visibleAlerts?.products || [],
            lowTotal: lowStock?.totalProducts || 0,
            outTotal: outOfStock?.totalProducts || 0
          }}
          alertsLoading={alertsLoading}
          alertsError={alertsError}
          onRetryAlerts={() => setRefreshKey((key) => key + 1)}
          alertPagination={visibleAlerts || {}}
          onAlertPageChange={activeTab === "low" ? setLowStockPage : setOutOfStockPage}
          alertSortBy={alertSort.sortBy}
          alertSortOrder={alertSort.sortOrder}
          onAlertSort={(sortBy, sortOrder) => {
            setLowStockPage(1);
            setOutOfStockPage(1);
            setAlertSort({ sortBy, sortOrder });
          }}
          products={products}
          canViewHistory={canViewHistory}
          canViewLowStock={canViewLowStock}
          canViewOutOfStock={canViewOutOfStock}
          canViewProductDetails={canViewProductDetails}
        />
      </div>
    </Layout>
  );
};

export default Stock;
