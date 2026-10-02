import { useEffect, useState } from "react";

import Layout from "../components/layout/Layout";
import Spinner from "../components/common/Spinner";
import DashboardStats from "../components/dashboard/DashboardStats";
import DashboardCharts from "../components/dashboard/DashboardCharts";
import DashboardInventory from "../components/dashboard/DashboardInventory";
import useProducts from "../hooks/useProducts";
import categoryService from "../services/categoryService";
import productService from "../services/productService";
import stockService from "../services/stockService";

const Dashboard = () => {
  const { products, loading: productsLoading, error: productsError } = useProducts({
    page: 1
  });
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [categoryRefresh, setCategoryRefresh] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState("");

  useEffect(() => {
    let active = true;

    productService.getProductStats()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((error) => {
        if (active) setStatsError(error.response?.data?.message || "Unable to load inventory statistics.");
      })
      .finally(() => {
        if (active) setStatsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    categoryService.getCategoryStats()
      .then((data) => {
        if (active) setCategoryData(data.categories);
      })
      .catch((error) => {
        if (active) setCategoryError(error.response?.data?.message || "Unable to load category statistics.");
      })
      .finally(() => {
        if (active) setCategoryLoading(false);
      });

    return () => {
      active = false;
    };
  }, [categoryRefresh]);

  useEffect(() => {
    let active = true;

    Promise.all([
      stockService.getLowStock({ page: 1 }),
      stockService.getOutOfStock({ page: 1 })
    ])
      .then(([lowStock, outOfStock]) => {
        if (active) {
          setLowStockProducts(lowStock.products);
          setOutOfStockProducts(outOfStock.products);
        }
      })
      .catch((error) => {
        if (active) setAlertsError(error.response?.data?.message || "Unable to load inventory alerts.");
      })
      .finally(() => {
        if (active) setAlertsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const loading = productsLoading || statsLoading;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight theme-text-primary">Dashboard</h1>
          <p className="mt-1 text-sm theme-text-muted">Monitor your inventory from one workspace</p>
        </header>

        {loading ? (
          <div className="flex min-h-[500px] items-center justify-center"><Spinner size="lg" /></div>
        ) : statsError || productsError ? (
          <div role="alert" className="rounded-xl border theme-danger-border theme-danger-soft p-5 text-sm theme-danger">
            {statsError || productsError}
          </div>
        ) : (
          <>
            <DashboardStats stats={stats} />
            <DashboardCharts
              stats={stats}
              categoryData={categoryData}
              categoryLoading={categoryLoading}
              categoryError={categoryError}
              onRetryCategories={() => {
                setCategoryLoading(true);
                setCategoryError("");
                setCategoryRefresh((refresh) => refresh + 1);
              }}
            />
            <DashboardInventory
              products={products}
              alertsLoading={alertsLoading}
              alertsError={alertsError}
              lowStockProducts={lowStockProducts}
              outOfStockProducts={outOfStockProducts}
              hasAlerts={stats.lowStockProducts > 0 || stats.outOfStockProducts > 0}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
