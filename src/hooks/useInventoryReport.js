import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import categoryService from "../services/categoryService";
import productService from "../services/productService";
import stockService from "../services/stockService";

const PAGE_BATCH_SIZE = 4;
export const CHART_COLORS = [
  "var(--theme-primary)",
  "var(--theme-info)",
  "var(--theme-warning)",
  "var(--theme-danger)",
  "var(--theme-success)"
];
export const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});
export const numberFormatter = new Intl.NumberFormat("en-IN");

export const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getInitialFilters = () => {
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

const getCategoryId = (product) => (
  typeof product.category === "string" ? product.category : product.category?._id
);

const getCategoryName = (product) => (
  typeof product.category === "object" && product.category?.name
    ? product.category.name
    : "Uncategorized"
);

const fetchAllPages = async (fetchPage, collection, params) => {
  const firstPage = await fetchPage({ ...params, page: 1 });
  const pages = Array.from(
    { length: Math.max(firstPage.totalPages - 1, 0) },
    (_, index) => index + 2
  );
  const laterPages = [];

  for (let index = 0; index < pages.length; index += PAGE_BATCH_SIZE) {
    const batch = pages.slice(index, index + PAGE_BATCH_SIZE);
    const responses = await Promise.all(
      batch.map((page) => fetchPage({ ...params, page }))
    );
    laterPages.push(...responses);
  }

  return [firstPage, ...laterPages].flatMap((response) => response[collection]);
};

const fetchReportProducts = (category) => fetchAllPages(
  productService.getProducts,
  "products",
  category ? { category } : {}
);

const fetchReportHistory = (filters) => {
  const { type, startDate, endDate } = filters;
  return fetchAllPages(stockService.getHistory, "history", {
    ...(type && { type }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  });
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const useInventoryReport = (filters) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [productsError, setProductsError] = useState("");
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    let active = true;
    categoryService.getCategories()
      .then((data) => {
        if (active) setCategories(data.categories);
      })
      .catch((error) => {
        if (active) {
          const message = error.response?.data?.message || "Failed to load categories";
          setCategoryError(message);
          toast.error(message);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadReport = async () => {
      setLoading(true);
      setProductsError("");
      setHistoryError("");
      const [productsResult, historyResult] = await Promise.allSettled([
        fetchReportProducts(filters.category),
        fetchReportHistory(filters)
      ]);
      if (!active) return;

      if (productsResult.status === "fulfilled") {
        setProducts(productsResult.value);
      } else {
        setProducts([]);
        const message = productsResult.reason.response?.data?.message || "Unable to load product reports.";
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
    };
    loadReport();
    return () => {
      active = false;
    };
  }, [filters]);

  const reportHistory = useMemo(() => {
    if (!filters.category) return history;
    const categoriesByProduct = new Map(products.map((product) => [product._id, getCategoryId(product)]));
    return history.filter((entry) => {
      const productId = typeof entry.productId === "object" ? entry.productId?._id : entry.productId;
      return categoriesByProduct.get(productId) === filters.category;
    });
  }, [filters.category, history, products]);

  const summary = useMemo(() => products.reduce((result, product) => {
    result.totalStock += product.quantity;
    result.inventoryValue += product.price * product.quantity;
    if (product.quantity > 0 && product.quantity <= 5) result.lowStock += 1;
    if (product.quantity === 0) result.outOfStock += 1;
    return result;
  }, {
    totalProducts: products.length,
    totalStock: 0,
    inventoryValue: 0,
    lowStock: 0,
    outOfStock: 0
  }), [products]);

  const categoryData = useMemo(() => {
    const totals = new Map();
    products.forEach((product) => {
      const name = getCategoryName(product);
      totals.set(name, (totals.get(name) || 0) + product.quantity);
    });
    return [...totals.entries()]
      .map(([name, stock]) => ({ name, stock }))
      .sort((first, second) => second.stock - first.stock);
  }, [products]);

  const stockOverview = useMemo(() => {
    const totals = new Map();
    reportHistory.forEach((entry) => {
      const date = new Date(entry.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const key = toDateInputValue(date);
      const current = totals.get(key) || { date: key, stockIn: 0, stockOut: 0 };
      if (entry.type === "in") current.stockIn += entry.quantity;
      if (entry.type === "out") current.stockOut += entry.quantity;
      totals.set(key, current);
    });
    return [...totals.values()]
      .sort((first, second) => first.date.localeCompare(second.date))
      .map((item) => ({
        ...item,
        dateLabel: new Date(`${item.date}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
      }));
  }, [reportHistory]);

  const topProducts = useMemo(() => [...products]
    .sort((first, second) => second.price * second.quantity - first.price * first.quantity), [products]);
  const lowStockProducts = useMemo(() => products
    .filter((product) => product.quantity > 0 && product.quantity <= 5)
    .sort((first, second) => first.quantity - second.quantity), [products]);
  const recentActivity = useMemo(() => [...reportHistory]
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)), [reportHistory]);

  return {
    categories,
    categoryError,
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
  };
};

export default useInventoryReport;
