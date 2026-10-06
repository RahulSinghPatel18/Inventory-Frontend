import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { hasPermission } from "../../utils/permissions";
import ProductImage from "../products/ProductImage";

const money = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
}).format(Number(amount || 0));

const TrendList = ({ title, rows, valueKey, emptyMessage }) => {
  const highest = Math.max(1, ...rows.map((row) => Number(row[valueKey] || 0)));
  return <section className="rounded-2xl border theme-border theme-surface p-5">
    <h3 className="font-semibold theme-text-primary">{title}</h3>
    {rows.length ? <div className="mt-4 space-y-3">{rows.slice(-8).map((row, index) => {
      const value = Number(row[valueKey] || 0);
      return <div key={row.date || row._id || index} className="grid grid-cols-[5rem_1fr_auto] items-center gap-3 text-xs">
        <span className="truncate theme-text-muted">{row.date ? new Date(`${row.date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Recent"}</span>
        <span className="h-2 overflow-hidden rounded-full theme-surface-secondary"><span className="block h-full rounded-full theme-primary-bg" style={{ width: `${Math.max(value > 0 ? 3 : 0, value / highest * 100)}%` }} /></span>
        <strong className="theme-text-secondary">{money(value)}</strong>
      </div>;
    })}</div> : <p className="mt-3 text-sm theme-text-muted">{emptyMessage}</p>}
  </section>;
};

const SalesDashboard = ({ sales, udhaar, loading, error }) => {
  const { user } = useAuth();
  const canViewSalesAnalytics = hasPermission(user, ["sales.statistics", "analytics.sales"]);
  const canViewUdhaarAnalytics = hasPermission(user, ["udhaar.statistics", "analytics.udhaar"]);
  const canViewSales = hasPermission(user, "sales.view");
  const canViewUdhaar = hasPermission(user, "udhaar.view");
  const canViewLedger = hasPermission(user, "customers.ledger");
  const canViewPayments = hasPermission(user, ["payments.history", "udhaar.payment-history"]);
  const canViewProductDetails = hasPermission(user, "products.details");
  if (!canViewSalesAnalytics && !canViewUdhaarAnalytics) return null;
  if (loading) return <section className="mt-6 rounded-2xl border theme-border theme-surface p-5 text-sm theme-text-muted">Loading sales and Udhaar statistics…</section>;
  const topProducts = sales?.productLeaders || [];
  const outstanding = udhaar?.outstandingCustomers || [];
  const recentUdhaar = udhaar?.recentUdhaar || [];

  return <section className="mt-5 space-y-5">
    <div>
      <h2 className="text-lg font-semibold theme-text-primary">Business performance</h2>
      <p className="mt-1 text-sm theme-text-muted">Sales and customer credit are tracked separately.</p>
    </div>
    {error && <div role="alert" className="rounded-xl border theme-danger-border theme-danger-soft p-4 text-sm theme-danger">{error}</div>}
    <div className="grid gap-5 lg:grid-cols-2">
      {canViewSalesAnalytics && <TrendList title="Sales overview · last 30 days" rows={sales?.salesTrend || []} valueKey="sales" emptyMessage={sales ? "Sales trend will appear after sales are recorded." : "Sales trend is unavailable."} />}
      {canViewUdhaarAnalytics && <TrendList title="Udhaar & collection trend · last 30 days" rows={udhaar?.udhaarTrend || []} valueKey="udhaar" emptyMessage={udhaar ? "Udhaar trend will appear after records are created." : "Udhaar trend is unavailable."} />}
      {canViewSalesAnalytics && <section className="rounded-2xl border theme-border theme-surface p-5">
        <div className="flex items-center justify-between"><h3 className="font-semibold theme-text-primary">Best-selling products</h3>{canViewSales && <Link className="text-sm theme-primary-text" to="/sales">Sales</Link>}</div>
        {topProducts.length ? <div className="mt-3 divide-y theme-border-subtle">{topProducts.slice(0, 5).map((product) => <div key={product.productId} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="flex min-w-0 items-center gap-3"><ProductImage src={product.image} alt={product.name} className="h-10 w-10 rounded-lg" />{canViewProductDetails ? <Link to={`/products/${product.productId}`} className="truncate font-medium theme-text-primary hover:underline">{product.name}</Link> : <span className="truncate font-medium theme-text-primary">{product.name}</span>}</span><span className="shrink-0 theme-text-muted">{product.quantity} sold · {money(product.revenue)}</span></div>)}</div> : <p className="mt-3 text-sm theme-text-muted">Product sales will appear here.</p>}
      </section>}
      {canViewUdhaarAnalytics && canViewPayments && <section className="rounded-2xl border theme-border theme-surface p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold theme-text-primary">Recent payments</h3>
          {canViewUdhaar && <Link className="text-sm theme-primary-text" to="/udhaar">Udhaar Khata</Link>}
        </div>
        {udhaar?.recentPayments?.length ? <div className="mt-3 divide-y theme-border-subtle">{udhaar.recentPayments.map((payment) => (
          <div key={payment._id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <div>
              <p className="font-medium theme-text-primary">{payment.customerId?.name || "Customer"}</p>
              <p className="mt-1 text-xs theme-text-muted">{new Date(payment.createdAt).toLocaleString()} · <span className="capitalize">{payment.method}</span> · Recorded by {payment.createdBy?.name || "—"}</p>
            </div>
            <strong className="theme-success">{money(payment.amountCents / 100)}</strong>
          </div>
        ))}</div> : <p className="mt-3 text-sm theme-text-muted">No recent payments recorded.</p>}
      </section>}
      {canViewSalesAnalytics && <section className="rounded-2xl border theme-border theme-surface p-5">
        <h3 className="font-semibold theme-text-primary">Sales by payment method</h3>
        {sales?.paymentMethods?.length ? <div className="mt-3 divide-y theme-border-subtle">{sales.paymentMethods.map((method) => <div key={method.method} className="flex justify-between gap-3 py-3 text-sm"><span className="capitalize theme-text-secondary">{method.method}</span><span className="font-medium theme-text-primary">{money(method.sales)} · {method.saleCount} sales</span></div>)}</div> : <p className="mt-3 text-sm theme-text-muted">Payment method totals will appear after sales.</p>}
      </section>}
      {canViewUdhaarAnalytics && <section className="rounded-2xl border theme-border theme-surface p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold theme-text-primary">Recent Udhaar</h3>
          {canViewUdhaar && <Link className="inline-flex items-center gap-1 text-sm theme-primary-text hover:underline" to="/udhaar">View all <ArrowRight size={14} /></Link>}
        </div>
        {recentUdhaar.length ? <div className="mt-3 divide-y theme-border-subtle">{recentUdhaar.slice(0, 5).map((record) => {
          const pending = record.totalCents - record.paidCents;
          return <div key={record._id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <div>
              <p className="font-medium theme-text-primary">{record.customerId?.name || "Customer"}</p>
              <p className="mt-1 text-xs theme-text-muted">{new Date(record.createdAt).toLocaleDateString()} · {money(record.totalCents / 100)} total</p>
            </div>
            <strong className={pending > 0 ? "theme-danger" : "theme-success"}>{money(pending / 100)} pending</strong>
          </div>;
        })}</div> : <p className="mt-3 text-sm theme-text-muted">{udhaar ? "No recent Udhaar records." : "Recent Udhaar is unavailable."}</p>}
      </section>}
      {canViewUdhaarAnalytics && <section className="rounded-2xl border theme-border theme-surface p-5">
        <div className="flex items-center justify-between"><h3 className="font-semibold theme-text-primary">Outstanding customers</h3>{canViewUdhaar && <Link className="text-sm theme-primary-text" to="/udhaar">Udhaar Khata</Link>}</div>
        {outstanding.length ? <div className="mt-3 divide-y theme-border-subtle">{outstanding.slice(0, 5).map((customer) => canViewLedger ? <Link key={customer.customerId} to={`/customers/${customer.customerId}`} className="flex justify-between gap-3 py-3 text-sm"><span className="truncate font-medium theme-primary-text">{customer.name}</span><strong className="shrink-0 theme-danger">{money(customer.outstanding)}</strong></Link> : <div key={customer.customerId} className="flex justify-between gap-3 py-3 text-sm"><span className="truncate font-medium theme-text-primary">{customer.name}</span><strong className="shrink-0 theme-danger">{money(customer.outstanding)}</strong></div>)}</div> : <p className="mt-3 text-sm theme-text-muted">No outstanding customer balances.</p>}
      </section>}
    </div>
  </section>;
};

export default SalesDashboard;
