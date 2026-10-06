import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Button from "../components/common/Button";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Layout from "../components/layout/Layout";
import PageHeader from "../components/common/PageHeader";
import ProductImage from "../components/products/ProductImage";
import salesService from "../services/salesService";
import useAuth from "../hooks/useAuth";
import { hasPermission } from "../utils/permissions";

const money = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
}).format(Number(amount || 0));

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canViewSales = hasPermission(user, "sales.view");
  const canCancel = hasPermission(user, "sales.cancel");
  const canViewPayments = hasPermission(user, ["payments.history", "udhaar.payment-history"]);
  const canViewProductDetails = hasPermission(user, "products.details");
  const [sale, setSale] = useState(null);
  const [payments, setPayments] = useState([]);
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;
    salesService.getSale(id).then((data) => {
      if (!active) return;
      setSale(data.sale || data);
      setPayments(data.payments || []);
      setOrganizationName(data.organizationName || user?.organizationName || "");
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.message || "Unable to load this sale.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [id, user?.organizationName]);

  const cancelSale = async () => {
    try {
      setCancelling(true);
      await salesService.cancelSale(id);
      toast.success("Sale cancelled and stock restored.");
      setShowCancel(false);
      navigate("/sales");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to cancel sale.");
    } finally {
      setCancelling(false);
    }
  };

  return <Layout><div className="mx-auto max-w-7xl">
    <PageHeader title="Sale details" description="Items, payment and stock transaction details." action={<div className="flex items-center gap-4">{canViewSales && <Link className="text-sm font-medium theme-primary-text" to="/sales">← Sales history</Link>}{canCancel && sale?.status !== "cancelled" && sale?.paidCents === 0 && <Button variant="danger" onClick={() => setShowCancel(true)}>Cancel sale</Button>}</div>} />
    {loading ? <p className="p-5 theme-text-muted">Loading sale…</p> : error ? <div role="alert" className="rounded-xl border theme-danger-border theme-danger-soft p-4 text-sm theme-danger">{error}</div> : sale && <>
      <section className="mb-5 grid gap-3 sm:grid-cols-3">
        {[["Sale total", sale.totalCents / 100], ["Paid", sale.paidCents / 100], ["Status", sale.status === "cancelled" ? "Cancelled" : "Paid"]].map(([label, value]) => <div key={label} className="rounded-2xl border theme-border theme-surface p-4"><p className="text-xs theme-text-muted">{label}</p><p className="mt-1 text-lg font-semibold theme-text-primary">{label === "Status" ? value : money(value)}</p></div>)}
      </section>
      <section className="mb-5 rounded-2xl border theme-border theme-surface p-5">
        <h2 className="mb-3 font-semibold theme-text-primary">Transaction</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="theme-text-muted">Sale ID</dt><dd className="mt-1 theme-text-primary">#{sale._id}</dd></div>
          <div><dt className="theme-text-muted">Organization</dt><dd className="mt-1 theme-text-primary">{organizationName || "—"}</dd></div>
          <div><dt className="theme-text-muted">Payment method</dt><dd className="mt-1 capitalize theme-text-primary">{sale.paymentMethod || "cash"}</dd></div>
          <div><dt className="theme-text-muted">Sold by</dt><dd className="mt-1 theme-text-primary">{sale.createdBy?.name || "—"}</dd></div>
          <div><dt className="theme-text-muted">Date and time</dt><dd className="mt-1 theme-text-primary">{new Date(sale.createdAt).toLocaleString()}</dd></div>
        </dl>
      </section>
      <section className="overflow-hidden rounded-2xl border theme-border theme-surface">
        <h2 className="border-b theme-border-subtle px-5 py-4 font-semibold theme-text-primary">Items</h2>
        <div className="divide-y theme-border-subtle">{(sale.items || []).map((item, index) => {
          const productId = item.productId?._id || item.productId;
          return <div key={`${productId}-${index}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
            <span className="flex min-w-0 items-center gap-3">
              <ProductImage src={item.productImage} alt={item.productName} className="h-12 w-12 rounded-xl" />
              <span className="min-w-0">
                <span className="font-medium theme-text-primary">{canViewProductDetails && productId ? <Link className="hover:underline" to={`/products/${productId}`}>{item.productName || "Product"}</Link> : item.productName || "Product"} <span className="font-normal theme-text-muted">× {item.quantity}</span></span>
                <span className="mt-1 block text-xs theme-text-muted">{money(item.unitPriceCents / 100)} each</span>
              </span>
            </span>
            <span className="theme-text-secondary">{money(item.lineTotalCents / 100)}</span>
          </div>;
        })}</div>
        <div className="space-y-2 border-t theme-border-subtle px-5 py-4 text-sm">
          <p className="flex justify-between theme-text-secondary"><span>Subtotal</span><span>{money((sale.items || []).reduce((sum, item) => sum + item.lineTotalCents, 0) / 100)}</span></p>
          <p className="flex justify-between font-semibold theme-text-primary"><span>Total</span><span>{money(sale.totalCents / 100)}</span></p>
        </div>
      </section>
      {canViewPayments && <section className="mt-5 overflow-hidden rounded-2xl border theme-border theme-surface">
        <h2 className="border-b theme-border-subtle px-5 py-4 font-semibold theme-text-primary">Payment history</h2>
        {payments.length === 0 ? <p className="p-5 text-sm theme-text-muted">No payment entries found.</p> : <div className="divide-y theme-border-subtle">{payments.map((payment) => <div key={payment._id} className="flex flex-wrap justify-between gap-2 px-5 py-4 text-sm"><span className="capitalize theme-text-secondary">{new Date(payment.createdAt).toLocaleString()} · {payment.method}</span><strong className="theme-text-primary">{money(payment.amountCents / 100)}</strong></div>)}</div>}
      </section>}
    </>}
  </div>
    <ConfirmDialog
      isOpen={showCancel}
      onClose={() => !cancelling && setShowCancel(false)}
      onConfirm={cancelSale}
      title="Cancel this sale?"
      message="This keeps the sale history, restores stock, and creates a linked stock-in entry."
      confirmText="Cancel sale"
      loading={cancelling}
      loadingText="Cancelling…"
    />
  </Layout>;
};

export default SaleDetails;
