import { useEffect, useState } from "react";

import Layout from "../components/layout/Layout";
import Spinner from "../components/common/Spinner";
import DashboardStats from "../components/dashboard/DashboardStats";
import DashboardCharts from "../components/dashboard/DashboardCharts";
import DashboardInventory from "../components/dashboard/DashboardInventory";
import SalesDashboard from "../components/dashboard/SalesDashboard";
import RecentSales from "../components/dashboard/RecentSales";
import categoryService from "../services/categoryService";
import productService from "../services/productService";
import stockService from "../services/stockService";
import salesService from "../services/salesService";
import udhaarService from "../services/udhaarService";
import useAuth from "../hooks/useAuth";
import { hasPermission } from "../utils/permissions";

const Dashboard = () => {
  const { user } = useAuth();
  const canViewDashboardStatistics = hasPermission(user, "dashboard.statistics");
  const canViewProducts = hasPermission(user, "products.view");
  const canViewStock = hasPermission(user, "stock.view");
  const canViewSales = hasPermission(user, "sales.view");
  const canViewUdhaar = hasPermission(user, "udhaar.view");
  const [dashboardData, setDashboardData] = useState({
    inventory: null,
    sales: null,
    udhaar: null,
    lowStock: null,
    outOfStock: null
  });
  const [loadedMetricsKey, setLoadedMetricsKey] = useState("");
  const [metricErrors, setMetricErrors] = useState({});
  const [categoryData, setCategoryData] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [categoryRefresh, setCategoryRefresh] = useState(0);

  useEffect(() => {
    let active = true;

    const metricsKey = String(canViewDashboardStatistics);
    const requests = [
      ["inventory", canViewDashboardStatistics ? productService.getProductStats() : Promise.resolve(null)],
      ["lowStock", canViewDashboardStatistics ? stockService.getLowStock({ page: 1, limit: 5 }) : Promise.resolve(null)],
      ["outOfStock", canViewDashboardStatistics ? stockService.getOutOfStock({ page: 1, limit: 5 }) : Promise.resolve(null)],
      ["sales", canViewDashboardStatistics ? salesService.getAnalytics() : Promise.resolve(null)],
      ["udhaar", canViewDashboardStatistics ? udhaarService.getStats() : Promise.resolve(null)]
    ];
    Promise.allSettled(requests.map(([, request]) => request))
      .then((results) => {
        if (!active) return;
        const nextData = {};
        const errors = {};
        results.forEach((result, index) => {
          const [key] = requests[index];
          if (result.status === "fulfilled") {
            const value = result.value;
            nextData[key] = key === "sales" ? value?.analytics || value
              : key === "udhaar" ? value?.analytics || value
                : value;
          } else {
            nextData[key] = null;
            errors[key] = result.reason?.response?.data?.message || `Unable to load ${key === "inventory" ? "inventory statistics" : key === "lowStock" ? "low-stock products" : key === "outOfStock" ? "out-of-stock products" : key === "sales" ? "sales analytics" : "Udhaar statistics"}.`;
          }
        });
        setDashboardData((current) => ({ ...current, ...nextData }));
        setMetricErrors(errors);
      })
      .finally(() => {
        if (active) setLoadedMetricsKey(metricsKey);
      });

    return () => {
      active = false;
    };
  }, [canViewDashboardStatistics]);

  useEffect(() => {
    if (!canViewDashboardStatistics) {
      return undefined;
    }
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
  }, [categoryRefresh, canViewDashboardStatistics]);

  const metricsLoading = canViewDashboardStatistics && loadedMetricsKey !== "true";

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight theme-text-primary">Dashboard</h1>
          <p className="mt-1 text-sm theme-text-muted">{user?.organizationName || "Your organization"} · Inventory and business overview</p>
        </header>

        {metricsLoading ? (
          <div className="flex min-h-[500px] items-center justify-center"><Spinner size="lg" /></div>
        ) : (
          <>
            {Object.keys(metricErrors).length > 0 && (
              <div role="alert" className="mb-4 rounded-xl border theme-danger-border theme-danger-soft p-4 text-sm theme-danger">
                {Object.entries(metricErrors).map(([key, message]) => <p key={key}>{message}</p>)}
              </div>
            )}
            {canViewDashboardStatistics ? <>
            <DashboardStats
              inventory={dashboardData.inventory}
              sales={dashboardData.sales}
              udhaar={dashboardData.udhaar}
              outOfStock={dashboardData.outOfStock}
              canViewSales={canViewSales}
              canViewUdhaar={canViewUdhaar}
              canViewProducts={canViewProducts}
              canViewStock={canViewStock}
            />
            {dashboardData.inventory && (
              <DashboardCharts
                stats={dashboardData.inventory}
                lowStockCount={dashboardData.lowStock?.totalProducts}
                outOfStockCount={dashboardData.outOfStock?.totalProducts}
                categoryData={categoryData}
                categoryLoading={categoryLoading}
                categoryError={categoryError}
                onRetryCategories={() => {
                  setCategoryLoading(true);
                  setCategoryError("");
                  setCategoryRefresh((refresh) => refresh + 1);
                }}
                canViewStock={canViewStock}
                canViewProductDetails={hasPermission(user, "products.details")}
              />
            )}
            <DashboardInventory
              loading={metricsLoading}
              lowStockProducts={dashboardData.lowStock?.products || []}
              outOfStockProducts={dashboardData.outOfStock?.products || []}
              lowStockCount={dashboardData.lowStock?.totalProducts}
              outOfStockCount={dashboardData.outOfStock?.totalProducts}
              lowStockError={metricErrors.lowStock}
              outOfStockError={metricErrors.outOfStock}
              canViewStock={canViewStock}
              canViewProductDetails={hasPermission(user, "products.details")}
            />
            <SalesDashboard
              sales={dashboardData.sales}
              udhaar={dashboardData.udhaar}
              loading={metricsLoading}
              error={[metricErrors.sales, metricErrors.udhaar].filter(Boolean).join(" ")}
            />
            {canViewSales && <RecentSales />}
            </> : <p className="mt-5 rounded-2xl border theme-border theme-surface p-6 text-sm theme-text-muted">
              Dashboard statistics are not enabled for your account. Ask your administrator to grant this permission.
            </p>}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
