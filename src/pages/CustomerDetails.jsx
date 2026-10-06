import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/layout/Layout";
import Button from "../components/common/Button";
import ConfirmDialog from "../components/common/ConfirmDialog";
import ErrorState from "../components/common/ErrorState";
import Modal from "../components/common/Modal";
import PageHeader from "../components/common/PageHeader";
import SortableHeader from "../components/common/SortableHeader";
import ProductImage from "../components/products/ProductImage";
import udhaarService from "../services/udhaarService";
import useAuth from "../hooks/useAuth";
import { hasPermission } from "../utils/permissions";
import { isValidCustomerPhone } from "../utils/validators";

const money = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(amount || 0));
const fieldClass = "mt-1 w-full rounded-xl border theme-border theme-surface px-3 py-2.5 text-sm theme-text-primary";

const CustomerDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canViewCustomers = hasPermission(user, "customers.view");
  const canViewUdhaar = hasPermission(user, "udhaar.view");
  const canRecordPayment = hasPermission(user, ["payments.create", "udhaar.record-payment"]);
  const canEditCustomer = hasPermission(user, ["customers.update", "customers.edit"]);
  const canDeleteCustomer = hasPermission(user, "customers.delete");
  const canViewPayments = hasPermission(user, ["payments.history", "udhaar.payment-history"]);
  const canViewProductDetails = hasPermission(user, "products.details");
  const [ledger, setLedger] = useState(null);
  const [udhaarPagination, setUdhaarPagination] = useState(null);
  const [paymentsPagination, setPaymentsPagination] = useState(null);
  const [ledgerPagination, setLedgerPagination] = useState(null);
  const [udhaarPage, setUdhaarPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [udhaarSort, setUdhaarSort] = useState({ sortBy: "createdAt", sortOrder: "desc" });
  const [paymentsSort, setPaymentsSort] = useState({ sortBy: "createdAt", sortOrder: "desc" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: "", phone: "" });
  const [deleteOpen, setDeleteOpen] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await udhaarService.getLedger(id, {
        udhaarPage, udhaarLimit: 10, paymentsPage, paymentsLimit: 10,
        ledgerPage, ledgerLimit: 20,
        udhaarSortBy: udhaarSort.sortBy, udhaarSortOrder: udhaarSort.sortOrder,
        paymentsSortBy: paymentsSort.sortBy, paymentsSortOrder: paymentsSort.sortOrder
      });
      setLedger(data);
      setUdhaarPagination(data.udhaarPagination || null);
      setPaymentsPagination(data.paymentsPagination || null);
      setLedgerPagination(data.ledgerPagination || null);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load customer ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    udhaarService.getLedger(id, {
      udhaarPage, udhaarLimit: 10, paymentsPage, paymentsLimit: 10,
      ledgerPage, ledgerLimit: 20,
      udhaarSortBy: udhaarSort.sortBy, udhaarSortOrder: udhaarSort.sortOrder,
      paymentsSortBy: paymentsSort.sortBy, paymentsSortOrder: paymentsSort.sortOrder
    }).then((data) => {
      if (!active) return;
      setLedger(data);
      setUdhaarPagination(data.udhaarPagination || null);
      setPaymentsPagination(data.paymentsPagination || null);
      setLedgerPagination(data.ledgerPagination || null);
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.message || "Unable to load customer ledger.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, udhaarPage, paymentsPage, ledgerPage, udhaarSort, paymentsSort]);

  useEffect(() => {
    if (loading || !location.hash) return;
    document.querySelector(location.hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [loading, location.hash]);

  const recordPayment = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await udhaarService.recordPayment(id, { amount: Number(amount), method });
      toast.success("Payment recorded and allocated to outstanding Udhaar.");
      setPaymentOpen(false);
      setAmount("");
      await refresh();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to record payment.");
    } finally {
      setSaving(false);
    }
  };

  const saveCustomer = async (event) => {
    event.preventDefault();
    if (!isValidCustomerPhone(customerForm.phone)) {
      toast.error("Phone number must contain exactly 10 digits (0-9).");
      return;
    }
    try {
      setSaving(true);
      const response = await udhaarService.updateCustomer(id, customerForm);
      setLedger((current) => ({ ...current, customer: response.customer }));
      toast.success("Customer updated.");
      setEditOpen(false);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to update customer.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomer = async () => {
    try {
      setSaving(true);
      const result = await udhaarService.deleteCustomer(id);
      toast.success(result.message || "Customer archived.");
      navigate("/customers");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to archive customer.");
    } finally {
      setSaving(false);
      setDeleteOpen(false);
    }
  };

  const customer = ledger?.customer;
  const summary = ledger?.summary || {};
  const records = ledger?.udhaar || [];
  const payments = ledger?.payments || [];
  const ledgerEntries = ledger?.ledger || [];

  return <Layout><div className="mx-auto max-w-6xl">
    <PageHeader title={customer?.name || "Customer ledger"} description={`Udhaar history for ${ledger?.organizationName || user?.organizationName || "your organization"}.`} action={canViewCustomers ? <Link className="text-sm font-medium theme-primary-text" to="/customers">← Customers</Link> : canViewUdhaar ? <Link className="text-sm font-medium theme-primary-text" to="/udhaar">← Udhaar Khata</Link> : null} />
    {loading ? <p className="p-5 theme-text-muted">Loading customer ledger…</p> : error ? <ErrorState title="Unable to load customer ledger" message={error} onRetry={refresh} /> : <>
      <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[["Customer", customer?.name || "—"], ["Phone", customer?.phone || "—"], ["Total Udhaar", summary.totalUdhaar], ["Total Paid", summary.totalPaid], ["Pending Amount", summary.pending], ["Active Udhaar Count", summary.activeUdhaarCount || 0], ["Last Transaction", summary.lastTransactionAt ? new Date(summary.lastTransactionAt).toLocaleDateString() : "—"], ["Current Status", summary.status || "pending"]].map(([label, value]) => <div key={label} className="rounded-2xl border theme-border theme-surface p-4"><p className="text-xs theme-text-muted">{label}</p><p className={`mt-1 text-xl font-semibold capitalize ${label === "Pending Amount" && Number(value) > 0 ? "theme-danger" : "theme-text-primary"}`}>{["Customer", "Phone", "Last Transaction", "Current Status"].includes(label) || label === "Active Udhaar Count" ? value : money(value)}</p></div>)}
      </section>
      <section className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border theme-border theme-surface p-5">
        <div><h2 className="font-semibold theme-text-primary">Customer information</h2><p className="mt-1 text-sm theme-text-muted">Name: {customer?.name}</p><p className="mt-1 text-sm theme-text-muted">Phone: {customer?.phone || "—"}</p><p className="mt-1 text-sm theme-text-muted">Last transaction: {summary.lastTransactionAt ? new Date(summary.lastTransactionAt).toLocaleDateString() : "—"}</p></div>
        <div className="flex gap-2">
          {canEditCustomer && <Button variant="outline" onClick={() => { setCustomerForm({ name: customer?.name || "", phone: customer?.phone || "" }); setEditOpen(true); }}>Edit customer</Button>}
          {canRecordPayment && Number(summary.pending) > 0 && <Button onClick={() => setPaymentOpen(true)}>Receive payment</Button>}
          {canViewUdhaar && <Link className="rounded-xl border theme-border px-3 py-2 text-sm theme-primary-text" to="/udhaar">View Udhaar</Link>}
          {canViewPayments && <a className="rounded-xl border theme-border px-3 py-2 text-sm theme-primary-text" href="#payment-history">Payment history</a>}
          {canDeleteCustomer && <Button variant="outline" onClick={() => setDeleteOpen(true)}><Trash2 size={16} /> Archive</Button>}
        </div>
      </section>
      <section id="udhaar-history" className="mb-5 scroll-mt-24 overflow-hidden rounded-2xl border theme-border theme-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b theme-border-subtle px-5 py-4">
          <h2 className="font-semibold theme-text-primary">Udhaar history</h2>
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium theme-text-muted" aria-label="Sort Udhaar history">
            {[
              ["createdAt", "Date"],
              ["totalCents", "Total"],
              ["paidCents", "Paid"],
              ["pendingCents", "Pending"],
              ["status", "Status"]
            ].map(([field, label]) => <SortableHeader
              key={field}
              field={field}
              sortBy={udhaarSort.sortBy}
              sortOrder={udhaarSort.sortOrder}
              onSort={(sortBy, sortOrder) => {
                setUdhaarPage(1);
                setLoading(true);
                setUdhaarSort({ sortBy, sortOrder });
              }}
            >{label}</SortableHeader>)}
          </div>
        </div>
        {records.length === 0 ? <p className="p-5 text-sm theme-text-muted">No Udhaar records for this customer.</p> : <div className="divide-y theme-border-subtle">{records.map((record) => <div key={record._id} className="px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div><span className="font-medium theme-text-primary">Udhaar #{String(record._id).slice(-8)}</span><p className="mt-1 text-xs theme-text-muted">{new Date(record.createdAt).toLocaleString()} · <span className="capitalize">{record.paymentStatus}</span></p></div>
            <div className="flex flex-wrap gap-4 theme-text-secondary"><span>Total {money(record.totalCents / 100)}</span><span>Paid {money(record.paidCents / 100)}</span><strong className="theme-danger">Remaining {money((record.totalCents - record.paidCents) / 100)}</strong></div>
          </div>
          {record.items?.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{record.items.map((item, index) => <span key={`${item.productId}-${index}`} className="inline-flex items-center gap-2 rounded-xl border theme-border theme-surface-secondary p-2 text-xs theme-text-secondary">
            <ProductImage src={item.productImage} alt={item.productName} className="h-8 w-8 rounded-lg" />
            <span>{canViewProductDetails ? <Link to={`/products/${item.productId}`} className="theme-primary-text hover:underline">{item.productName}</Link> : item.productName} × {item.quantity}</span>
          </span>)}</div>}
        </div>)}</div>}
        {udhaarPagination?.totalPages > 1 && <div className="flex items-center justify-between border-t theme-border-subtle px-4 py-3 text-sm"><span className="theme-text-muted">Udhaar page {udhaarPagination.page} of {udhaarPagination.totalPages}</span><div className="flex gap-2"><Button variant="outline" disabled={udhaarPage <= 1} onClick={() => setUdhaarPage((current) => current - 1)}>Previous</Button><Button variant="outline" disabled={udhaarPage >= udhaarPagination.totalPages} onClick={() => setUdhaarPage((current) => current + 1)}>Next</Button></div></div>}
      </section>
      {canViewPayments && <section id="payment-history" className="scroll-mt-24 overflow-hidden rounded-2xl border theme-border theme-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b theme-border-subtle px-5 py-4">
          <h2 className="font-semibold theme-text-primary">Payment history</h2>
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium theme-text-muted" aria-label="Sort payment history">
            {[
              ["createdAt", "Date"],
              ["amountCents", "Amount"],
              ["method", "Method"],
              ["createdBy", "Recorded by"]
            ].map(([field, label]) => <SortableHeader
              key={field}
              field={field}
              sortBy={paymentsSort.sortBy}
              sortOrder={paymentsSort.sortOrder}
              onSort={(sortBy, sortOrder) => {
                setPaymentsPage(1);
                setLoading(true);
                setPaymentsSort({ sortBy, sortOrder });
              }}
            >{label}</SortableHeader>)}
          </div>
        </div>
        {payments.length === 0 ? <p className="p-5 text-sm theme-text-muted">No payments recorded yet.</p> : <div className="divide-y theme-border-subtle">{payments.map((payment) => <div key={payment._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm"><div><p className="font-medium theme-text-primary">{new Date(payment.createdAt).toLocaleString()} · <span className="capitalize">{payment.method}</span></p><p className="mt-1 text-xs theme-text-muted">Recorded by {payment.createdBy?.name || "—"} · Udhaar #{String(payment.udhaarId).slice(-8)}</p></div><strong className="theme-text-primary">{money(payment.amountCents / 100)}</strong></div>)}</div>}
        {paymentsPagination?.totalPages > 1 && <div className="flex items-center justify-between border-t theme-border-subtle px-4 py-3 text-sm"><span className="theme-text-muted">Payments page {paymentsPagination.page} of {paymentsPagination.totalPages}</span><div className="flex gap-2"><Button variant="outline" disabled={paymentsPage <= 1} onClick={() => setPaymentsPage((current) => current - 1)}>Previous</Button><Button variant="outline" disabled={paymentsPage >= paymentsPagination.totalPages} onClick={() => setPaymentsPage((current) => current + 1)}>Next</Button></div></div>}
      </section>}
      <section id="customer-ledger" className="mt-5 scroll-mt-24 overflow-hidden rounded-2xl border theme-border theme-surface">
        <h2 className="border-b theme-border-subtle px-5 py-4 font-semibold theme-text-primary">Customer ledger</h2>
        {ledgerEntries.length === 0 ? <p className="p-5 text-sm theme-text-muted">No ledger entries yet.</p> : <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="theme-surface-secondary theme-text-muted"><tr>{["Date", "Transaction type", "Udhaar amount", "Payment amount", "Balance / pending", "Recorded by"].map((label) => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead>
            <tbody className="divide-y theme-border-subtle">{ledgerEntries.map((entry) => <tr key={`${entry.type}-${entry._id}`}>
              <td className="px-4 py-3 theme-text-secondary">{new Date(entry.createdAt).toLocaleString()}</td>
              <td className="px-4 py-3 capitalize theme-text-primary">{entry.type}{entry.status === "cancelled" ? " (cancelled)" : ""}</td>
              <td className="px-4 py-3 theme-text-secondary">{money(entry.udhaarAmountCents / 100)}</td>
              <td className="px-4 py-3 theme-text-secondary">{money(entry.paymentAmountCents / 100)}</td>
              <td className="px-4 py-3 font-medium theme-danger">{money(entry.balanceCents / 100)}</td>
              <td className="px-4 py-3 theme-text-secondary">{entry.recordedBy?.name || "—"}</td>
            </tr>)}</tbody>
          </table>
        </div>}
        {ledgerPagination?.totalPages > 1 && <div className="flex items-center justify-between border-t theme-border-subtle px-4 py-3 text-sm"><span className="theme-text-muted">Ledger page {ledgerPagination.page} of {ledgerPagination.totalPages}</span><div className="flex gap-2"><Button variant="outline" disabled={ledgerPage <= 1} onClick={() => setLedgerPage((current) => current - 1)}>Previous</Button><Button variant="outline" disabled={ledgerPage >= ledgerPagination.totalPages} onClick={() => setLedgerPage((current) => current + 1)}>Next</Button></div></div>}
      </section>
    </>}
  </div>
    <Modal isOpen={editOpen} onClose={() => !saving && setEditOpen(false)} title="Edit customer" size="sm">
      <form onSubmit={saveCustomer} className="space-y-4">
        <label className="block text-sm font-medium theme-text-secondary">Name<input required maxLength="120" className={fieldClass} value={customerForm.name} onChange={(event) => setCustomerForm({ ...customerForm, name: event.target.value })} /></label>
        <label className="block text-sm font-medium theme-text-secondary">Phone<input required type="tel" inputMode="numeric" pattern="[0-9]{10}" minLength={10} maxLength={10} title="Enter exactly 10 digits (0-9), with no spaces or symbols." autoComplete="tel" className={fieldClass} value={customerForm.phone} onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value })} /></label>
        <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button type="submit" loading={saving}>Save </Button></div>
      </form>
    </Modal>
    <Modal isOpen={paymentOpen} onClose={() => !saving && setPaymentOpen(false)} title="Record customer payment" size="sm">
      <form onSubmit={recordPayment} className="space-y-4">
        <p className="text-sm theme-text-secondary">Outstanding balance: <strong>{money(summary.pending)}</strong></p>
        <label className="block text-sm font-medium theme-text-secondary">Payment amount<input autoFocus required type="number" min="0.01" max={summary.pending} step="0.01" className={fieldClass} value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
        <label className="block text-sm font-medium theme-text-secondary">Payment method<select className={fieldClass} value={method} onChange={(event) => setMethod(event.target.value)}><option value="cash">Cash</option><option value="online">Online</option><option value="other">Other</option></select></label>
        <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button><Button type="submit" loading={saving}>Receive payment</Button></div>
      </form>
    </Modal>
    <ConfirmDialog
      isOpen={deleteOpen}
      onClose={() => !saving && setDeleteOpen(false)}
      onConfirm={deleteCustomer}
      loading={saving}
      title="Archive customer?"
      message={`Archive ${customer?.name || "this customer"} from the active customer list? Udhaar and payment history will be retained. Customers with outstanding balances cannot be archived.`}
      confirmText="Archive customer"
    />
  </Layout>;
};

export default CustomerDetails;
