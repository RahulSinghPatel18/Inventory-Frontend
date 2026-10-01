import { Link } from "react-router-dom";
import React from "react";
import {
  Package,
  Boxes,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  CircleX
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

import Layout from "../components/layout/Layout";
import Spinner from "../components/common/Spinner";
import useProducts from "../hooks/useProducts";
import productService from "../services/productService";

const Dashboard = () => {
  const {
    products,
    loading: productsLoading
  } = useProducts();

  const [stats, setStats] = React.useState({
    totalProducts: 0,
    totalStock: 0,
    totalInventoryValue: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0
  });

  const [statsLoading, setStatsLoading] = React.useState(true);
  const [statsError, setStatsError] = React.useState("");

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await productService.getProductStats();
        const data = response?.stats ?? response?.data ?? response;

        setStats({
          totalProducts: Number(data?.totalProducts) || 0,
          totalStock: Number(data?.totalStock) || 0,
          totalInventoryValue: Number(data?.totalInventoryValue) || 0,
          lowStockProducts: Number(data?.lowStockProducts) || 0,
          outOfStockProducts: Number(data?.outOfStockProducts) || 0
        });
      } catch (error) {
        console.error("Failed to fetch product stats:", error);
        setStatsError(
          error.response?.data?.message || "Unable to load inventory statistics."
        );
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const loading = productsLoading || statsLoading;

  const lowStockProducts = products.filter(
    (product) => product.quantity > 0 && product.quantity <= 5
  );

  const outOfStockProducts = products.filter(
    (product) => product.quantity === 0
  );

  const categoryMap = {};

  products.forEach((product) => {
    const categoryName = product.category?.name ?? product.category;

    if (!categoryMap[categoryName]) {
      categoryMap[categoryName] = 0;
    }

    categoryMap[categoryName] += product.quantity;
  });

  const categoryData = Object.entries(categoryMap).map(
    ([name, stock]) => ({
      name,
      stock
    })
  );

  const stockData = [
    {
      name: "In Stock",
      value: Math.max(
        stats.totalProducts -
          stats.lowStockProducts -
          stats.outOfStockProducts,
        0
      )
    },
    {
      name: "Low Stock",
      value: stats.lowStockProducts
    },
    {
      name: "Out of Stock",
      value: stats.outOfStockProducts
    }
  ].filter((item) => item.value > 0);

  const stockColors = [
    "var(--theme-success)",
    "var(--theme-warning)",
    "var(--theme-danger)"
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight theme-text-primary">
              Dashboard
            </h1>

            <p className="mt-1 text-sm theme-text-muted">
              Monitor your inventory from one workspace
            </p>
          </div>

        </div>

        {loading ? (
          <div className="flex min-h-[500px] items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <>

<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

  <Link to="/products" className="block">
    <div className="group rounded-2xl border theme-border theme-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium theme-text-muted">
          Total Products
        </p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl theme-primary-soft theme-primary-text transition group-hover:scale-105">
          <Package size={20} />
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight theme-text-primary">
        {stats.totalProducts}
      </p>
    </div>
  </Link>

  <div className="rounded-2xl border theme-border theme-surface p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <p className="text-sm font-medium theme-text-muted">
        Total Stock
      </p>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl theme-info-soft theme-info">
        <Boxes size={20} />
      </div>
    </div>
    <p className="mt-4 text-3xl font-bold tracking-tight theme-text-primary">
      {stats.totalStock}
    </p>
  </div>

  <div className="rounded-2xl border theme-border theme-surface p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <p className="text-sm font-medium theme-text-muted">
        Inventory Value
      </p>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl theme-primary-soft theme-primary-text">
        <IndianRupee size={20} />
      </div>
    </div>
    <p className="mt-4 text-3xl font-bold tracking-tight theme-text-primary">
      ₹{stats.totalInventoryValue.toLocaleString("en-IN")}
    </p>
  </div>

  <div className="rounded-2xl border theme-border theme-surface p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <p className="text-sm font-medium theme-text-muted">
        Low Stock
      </p>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl theme-warning-soft theme-warning">
        <AlertTriangle size={20} />
      </div>
    </div>
    <p className="mt-4 text-3xl font-bold tracking-tight theme-text-primary">
      {stats.lowStockProducts}
    </p>
  </div>

  <div className="rounded-2xl border theme-border theme-surface p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <p className="text-sm font-medium theme-text-muted">
        Out of Stock
      </p>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl theme-danger-soft theme-danger">
        <CircleX size={20} />
      </div>
    </div>
    <p className="mt-4 text-3xl font-bold tracking-tight theme-text-primary">
      {stats.outOfStockProducts}
    </p>
  </div>

</div>



            {/* Charts */}
            <div className="mt-5 grid gap-5 xl:grid-cols-3">

              {/* Category Stock */}
              <div className="rounded-2xl border theme-border theme-surface p-5 shadow-sm xl:col-span-2">

                <div className="mb-5">
                  <h2 className="text-base font-semibold theme-text-primary">
                    Stock by Category
                  </h2>

                  <p className="mt-1 text-xs theme-text-muted">
                    Current stock distribution across categories
                  </p>
                </div>

                {categoryData.length === 0 ? (
                  <div className="flex h-[280px] items-center justify-center text-sm theme-text-muted">
                    No category data available
                  </div>
                ) : (
                  <div className="h-[280px] w-full">

                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryData}
                        margin={{
                          top: 10,
                          right: 10,
                          left: -20,
                          bottom: 5
                        }}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="var(--theme-chart-grid)"
                        />

                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "var(--theme-chart-label)",
                            fontSize: 12
                          }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "var(--theme-chart-muted)",
                            fontSize: 12
                          }}
                        />

                        <Tooltip
                          cursor={{
                            fill: "var(--theme-surface-secondary)"
                          }}
                          contentStyle={{
                            border: "1px solid var(--theme-border)",
                            borderRadius: "12px",
                            backgroundColor: "var(--theme-chart-tooltip)",
                            color: "var(--theme-text-primary)",
                            boxShadow: "var(--theme-shadow)"
                          }}
                        />

                        <Bar
                          dataKey="stock"
                          fill="var(--theme-primary)"
                          radius={[6, 6, 0, 0]}
                          barSize={38}
                        />

                      </BarChart>
                    </ResponsiveContainer>

                  </div>
                )}

              </div>

              {/* Stock Status */}
              <div className="rounded-2xl border theme-border theme-surface p-5 shadow-sm">

                <div>
                  <h2 className="text-base font-semibold theme-text-primary">
                    Stock Status
                  </h2>

                  <p className="mt-1 text-xs theme-text-muted">
                    Product availability overview
                  </p>
                </div>

                {stats.totalProducts === 0 ? (
                  <div className="flex h-[280px] items-center justify-center text-sm theme-text-muted">
                    No stock data available
                  </div>
                ) : (
                  <div className="relative mt-4 h-[220px]">

                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>

                        <Pie
                          data={stockData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={58}
                          outerRadius={82}
                          paddingAngle={3}
                          stroke="none"
                        >

                          {stockData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={stockColors[index]}
                            />
                          ))}

                        </Pie>

                        <Tooltip
                          contentStyle={{
                            border: "1px solid var(--theme-border)",
                            borderRadius: "12px",
                            backgroundColor: "var(--theme-chart-tooltip)",
                            color: "var(--theme-text-primary)",
                            boxShadow: "var(--theme-shadow)"
                          }}
                        />

                      </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                      <div className="text-center">

                        <p className="text-2xl font-bold theme-text-primary">
                          {stats.totalProducts}
                        </p>

                        <p className="text-xs theme-text-muted">
                          Products
                        </p>

                      </div>

                    </div>

                  </div>
                )}

                <div className="mt-2 space-y-3">

                  {stockData.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >

                      <div className="flex items-center gap-2">

                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: stockColors[index]
                          }}
                        />

                        <span className="text-sm theme-text-secondary">
                          {item.name}
                        </span>

                      </div>

                      <span className="text-sm font-semibold theme-text-primary">
                        {item.value}
                      </span>

                    </div>
                  ))}

                </div>

              </div>

            </div>

            {/* Bottom Section */}
            <div className="mt-5 grid gap-5 lg:grid-cols-3">

              {/* Recent Products */}
              <div className="overflow-hidden rounded-2xl border theme-border theme-surface shadow-sm lg:col-span-2">

                <div className="flex items-center justify-between border-b theme-border-subtle px-5 py-4">

                  <div>
                    <h2 className="text-base font-semibold theme-text-primary">
                      Recent Products
                    </h2>

                    <p className="mt-1 text-xs theme-text-muted">
                      Latest products in your inventory
                    </p>
                  </div>

                  <Link
                    to="/products"
                    className="flex items-center gap-1 text-xs font-semibold theme-primary-text hover:underline"
                  >
                    View all
                    <ArrowRight size={14} />
                  </Link>

                </div>

                {products.length === 0 ? (
                  <div className="flex min-h-[220px] items-center justify-center text-sm theme-text-muted">
                    No products available
                  </div>
                ) : (
                  <div className="divide-y theme-divide-y">

                    {products.slice(0, 5).map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center justify-between gap-4 px-5 py-4 transition theme-hover-surface"
                      >

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl theme-primary-soft font-semibold theme-primary-text">
                            {product.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-medium theme-text-primary">
                              {product.name}
                            </p>

                            <p className="mt-0.5 truncate text-xs theme-text-muted">
                              {product.category?.name ?? product.category}
                            </p>

                          </div>

                        </div>

                        <div className="shrink-0 text-right">

                          <p className="text-sm font-semibold theme-text-primary">
                            ₹{product.price}
                          </p>

                          <p className="mt-0.5 text-xs theme-text-muted">
                            {product.quantity} units
                          </p>

                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </div>

              {/* Alerts */}
              <div className="rounded-2xl border theme-border theme-surface shadow-sm">

                <div className="border-b theme-border-subtle px-5 py-4">

                  <h2 className="text-base font-semibold theme-text-primary">
                    Inventory Alerts
                  </h2>

                  <p className="mt-1 text-xs theme-text-muted">
                    Products that need attention
                  </p>

                </div>

                <div className="p-5">

                  {stats.lowStockProducts === 0 &&
                  stats.outOfStockProducts === 0 ? (
                    <div className="flex min-h-[180px] flex-col items-center justify-center text-center">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl theme-success-soft theme-success">
                        <TrendingUp size={20} />
                      </div>

                      <p className="mt-3 text-sm font-semibold theme-text-primary">
                        Inventory looks good
                      </p>

                      <p className="mt-1 text-xs theme-text-muted">
                        No products need attention right now.
                      </p>

                    </div>
                  ) : (
                    <div className="space-y-3">

                      {stats.outOfStockProducts > 0 && outOfStockProducts.length === 0 && (
                        <p className="text-sm theme-text-secondary">
                          {stats.outOfStockProducts} products are out of stock.
                        </p>
                      )}

                      {stats.lowStockProducts > 0 && lowStockProducts.length === 0 && (
                        <p className="text-sm theme-text-secondary">
                          {stats.lowStockProducts} products are low on stock.
                        </p>
                      )}

                      {outOfStockProducts.slice(0, 3).map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center gap-3 rounded-xl theme-danger-soft p-3"
                        >

                          <CircleX
                            size={18}
                            className="shrink-0 theme-danger"
                          />

                          <div className="min-w-0">

                            <p className="truncate text-sm font-medium theme-text-primary">
                              {product.name}
                            </p>

                            <p className="text-xs theme-danger">
                              Out of stock
                            </p>

                          </div>

                        </div>
                      ))}

                      {lowStockProducts.slice(0, 3).map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center gap-3 rounded-xl theme-warning-soft p-3"
                        >

                          <AlertTriangle
                            size={18}
                            className="shrink-0 theme-warning"
                          />

                          <div className="min-w-0">

                            <p className="truncate text-sm font-medium theme-text-primary">
                              {product.name}
                            </p>

                            <p className="text-xs theme-warning">
                              Only {product.quantity} units left
                            </p>

                          </div>

                        </div>
                      ))}

                    </div>
                  )}

                </div>

              </div>

            </div>

          </>
        )}

        {statsError && !statsLoading && (
          <p role="alert" className="mt-4 rounded-lg border theme-danger-border theme-danger-soft px-4 py-3 text-sm theme-danger">
            {statsError}
          </p>
        )}

      </div>
    </Layout>
  );
};

export default Dashboard;