import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import salesService from "../../services/salesService";
import useAuth from "../../hooks/useAuth";
import { hasPermission } from "../../utils/permissions";
import ProductImage from "../products/ProductImage";

const money = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
}).format(Number(amount || 0));

const RecentSales = () => {
  const { user } = useAuth();
  const canViewSales = hasPermission(user, "sales.view");
  const canViewDetails = hasPermission(user, "sales.details");
  const canViewProductDetails = hasPermission(user, "products.details");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(canViewSales);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!canViewSales) return undefined;
    let active = true;
    salesService.getSales({ page: 1, limit: 5 }).then((data) => {
      if (active) setSales(data.sales || []);
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.message || "Unable to load recent sales.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [canViewSales]);

  if (!canViewSales) return null;
  return <section className="mt-5 overflow-hidden rounded-2xl border theme-border theme-surface">
    <div className="flex items-center justify-between border-b theme-border-subtle px-5 py-4">
      <h2 className="font-semibold theme-text-primary">Recent sales</h2>
      <Link className="text-sm font-medium theme-primary-text" to="/sales">All sales</Link>
    </div>
    {loading ? <p className="p-5 text-sm theme-text-muted">Loading recent sales…</p> : error ? <p role="alert" className="p-5 text-sm theme-danger">{error}</p> : sales.length === 0 ? <p className="p-5 text-sm theme-text-muted">No sales recorded yet.</p> : <div className="divide-y theme-border-subtle">
      {sales.map((sale) => <div key={sale._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
        <div className="flex min-w-0 items-center gap-3">
          <ProductImage src={sale.items?.[0]?.productImage} alt={sale.items?.[0]?.productName} className="h-11 w-11 rounded-lg" />
          <div className="min-w-0">
            {canViewProductDetails && sale.items?.[0]?.productId
              ? <Link className="font-medium theme-primary-text hover:underline" to={`/products/${sale.items[0].productId}`}>{sale.items[0].productName || "Product"}{sale.items.length > 1 ? ` +${sale.items.length - 1} more` : ""}</Link>
              : <span className="font-medium theme-text-primary">{sale.items?.[0]?.productName || "Product"}{sale.items?.length > 1 ? ` +${sale.items.length - 1} more` : ""}</span>}
            {canViewDetails && <Link className="ml-2 text-xs font-medium theme-text-muted hover:underline" to={`/sales/${sale._id}`}>Sale details</Link>}
            <p className="mt-1 text-xs theme-text-muted">{new Date(sale.createdAt).toLocaleString()} · {sale.createdBy?.name || "—"}</p>
          </div>
        </div>
        <div className="flex gap-4 theme-text-secondary">
          <span>{(sale.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)} items</span>
          <span className="capitalize">{sale.paymentMethod || "cash"}</span>
          <strong className="theme-text-primary">{money(sale.totalCents / 100)}</strong>
        </div>
      </div>)}
    </div>}
  </section>;
};

export default RecentSales;
