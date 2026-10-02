import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Boxes,
  CircleX,
  IndianRupee,
  Package
} from "lucide-react";

const DashboardStats = ({ stats }) => {
  const cards = [
    { label: "Total Products", value: stats.totalProducts, icon: Package, to: "/products", tone: "theme-primary-soft theme-primary-text" },
    { label: "Total Stock", value: stats.totalStock, icon: Boxes, to: "/stock", tone: "theme-info-soft theme-info" },
    { label: "Inventory Value", value: `₹${stats.totalInventoryValue.toLocaleString("en-IN")}`, icon: IndianRupee, to: "/products", tone: "theme-primary-soft theme-primary-text" },
    { label: "Low Stock", value: stats.lowStockProducts, icon: AlertTriangle, to: "/stock", tone: "theme-warning-soft theme-warning" },
    { label: "Out of Stock", value: stats.outOfStockProducts, icon: CircleX, to: "/stock", tone: "theme-danger-soft theme-danger" }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map(({ label, value, icon: Icon, to, tone }) => (
        <Link key={label} to={to} className="group rounded-2xl border theme-border theme-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium theme-text-muted">{label}</p>
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
              <Icon size={20} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight theme-text-primary">{value}</p>
        </Link>
      ))}
    </div>
  );
};

export default DashboardStats;
