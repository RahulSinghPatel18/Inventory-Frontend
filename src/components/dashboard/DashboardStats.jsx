import { Link } from "react-router-dom";
import {
  CalendarDays,
  CircleX,
  IndianRupee,
  ShoppingCart,
  WalletCards
} from "lucide-react";

const money = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`;

const DashboardStats = ({
  inventory,
  sales,
  udhaar,
  outOfStock,
  canViewSales,
  canViewUdhaar,
  canViewProducts,
  canViewStock
}) => {
  const cards = [
    { label: "Total Sales", value: sales ? money(sales.totals?.totalSales) : "—", icon: ShoppingCart, to: canViewSales ? "/sales" : null, tone: "theme-primary-soft theme-primary-text" },
    { label: "Today's Sales", value: sales ? money(sales.today?.totalSales) : "—", icon: CalendarDays, to: canViewSales ? "/sales" : null, tone: "theme-info-soft theme-info" },
    { label: "Pending Udhaar", value: udhaar ? money(udhaar.totals?.pending) : "—", icon: WalletCards, to: canViewUdhaar ? "/udhaar" : null, tone: "theme-warning-soft theme-warning" },
    { label: "Inventory Value", value: inventory ? money(inventory.totalInventoryValue) : "—", icon: IndianRupee, to: canViewProducts ? "/products" : null, tone: "theme-success-soft theme-success" },
    { label: "Out of Stock", value: outOfStock ? Number(outOfStock.totalProducts || 0).toLocaleString("en-IN") : "—", icon: CircleX, to: canViewStock ? "/stock" : null, tone: "theme-danger-soft theme-danger" }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map(({ label, value, icon: Icon, to, tone }) => (
        to ? <Link key={label} to={to} className="group rounded-2xl border theme-border theme-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium theme-text-muted">{label}</p>
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
              <Icon size={20} />
            </span>
          </div>
          <p className="mt-3 break-words text-2xl font-bold tracking-tight theme-text-primary">{value}</p>
        </Link> : <div key={label} aria-label={`${label}: unavailable`} className="rounded-2xl border theme-border theme-surface p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium theme-text-muted">{label}</p>
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
              <Icon size={20} />
            </span>
          </div>
          <p className="mt-3 break-words text-2xl font-bold tracking-tight theme-text-primary">{value}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
