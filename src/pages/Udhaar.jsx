import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Banknote,
  IndianRupee,
  ClipboardList,
  HandCoins,
  Pencil,
  Trash2,
  UserRoundCheck,
  UsersRound
} from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/layout/Layout";
import Button from "../components/common/Button";
import BusinessStats from "../components/common/BusinessStats";
import Pagination from "../components/common/Pagination";
import SortableHeader from "../components/common/SortableHeader";
import ProductImage from "../components/products/ProductImage";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Modal from "../components/common/Modal";
import PageHeader from "../components/common/PageHeader";
import productService from "../services/productService";
import udhaarService from "../services/udhaarService";
import useAuth from "../hooks/useAuth";
import { hasPermission } from "../utils/permissions";
import { isValidCustomerPhone } from "../utils/validators";

const money = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(amount || 0));
const fieldClass = "mt-1 w-full rounded-xl border theme-border theme-surface px-3 py-2.5 text-sm theme-text-primary";
const emptyItem = () => ({ productId: "", quantity: "1", unitPrice: "" });
const loadCustomerOptions = (search = "") => udhaarService.getCustomers({ page: 1, limit: 100, search });

const Udhaar = () => {
  const location = useLocation();
  const customerNameInputRef = useRef(null);
  const editCustomerNameInputRef = useRef(null);
  const editUdhaarAmountInputRef = useRef(null);
  const customerSearchInputRef = useRef(null);
  const { user } = useAuth();
  const canCreateUdhaar = hasPermission(user, "udhaar.create");
  const canViewUdhaar = hasPermission(user, "udhaar.view");
  const canViewCustomers = hasPermission(user, ["customers.view", "udhaar.view"]);
  const canOpenCustomerDirectory = hasPermission(user, ["customers.view", "customers.create", "customers.statistics"]);
  const canCreateCustomer = hasPermission(user, "customers.create");
  const canEditCustomer = hasPermission(user, ["customers.update", "customers.edit"]);
  const canDeleteCustomer = hasPermission(user, "customers.delete");
  const canEditUdhaar = hasPermission(user, ["udhaar.update", "udhaar.edit"]);
  const canViewLedger = hasPermission(user, "customers.ledger");
  const canViewDetails = hasPermission(user, "udhaar.details");
  const canViewPayments = hasPermission(user, ["payments.history", "udhaar.payment-history"]);
  const canCancel = hasPermission(user, "udhaar.cancel");
  const canViewStats = hasPermission(user, ["udhaar.statistics", "analytics.udhaar"]);
  const canViewProductDetails = hasPermission(user, "products.details");
  const [records, setRecords] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerPickerSearch, setCustomerPickerSearch] = useState("");
  const [debouncedCustomerPickerSearch, setDebouncedCustomerPickerSearch] = useState("");
  const [loadedCustomerPickerSearch, setLoadedCustomerPickerSearch] = useState(null);
  const customerPickerLoading = loadedCustomerPickerSearch !== debouncedCustomerPickerSearch;
  const [customerSearch, setCustomerSearch] = useState("");
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState("");
  const [customerDirectory, setCustomerDirectory] = useState([]);
  const [customerPagination, setCustomerPagination] = useState(null);
  const [customerPage, setCustomerPage] = useState(1);
  const [customerSortBy, setCustomerSortBy] = useState("name");
  const [customerSortOrder, setCustomerSortOrder] = useState("asc");
  const [customerStatus, setCustomerStatus] = useState("");
  const [customerDirectoryLoading, setCustomerDirectoryLoading] = useState(true);
  const [customerRefreshKey, setCustomerRefreshKey] = useState(0);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [customerError, setCustomerError] = useState("");
  const [error, setError] = useState("");
  const [showUdhaarForm, setShowUdhaarForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [resumeUdhaarAfterCustomer, setResumeUdhaarAfterCustomer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: "", phone: "" });
  const [editCustomerTarget, setEditCustomerTarget] = useState(null);
  const [editCustomerForm, setEditCustomerForm] = useState({ name: "", phone: "" });
  const [editUdhaarTarget, setEditUdhaarTarget] = useState(null);
  const [editUdhaarAmount, setEditUdhaarAmount] = useState("");
  const [form, setForm] = useState({
    customerId: "", totalAmount: "", paidAmount: "0", paymentMethod: "cash", items: []
  });
  const [cancelTarget, setCancelTarget] = useState(null);
  const [deleteCustomerTarget, setDeleteCustomerTarget] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    if (!showCustomerForm) return undefined;
    const frame = window.requestAnimationFrame(() => customerNameInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [showCustomerForm]);

  useEffect(() => {
    if (!editCustomerTarget) return undefined;
    const frame = window.requestAnimationFrame(() => {
      editCustomerNameInputRef.current?.focus();
      editCustomerNameInputRef.current?.select();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [editCustomerTarget]);

  useEffect(() => {
    if (!editUdhaarTarget) return undefined;
    const frame = window.requestAnimationFrame(() => {
      editUdhaarAmountInputRef.current?.focus();
      editUdhaarAmountInputRef.current?.select();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [editUdhaarTarget]);

  useEffect(() => {
    if (!showUdhaarForm || showCustomerForm) return undefined;
    const frame = window.requestAnimationFrame(() => {
      customerSearchInputRef.current?.focus();
      customerSearchInputRef.current?.select();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [showUdhaarForm, showCustomerForm]);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const [list, productData, statsData] = await Promise.all([
        canViewUdhaar
          ? udhaarService.getUdhaar({ page, limit: 10, sortBy, sortOrder })
          : Promise.resolve({ udhaar: [], totalPages: 1 }),
        canCreateUdhaar
          ? productService.getProducts({ page: 1, limit: 100 })
          : Promise.resolve({ products: [] }),
        canViewStats ? udhaarService.getStats() : Promise.resolve(null)
      ]);
      setRecords(list.udhaar || []);
      setPages(list.totalPages || 1);
      setProducts(productData.products || []);
      setStats(statsData);
      setCustomerRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load Udhaar Khata.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canViewUdhaar) return undefined;
    let active = true;
    udhaarService.getUdhaar({ page, limit: 10, sortBy, sortOrder })
      .then((list) => {
        if (!active) return;
        setRecords(list.udhaar || []);
        setPages(list.totalPages || 1);
        setError("");
      }).catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Unable to load Udhaar Khata.");
      }).finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [page, sortBy, sortOrder, canViewUdhaar]);

  useEffect(() => {
    let active = true;
    Promise.all([
      canCreateUdhaar
        ? productService.getProducts({ page: 1, limit: 100 })
        : Promise.resolve({ products: [] }),
      canViewStats ? udhaarService.getStats() : Promise.resolve(null)
    ]).then(([productData, statsData]) => {
      if (!active) return;
      setProducts(productData.products || []);
      setStats(statsData);
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.message || "Unable to load Udhaar Khata.");
    });
    return () => { active = false; };
  }, [canViewStats, canCreateUdhaar]);

  useEffect(() => {
    if (!canViewCustomers || !canCreateUdhaar || !showUdhaarForm) return undefined;
    let active = true;
    loadCustomerOptions(debouncedCustomerPickerSearch)
      .then((data) => {
        if (!active) return;
        setCustomerOptions(data.customers || []);
        setLoadedCustomerPickerSearch(debouncedCustomerPickerSearch);
      })
      .catch((requestError) => {
        if (active) {
          setLoadedCustomerPickerSearch(debouncedCustomerPickerSearch);
          toast.error(requestError.response?.data?.message || "Unable to load customers for Udhaar.");
        }
      });
    return () => { active = false; };
  }, [canViewCustomers, canCreateUdhaar, showUdhaarForm, debouncedCustomerPickerSearch]);

  useEffect(() => {
    if (!canViewCustomers) return undefined;
    let active = true;
    const loadCustomers = async () => {
      setCustomerDirectoryLoading(true);
      setCustomerError("");
      try {
        const data = await udhaarService.listCustomers({
          page: customerPage,
          limit: 10,
          search: debouncedCustomerSearch,
          ...(customerStatus ? { status: customerStatus } : {}),
          sortBy: customerSortBy,
          sortOrder: customerSortOrder
        });
        if (!active) return;
        setCustomerDirectory(data.customers || []);
        setCustomerPagination(data);
      } catch (requestError) {
        if (active) setCustomerError(requestError.response?.data?.message || "Unable to load customers.");
      } finally {
        if (active) setCustomerDirectoryLoading(false);
      }
    };
    loadCustomers();
    return () => { active = false; };
  }, [
    canViewCustomers,
    customerPage,
    customerSortBy,
    customerSortOrder,
    customerStatus,
    customerRefreshKey,
    debouncedCustomerSearch
  ]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedCustomerSearch(customerSearch.trim());
      setCustomerPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [customerSearch]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedCustomerPickerSearch(customerPickerSearch.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [customerPickerSearch]);

  useEffect(() => {
    if (location.hash !== "#customers") return undefined;
    const timeout = window.setTimeout(() => {
      document.getElementById("customers")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [location.hash]);

  const itemTotal = useMemo(() => form.items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0
  ), [form.items]);
  const totalAmount = form.items.length ? itemTotal : Number(form.totalAmount) || 0;
  const pendingAmount = Math.max(0, totalAmount - (Number(form.paidAmount) || 0));

  const updateItem = (index, patch) => setForm((current) => ({
    ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)
  }));

  const saveCustomer = async (event) => {
    event.preventDefault();
    if (!isValidCustomerPhone(customerForm.phone)) {
      toast.error("Phone number must contain exactly 10 digits (0-9).");
      return;
    }
    try {
      setSaving(true);
      const cleanName = customerForm.name.trim();
      const cleanPhone = customerForm.phone.trim();
      const existingCustomer = customerOptions.find((customer) =>
        customer.name.trim().toLocaleLowerCase() === cleanName.toLocaleLowerCase() &&
        customer.phone.trim() === cleanPhone
      );
      if (existingCustomer) {
        setForm((current) => ({ ...current, customerId: existingCustomer._id }));
        setCustomerForm({ name: "", phone: "" });
        setShowCustomerForm(false);
        toast.info("This customer already exists. The existing customer was selected.");
        if (resumeUdhaarAfterCustomer) {
          setShowUdhaarForm(true);
          setResumeUdhaarAfterCustomer(false);
        }
        return;
      }
      const response = await udhaarService.createCustomer(customerForm);
      const created = response.customer;
      setCustomerOptions((current) => current.some((customer) => customer._id === created._id)
        ? current
        : [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      setCustomerPage(1);
      setCustomerRefreshKey((key) => key + 1);
      setForm((current) => ({ ...current, customerId: created._id }));
      setCustomerForm({ name: "", phone: "" });
      setShowCustomerForm(false);
      if (response.message === "Customer already exists") {
        toast.info("This customer already exists. The existing customer was selected.");
      } else {
        toast.success("Customer added.");
      }
      if (resumeUdhaarAfterCustomer) {
        setShowUdhaarForm(true);
        setResumeUdhaarAfterCustomer(false);
      }
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to add customer.");
    } finally {
      setSaving(false);
    }
  };

  const saveCustomerEdit = async (event) => {
    event.preventDefault();
    if (!isValidCustomerPhone(editCustomerForm.phone)) {
      toast.error("Phone number must contain exactly 10 digits (0-9).");
      return;
    }
    if (!editCustomerTarget) return;
    try {
      setSaving(true);
      const response = await udhaarService.updateCustomer(editCustomerTarget._id, editCustomerForm);
      const updatedCustomer = response.customer;
      setCustomerOptions((current) => current.map((customer) => customer._id === updatedCustomer._id ? updatedCustomer : customer));
      setCustomerRefreshKey((key) => key + 1);
      setRecords((current) => current.map((record) => (
        record.customerId?._id === updatedCustomer._id
          ? { ...record, customerId: updatedCustomer }
          : record
      )));
      setEditCustomerTarget(null);
      toast.success("Customer details updated. Udhaar balances and payment history are unchanged.");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to update customer.");
    } finally {
      setSaving(false);
    }
  };

  const saveUdhaarEdit = async (event) => {
    event.preventDefault();
    if (!editUdhaarTarget) return;
    try {
      setSaving(true);
      await udhaarService.updateUdhaar(editUdhaarTarget._id, {
        totalAmount: Number(editUdhaarAmount)
      });
      setEditUdhaarTarget(null);
      toast.success("Udhaar total and pending balance updated. Payment history was preserved.");
      await refresh();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to update Udhaar.");
    } finally {
      setSaving(false);
    }
  };

  const saveUdhaar = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await udhaarService.createUdhaar({
        customerId: form.customerId,
        ...(form.items.length ? {} : { totalAmount }),
        paidAmount: Number(form.paidAmount),
        paymentMethod: form.paymentMethod,
        items: form.items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        }))
      });
      toast.success("Udhaar recorded.");
      setShowUdhaarForm(false);
      setForm({ customerId: "", totalAmount: "", paidAmount: "0", paymentMethod: "cash", items: [] });
      await refresh();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to record Udhaar.");
    } finally {
      setSaving(false);
    }
  };

  const cancelUdhaar = async () => {
    try {
      setSaving(true);
      await udhaarService.cancelUdhaar(cancelTarget._id);
      toast.success("Udhaar cancelled; stock was restored where applicable.");
      setCancelTarget(null);
      await refresh();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to cancel Udhaar.");
    } finally {
      setSaving(false);
    }
  };

  const archiveCustomer = async () => {
    if (!deleteCustomerTarget) return;
    try {
      setSaving(true);
      const result = await udhaarService.deleteCustomer(deleteCustomerTarget._id);
      toast.success(result.message || "Customer archived.");
      setCustomerOptions((current) => current.filter((customer) => customer._id !== deleteCustomerTarget._id));
      setCustomerPage(1);
      setDeleteCustomerTarget(null);
      await refresh();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to archive customer.");
    } finally {
      setSaving(false);
    }
  };

  const openDetails = async (record) => {
    setDetailsLoading(true);
    setDetailsError("");
    setDetails(null);
    try {
      setDetails(await udhaarService.getUdhaarDetails(record._id));
    } catch (requestError) {
      setDetailsError(requestError.response?.data?.message || "Unable to load Udhaar details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const statCards = [
    { label: "Total Udhaar", value: stats?.totals?.recordCount?.toLocaleString("en-IN") ?? "—", icon: ClipboardList, tone: "theme-primary-soft theme-primary-text" },
    { label: "Total Udhaar Amount", value: stats ? money(stats.totals?.totalUdhaar) : "—", icon: IndianRupee, tone: "theme-info-soft theme-info" },
    { label: "Total Collected", value: stats ? money(stats.totals?.totalPaid) : "—", icon: Banknote, tone: "theme-success-soft theme-success" },
    { label: "Pending Amount", value: stats ? money(stats.totals?.pending) : "—", icon: HandCoins, tone: "theme-danger-soft theme-danger" },
    { label: "Paid Udhaar", value: stats?.totals?.paidCount?.toLocaleString("en-IN") ?? "—", icon: UserRoundCheck, tone: "theme-success-soft theme-success" }
  ];

  return <Layout><div className="mx-auto max-w-7xl">
    <PageHeader
      title="Udhaar Khata"
      description={`Customer credit and payment ledger for ${user?.organizationName || "your organization"}.`}
      action={canCreateUdhaar && canViewCustomers ? <Button onClick={() => setShowUdhaarForm(true)}>Create</Button> : null}
    />
    {canViewStats && <BusinessStats
      items={statCards}
      loading={loading}
      error={error}
      onRetry={refresh}
    />}
    {canViewCustomers && <section id="customers" className="mb-5 scroll-mt-24 overflow-hidden rounded-2xl border theme-border theme-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b theme-border-subtle px-5 py-4">
        <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg theme-primary-soft theme-primary-text"><UsersRound size={18} /></span><div><h2 className="font-semibold theme-text-primary">Customers</h2><p className="mt-1 text-sm theme-text-muted">Customer balances and ledgers for this organization.</p></div></div>
        <div className="flex items-center gap-2">
          {canOpenCustomerDirectory && <Link className="rounded-xl border theme-border px-3 py-2 text-sm font-medium theme-primary-text" to="/customers">Manage customers</Link>}
          {canCreateCustomer && <Button variant="outline" onClick={() => setShowCustomerForm(true)}>Add </Button>}
        </div>
      </div>
      <div className="grid gap-3 border-b theme-border-subtle p-4 sm:grid-cols-[minmax(0,1fr)_13rem]">
        <input aria-label="Search Udhaar customers" className={fieldClass} placeholder="Search customers by name or phone" value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} />
        <select
          aria-label="Filter Udhaar customers by status"
          className={fieldClass}
          value={customerStatus}
          onChange={(event) => {
            setCustomerStatus(event.target.value);
            setCustomerPage(1);
          }}
        >
          <option value="">All customers</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid / clear</option>
          <option value="active">Active Udhaar</option>
        </select>
      </div>
      {customerError ? <div role="alert" className="flex items-center justify-between gap-3 p-5 text-sm theme-danger"><span>{customerError}</span><Button variant="outline" onClick={refresh}>Retry</Button></div> : customerDirectoryLoading ? <p className="p-5 text-sm theme-text-muted">Loading customers…</p> : customerDirectory.length === 0 ? (
        <p className="p-5 text-sm theme-text-muted">{debouncedCustomerSearch || customerStatus ? "No customers match the current search or filter." : "No customers yet. Add a customer to start an Udhaar ledger."}</p>
      ) : <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="theme-surface-secondary theme-text-muted"><tr>
            {[
              ["Customer", "name"],
              ["Phone", "phone"],
              ["Total Udhaar", "totalUdhaar"],
              ["Paid", "totalPaid"],
              ["Pending", "pendingAmount"],
              ["Last transaction", "lastTransaction"],
              ["Status", "status"]
            ].map(([label, field]) => <th key={field} className="px-4 py-3 font-medium">
              <SortableHeader
                field={field}
                sortBy={customerSortBy}
                sortOrder={customerSortOrder}
                onSort={(nextField, nextOrder) => {
                  setCustomerPage(1);
                  setCustomerSortBy(nextField);
                  setCustomerSortOrder(nextOrder);
                }}
              >{label}</SortableHeader>
            </th>)}
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr></thead>
          <tbody className="divide-y theme-border-subtle">{customerDirectory.map((customer) => {
            const total = Number(customer.totalUdhaar || 0);
            const paid = Number(customer.totalPaid || 0);
            const pending = Number(customer.pendingAmount || 0);
            const status = customer.status === "paid" ? "Paid" : customer.status === "none" ? "No Udhaar" : customer.status === "partial" ? "Partial" : "Pending";
            return <tr key={customer._id} className="theme-hover-surface">
              <td className="px-4 py-3">{canViewLedger ? <Link className="font-medium theme-primary-text hover:underline" to={`/customers/${customer._id}`}>{customer.name}</Link> : <span className="font-medium theme-text-primary">{customer.name}</span>}</td>
              <td className="px-4 py-3 theme-text-secondary">{customer.phone || "—"}</td>
              <td className="px-4 py-3 theme-text-secondary">{money(total)}</td>
              <td className="px-4 py-3 theme-text-secondary">{money(paid)}</td>
              <td className={`px-4 py-3 font-medium ${pending > 0 ? "theme-danger" : "theme-text-secondary"}`}>{money(pending)}</td>
              <td className="px-4 py-3 theme-text-secondary">{customer.lastTransaction ? new Date(customer.lastTransaction).toLocaleDateString() : "—"}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status === "Paid" || status === "No Udhaar" ? "theme-success-soft theme-success" : status === "Partial" ? "theme-warning-soft theme-warning" : "theme-danger-soft theme-danger"}`}>{status}</span></td>
              <td className="px-4 py-3"><div className="flex gap-2">
                {canViewLedger && <Link className="rounded-lg border theme-border px-2 py-1 text-xs theme-primary-text" to={`/customers/${customer._id}`}>Details</Link>}
                {canEditCustomer && <Button variant="outline" aria-label={`Edit ${customer.name}`} title="Edit customer details" onClick={() => { setEditCustomerTarget(customer); setEditCustomerForm({ name: customer.name || "", phone: customer.phone || "" }); }}><Pencil size={16} /></Button>}
                {canDeleteCustomer && <Button variant="outline" aria-label={`Archive ${customer.name}`} title="Archive customer" onClick={() => setDeleteCustomerTarget(customer)}><Trash2 size={16} /></Button>}
              </div></td>
            </tr>;
          })}</tbody>
        </table>
      </div>}
      {!customerError && !customerDirectoryLoading && customerPagination && customerDirectory.length > 0 && (
        <div className="border-t theme-border-subtle">
          <p className="px-4 pt-3 text-center text-xs theme-text-muted">
            Showing {customerDirectory.length} of {customerPagination.total} customers
          </p>
          <Pagination
            page={customerPagination.page}
            totalPages={customerPagination.totalPages}
            hasNextPage={customerPagination.page < customerPagination.totalPages}
            hasPreviousPage={customerPagination.page > 1}
            onPageChange={setCustomerPage}
          />
        </div>
      )}
    </section>}
    {stats && <div className="mb-5 grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border theme-border theme-surface p-5">
        <h2 className="font-semibold theme-text-primary">Recent Udhaar</h2>
        {stats.recentUdhaar?.length ? <div className="mt-3 divide-y theme-border-subtle">{stats.recentUdhaar.map((record) => <div key={record._id} className="flex justify-between gap-3 py-3 text-sm">
          <div><p className="font-medium theme-text-primary">{record.customerId?.name || "Customer"}</p><p className="mt-1 text-xs theme-text-muted">{new Date(record.createdAt).toLocaleString()}</p></div>
          <div className="text-right"><p className="font-semibold theme-text-primary">{money(record.totalCents / 100)}</p><p className="mt-1 text-xs theme-danger">Pending {money((record.totalCents - record.paidCents) / 100)}</p></div>
        </div>)}</div> : <p className="mt-3 text-sm theme-text-muted">No recent Udhaar records.</p>}
      </section>
      {canViewPayments && <section className="rounded-2xl border theme-border theme-surface p-5">
        <h2 className="font-semibold theme-text-primary">Recent payments</h2>
        {stats.recentPayments?.length ? <div className="mt-3 divide-y theme-border-subtle">{stats.recentPayments.map((payment) => <div key={payment._id} className="flex justify-between gap-3 py-3 text-sm">
          <div><p className="font-medium theme-text-primary">{payment.customerId?.name || "Customer"}</p><p className="mt-1 text-xs theme-text-muted">{new Date(payment.createdAt).toLocaleString()} · <span className="capitalize">{payment.method}</span></p></div>
          <strong className="theme-success">{money(payment.amountCents / 100)}</strong>
        </div>)}</div> : <p className="mt-3 text-sm theme-text-muted">No recent payments.</p>}
      </section>}
    </div>}
    {error && <div role="alert" className="mb-4 rounded-xl border theme-danger-border theme-danger-soft p-4 text-sm theme-danger">{error}</div>}
    {canViewUdhaar && <section className="overflow-hidden rounded-2xl border theme-border theme-surface">
      <div className="border-b theme-border-subtle px-5 py-4"><h2 className="font-semibold theme-text-primary">Udhaar history</h2></div>
      {loading ? <p className="p-6 text-sm theme-text-muted">Loading Udhaar records…</p> : records.length === 0 ? <p className="p-6 text-sm theme-text-muted">No Udhaar records yet.</p> : <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="theme-surface-secondary theme-text-muted"><tr>
            {[
              ["Date", "createdAt"],
              ["Customer", "customer"],
              ["Total", "totalCents"],
              ["Paid", "paidCents"],
              ["Pending", "pendingCents"],
              ["Status", "status"],
              ["Recorded by", "createdBy"]
            ].map(([label, field]) => <th key={field} className="px-4 py-3 font-medium">
              <SortableHeader
                field={field}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={(nextField, nextOrder) => {
                  setLoading(true);
                  setPage(1);
                  setSortBy(nextField);
                  setSortOrder(nextOrder);
                }}
              >{label}</SortableHeader>
            </th>)}
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr></thead>
          <tbody className="divide-y theme-border-subtle">{records.map((record) => <tr key={record._id}>
            <td className="px-4 py-3 theme-text-secondary">{new Date(record.createdAt).toLocaleString()}</td>
            <td className="px-4 py-3">{canViewLedger ? <Link className="font-medium theme-primary-text hover:underline" to={`/customers/${record.customerId?._id}`}>{record.customerId?.name || "Customer"}</Link> : <span className="theme-text-primary">{record.customerId?.name || "Customer"}</span>}</td>
            <td className="px-4 py-3 theme-text-primary">{money(record.totalCents / 100)}</td>
            <td className="px-4 py-3 theme-text-secondary">{money(record.paidCents / 100)}</td>
            <td className="px-4 py-3 font-medium theme-danger">{money((record.totalCents - record.paidCents) / 100)}</td>
            <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${record.status === "cancelled" ? "theme-danger-soft theme-danger" : "theme-primary-soft theme-primary-text"}`}>{record.status === "cancelled" ? "cancelled" : record.paymentStatus}</span></td>
            <td className="px-4 py-3 theme-text-secondary">{record.createdBy?.name || "—"}</td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                {canViewDetails && <Button variant="outline" onClick={() => openDetails(record)}>Details</Button>}
                {canEditUdhaar && record.status !== "cancelled" && !record.items?.length && <Button variant="outline" onClick={() => {
                  setEditUdhaarTarget(record);
                  setEditUdhaarAmount((record.totalCents / 100).toFixed(2));
                }}>Edit</Button>}
                {canCancel && record.status !== "cancelled" && <Button variant="outline" onClick={() => setCancelTarget(record)}>Cancel</Button>}
              </div>
            </td>
          </tr>)}</tbody>
        </table>
      </div>}
      {!loading && pages > 1 && <div className="flex items-center justify-between border-t theme-border-subtle px-4 py-3 text-sm"><span className="theme-text-muted">Page {page} of {pages}</span><div className="flex gap-2"><Button variant="outline" disabled={page <= 1} onClick={() => { setLoading(true); setPage((current) => current - 1); }}>Previous</Button><Button variant="outline" disabled={page >= pages} onClick={() => { setLoading(true); setPage((current) => current + 1); }}>Next</Button></div></div>}
    </section>}

    <Modal isOpen={showCustomerForm} onClose={() => {
      if (!saving) {
        setShowCustomerForm(false);
        if (resumeUdhaarAfterCustomer) {
          setShowUdhaarForm(true);
          setResumeUdhaarAfterCustomer(false);
        }
      }
    }} title="Add customer" size="sm">
      <form onSubmit={saveCustomer} className="space-y-4">
        <label className="block text-sm font-medium theme-text-secondary">Name<input ref={customerNameInputRef} required maxLength="120" className={fieldClass} value={customerForm.name} onChange={(event) => setCustomerForm({ ...customerForm, name: event.target.value })} /></label>
        <label className="block text-sm font-medium theme-text-secondary">Phone<input required type="tel" inputMode="numeric" pattern="[0-9]{10}" minLength={10} maxLength={10} title="Enter exactly 10 digits (0-9), with no spaces or symbols." autoComplete="tel" className={fieldClass} value={customerForm.phone} onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value })} /></label>
        <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => {
          setShowCustomerForm(false);
          if (resumeUdhaarAfterCustomer) {
            setShowUdhaarForm(true);
            setResumeUdhaarAfterCustomer(false);
          }
        }}>Cancel</Button><Button type="submit" loading={saving}>Save </Button></div>
      </form>
    </Modal>
    <Modal isOpen={!!editCustomerTarget} onClose={() => !saving && setEditCustomerTarget(null)} title="Edit customer details" size="sm">
      <form onSubmit={saveCustomerEdit} className="space-y-4">
        <p className="text-sm theme-text-muted">This updates the customer profile only; existing Udhaar amounts, payments, and ledger history are preserved.</p>
        <label className="block text-sm font-medium theme-text-secondary">Name<input ref={editCustomerNameInputRef} required maxLength="120" className={fieldClass} value={editCustomerForm.name} onChange={(event) => setEditCustomerForm((current) => ({ ...current, name: event.target.value }))} /></label>
        <label className="block text-sm font-medium theme-text-secondary">Phone<input required type="tel" inputMode="numeric" pattern="[0-9]{10}" minLength={10} maxLength={10} title="Enter exactly 10 digits (0-9), with no spaces or symbols." autoComplete="tel" className={fieldClass} value={editCustomerForm.phone} onChange={(event) => setEditCustomerForm((current) => ({ ...current, phone: event.target.value }))} /></label>
        <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setEditCustomerTarget(null)}>Cancel</Button><Button type="submit" loading={saving}>Save customer</Button></div>
      </form>
    </Modal>
    <Modal isOpen={!!editUdhaarTarget} onClose={() => !saving && setEditUdhaarTarget(null)} title="Edit Udhaar total" size="sm">
      <form onSubmit={saveUdhaarEdit} className="space-y-4">
        <p className="text-sm theme-text-muted">Only money-only Udhaar can be edited. Payment history stays unchanged, and the backend recalculates pending balance and status. Product-backed Udhaar is locked to preserve stock history.</p>
        <label className="block text-sm font-medium theme-text-secondary">Updated total amount<input ref={editUdhaarAmountInputRef} required type="number" min={Math.max(0.01, (editUdhaarTarget?.paidCents || 0) / 100)} step="0.01" className={fieldClass} value={editUdhaarAmount} onChange={(event) => setEditUdhaarAmount(event.target.value)} /></label>
        <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setEditUdhaarTarget(null)}>Cancel</Button><Button type="submit" loading={saving}>Save Udhaar</Button></div>
      </form>
    </Modal>

    <Modal isOpen={showUdhaarForm} onClose={() => !saving && setShowUdhaarForm(false)} title="Create Udhaar" size="xl">
      <form onSubmit={saveUdhaar} className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="text-sm font-medium theme-text-secondary">Customer
              <input ref={customerSearchInputRef} className={fieldClass} aria-label="Search customer selection" placeholder="Search by customer name or phone" value={customerPickerSearch} onChange={(event) => setCustomerPickerSearch(event.target.value)} />
              <select required className={fieldClass} value={form.customerId} onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))}>
              <option value="">{customerPickerLoading ? "Loading customers..." : "Select customer"}</option>{customerOptions.map((customer) => <option key={customer._id} value={customer._id}>{customer.name} {customer.phone ? `· ${customer.phone}` : ""}</option>)}
            </select>
          </label>
          {canCreateCustomer && <div className="flex items-end"><Button type="button" variant="outline" onClick={() => {
            setResumeUdhaarAfterCustomer(true);
            setShowUdhaarForm(false);
            setShowCustomerForm(true);
          }}>Add </Button></div>}
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold theme-text-primary">Products given (optional)</h3><p className="text-xs theme-text-muted">Add products only if physical stock is being given now.</p></div><Button type="button" variant="outline" onClick={() => setForm((current) => ({ ...current, items: [...current.items, emptyItem()] }))}>Add product</Button></div>
          {form.items.map((item, index) => {
            const product = products.find((entry) => entry._id === item.productId);
            return <div key={index} className="grid gap-3 rounded-xl border theme-border p-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
              <label className="text-xs font-medium theme-text-muted">Product<select required className={fieldClass} value={item.productId} onChange={(event) => {
                const selected = products.find((entry) => entry._id === event.target.value);
                updateItem(index, { productId: event.target.value, unitPrice: selected?.price ?? "" });
              }}><option value="">Select product</option>{products.map((entry) => <option key={entry._id} value={entry._id}>{entry.name} · {entry.quantity} in stock</option>)}</select>
                {product && <span className="mt-2 inline-flex items-center gap-2 rounded-lg theme-surface-secondary p-2">
                  <ProductImage src={product.image} alt={product.name} className="h-9 w-9 rounded-lg" />
                  <span className="text-xs theme-text-primary">{product.name}</span>
                </span>}
              </label>
              <label className="text-xs font-medium theme-text-muted">Quantity<input required type="number" min="1" max={product?.quantity} className={fieldClass} value={item.quantity} onChange={(event) => updateItem(index, { quantity: event.target.value })} /></label>
              <label className="text-xs font-medium theme-text-muted">Unit price<input required type="number" min="0.01" step="0.01" className={fieldClass} value={item.unitPrice} onChange={(event) => updateItem(index, { unitPrice: event.target.value })} /></label>
              <div className="flex items-end"><Button type="button" variant="outline" onClick={() => setForm((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))}>Remove</Button></div>
            </div>;
          })}
        </div>
        {!form.items.length && <label className="block text-sm font-medium theme-text-secondary">Udhaar amount<input required type="number" min="0.01" step="0.01" className={fieldClass} value={form.totalAmount} onChange={(event) => setForm({ ...form, totalAmount: event.target.value })} /></label>}
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-medium theme-text-secondary">Paid now<input required type="number" min="0" max={totalAmount || undefined} step="0.01" className={fieldClass} value={form.paidAmount} onChange={(event) => setForm({ ...form, paidAmount: event.target.value })} /></label>
          <label className="text-sm font-medium theme-text-secondary">Payment method<select className={fieldClass} value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}><option value="cash">Cash</option><option value="online">Online</option><option value="other">Other</option></select></label>
          <div className="rounded-xl theme-surface-secondary p-3 text-sm"><p>Total <strong className="float-right">{money(totalAmount)}</strong></p><p className="mt-1">Pending <strong className="float-right">{money(pendingAmount)}</strong></p></div>
        </div>
        <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setShowUdhaarForm(false)}>Cancel</Button><Button type="submit" loading={saving} disabled={!form.customerId || totalAmount <= 0}>Save </Button></div>
      </form>
    </Modal>
    <Modal isOpen={detailsLoading || !!details || !!detailsError} onClose={() => {
      if (!detailsLoading) {
        setDetails(null);
        setDetailsError("");
      }
    }} title="Udhaar details" size="lg">
      {detailsLoading ? <p className="py-5 text-sm theme-text-muted">Loading Udhaar details…</p> : detailsError ? <p role="alert" className="py-5 text-sm theme-danger">{detailsError}</p> : details && <div className="space-y-5">
        <dl className="grid gap-3 rounded-xl theme-surface-secondary p-4 text-sm sm:grid-cols-2">
          <div><dt className="theme-text-muted">Customer</dt><dd className="mt-1 font-medium theme-text-primary">{details.udhaar.customerId?.name || "Customer"}</dd></div>
          <div><dt className="theme-text-muted">Organization</dt><dd className="mt-1 theme-text-primary">{details.organizationName || user?.organizationName || "—"}</dd></div>
          <div><dt className="theme-text-muted">Recorded by</dt><dd className="mt-1 theme-text-primary">{details.udhaar.createdBy?.name || "—"}</dd></div>
          <div><dt className="theme-text-muted">Date</dt><dd className="mt-1 theme-text-primary">{new Date(details.udhaar.createdAt).toLocaleString()}</dd></div>
          <div><dt className="theme-text-muted">Total / Paid / Pending</dt><dd className="mt-1 font-medium theme-text-primary">{money(details.udhaar.totalCents / 100)} / {money(details.udhaar.paidCents / 100)} / {money((details.udhaar.totalCents - details.udhaar.paidCents) / 100)}</dd></div>
          <div><dt className="theme-text-muted">Status</dt><dd className="mt-1 capitalize theme-text-primary">{details.udhaar.status === "cancelled" ? "Cancelled" : details.udhaar.paymentStatus}</dd></div>
        </dl>
        {details.udhaar.items?.length > 0 && <div><h3 className="mb-2 font-semibold theme-text-primary">Products given</h3><ul className="divide-y rounded-xl border theme-border">{details.udhaar.items.map((item, index) => <li key={`${item.productId}-${index}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
          <span className="flex items-center gap-3 theme-text-secondary">
            <ProductImage src={item.productImage} alt={item.productName} className="h-10 w-10 rounded-lg" />
            <span>{canViewProductDetails ? <Link to={`/products/${item.productId}`} className="theme-primary-text hover:underline">{item.productName}</Link> : item.productName} × {item.quantity}</span>
          </span>
          <span className="theme-text-primary">{money(item.lineTotalCents / 100)}</span>
        </li>)}</ul></div>}
        {canViewLedger && <Link className="inline-flex text-sm font-medium theme-primary-text hover:underline" to={`/customers/${details.udhaar.customerId?._id}`}>Open customer ledger →</Link>}
        {canViewPayments && <div><h3 className="mb-2 font-semibold theme-text-primary">Payment history</h3>{details.payments?.length ? <ul className="divide-y rounded-xl border theme-border">{details.payments.map((payment) => <li key={payment._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"><span className="theme-text-muted">{new Date(payment.createdAt).toLocaleString()} · <span className="capitalize">{payment.method}</span> · Recorded by {payment.createdBy?.name || "—"}</span><strong className="theme-text-primary">{money(payment.amountCents / 100)}</strong></li>)}</ul> : <p className="text-sm theme-text-muted">No payment history available.</p>}</div>}
      </div>}
    </Modal>
    <ConfirmDialog isOpen={!!cancelTarget} onClose={() => !saving && setCancelTarget(null)} onConfirm={cancelUdhaar} title="Cancel this Udhaar?" message="The record remains in the ledger. Any product stock given with this unpaid Udhaar will be restored and recorded in Stock History." confirmText="Cancel Udhaar" loading={saving} loadingText="Cancelling…" />
    <ConfirmDialog isOpen={!!deleteCustomerTarget} onClose={() => !saving && setDeleteCustomerTarget(null)} onConfirm={archiveCustomer} title="Archive customer?" message={deleteCustomerTarget ? `Archive ${deleteCustomerTarget.name} and preserve their financial history? Customers with outstanding Udhaar cannot be archived.` : ""} confirmText="Archive customer" loading={saving} />
  </div></Layout>;
};

export default Udhaar;
