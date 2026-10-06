import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Banknote,
  CircleDollarSign,
  Clock3,
  Pencil,
  Trash2,
  Users
} from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/layout/Layout";
import Button from "../components/common/Button";
import BusinessStats from "../components/common/BusinessStats";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import PageHeader from "../components/common/PageHeader";
import Pagination from "../components/common/Pagination";
import SortableHeader from "../components/common/SortableHeader";
import udhaarService from "../services/udhaarService";
import { hasPermission } from "../utils/permissions";
import useAuth from "../hooks/useAuth";
import { isValidCustomerPhone } from "../utils/validators";

const money = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
}).format(Number(amount || 0));
const fieldClass = "mt-1 w-full rounded-xl border theme-border theme-surface px-3 py-2.5 text-sm theme-text-primary";

const Customers = () => {
  const { user } = useAuth();
  const canViewCustomers = hasPermission(user, "customers.view");
  const canCreate = hasPermission(user, "customers.create");
  const canEdit = hasPermission(user, ["customers.update", "customers.edit"]);
  const canDelete = hasPermission(user, "customers.delete");
  const canViewLedger = hasPermission(user, "customers.ledger");
  const canViewUdhaar = hasPermission(user, "udhaar.view");
  const canViewPayments = hasPermission(user, ["payments.history", "udhaar.payment-history"]);
  const canViewStats = hasPermission(user, "customers.statistics");
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || (
    searchParams.get("hasBalance") === "true" ? "pending" :
      searchParams.get("hasBalance") === "false" ? "paid" : ""
  );
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const sortBy = searchParams.get("sortBy") || "name";
  const order = searchParams.get("order") || "asc";
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(canViewStats);
  const [statsError, setStatsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", phone: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const refresh = useCallback(() => {
    if (canViewCustomers) setLoading(true);
    if (canViewStats) setStatsLoading(true);
    setRefreshKey((current) => current + 1);
  }, [canViewCustomers, canViewStats]);

  useEffect(() => {
    if (!canViewCustomers) {
      return undefined;
    }
    let active = true;
    udhaarService.listCustomers({
      page,
      limit: 10,
      search: debouncedSearch,
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      sortBy,
      sortOrder: order
    }).then((data) => {
      if (!active) return;
      setCustomers(data.customers || []);
      setPagination(data);
      setError("");
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.message || "Unable to load customers.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [page, debouncedSearch, statusFilter, startDate, endDate, sortBy, order, refreshKey, canViewCustomers]);

  useEffect(() => {
    if (!canViewStats) {
      return undefined;
    }
    let active = true;
    udhaarService.getCustomerStats()
      .then((data) => {
        if (active) {
          setStats(data);
          setStatsError("");
        }
      })
      .catch((requestError) => {
        if (active) setStatsError(requestError.response?.data?.message || "Unable to load customer statistics.");
      })
      .finally(() => {
        if (active) setStatsLoading(false);
      });
    return () => { active = false; };
  }, [refreshKey, canViewStats]);

  const saveCustomer = async (event) => {
    event.preventDefault();
    const phone = editing ? editForm.phone : createForm.phone;
    if (!isValidCustomerPhone(phone)) {
      toast.error("Phone number must contain exactly 10 digits (0-9).");
      return;
    }
    try {
      setSaving(true);
      if (editing) {
        await udhaarService.updateCustomer(editing._id, editForm);
        toast.success("Customer updated.");
        setEditing(null);
      } else {
        await udhaarService.createCustomer(createForm);
        toast.success("Customer added.");
        setCreating(false);
        setCreateForm({ name: "", phone: "" });
      }
      refresh();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to save customer.");
    } finally {
      setSaving(false);
    }
  };

  const archiveCustomer = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const result = await udhaarService.deleteCustomer(deleteTarget._id);
      toast.success(result.message || "Customer deleted.");
      setDeleteTarget(null);
      refresh();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to delete customer.");
    } finally {
      setDeleting(false);
    }
  };

  const statCards = [
    { label: "Total Customers", value: stats?.totalCustomers?.toLocaleString("en-IN") ?? "—", icon: Users, tone: "theme-primary-soft theme-primary-text" },
    { label: "Active Udhaar", value: stats?.activeUdhaarCustomers?.toLocaleString("en-IN") ?? "—", icon: Clock3, tone: "theme-primary-soft theme-primary-text", to: "/customers?status=active" },
    { label: "Pending Customers", value: stats?.customersWithPendingAmount?.toLocaleString("en-IN") ?? "—", icon: CircleDollarSign, tone: "theme-danger-soft theme-danger", to: "/customers?status=pending" },
    { label: "Total Udhaar", value: stats ? money(stats.totalUdhaar) : "—", icon: CircleDollarSign, tone: "theme-primary-soft theme-primary-text" },
    { label: "Total Collected", value: stats ? money(stats.totalCollected) : "—", icon: Banknote, tone: "theme-success-soft theme-success" },
    { label: "Total Outstanding", value: stats ? money(stats.totalOutstanding) : "—", icon: CircleDollarSign, tone: "theme-danger-soft theme-danger", to: "/customers?hasBalance=true" }
  ];
  const setQueryFilter = (updates) => {
    const next = new URLSearchParams(searchParams);
    next.delete("hasBalance");
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next);
    setPage(1);
    setLoading(true);
  };
  const toggleSort = (field, nextOrder) => setQueryFilter({
    sortBy: field,
    order: nextOrder
  });
  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setQueryFilter({ status: "", sortBy: "", order: "", startDate: "", endDate: "" });
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Customers"
          description={`Udhaar customers and balances for ${user?.organizationName || "your organization"}.`}
          action={canCreate ? <Button onClick={() => setCreating(true)}>Add </Button> : null}
        />
        {canViewStats && <BusinessStats items={statCards} loading={statsLoading} error={statsError} onRetry={refresh} />}

        {canViewCustomers && <section className="overflow-hidden rounded-2xl border theme-border theme-surface shadow-sm">
          <div className="grid gap-3 border-b theme-border-subtle p-4 sm:grid-cols-[minmax(0,1fr)_13rem_10rem_10rem_auto]">
            <Input
              name="customerSearch"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              placeholder="Search customers by name or phone"
              showSearchIcon
            />
            <select
              aria-label="Filter customers by balance"
              className={fieldClass}
              value={statusFilter}
              onChange={(event) => setQueryFilter({ status: event.target.value })}
            >
              <option value="">All customers</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid / clear</option>
              <option value="active">Active Udhaar</option>
            </select>
            <input
              type="date"
              aria-label="Transactions from date"
              className={fieldClass}
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setQueryFilter({ startDate: event.target.value })}
            />
            <input
              type="date"
              aria-label="Transactions through date"
              className={fieldClass}
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setQueryFilter({ endDate: event.target.value })}
            />
            <Button type="button" variant="outline" onClick={clearFilters}>Clear filters</Button>
          </div>
          {error ? <ErrorState message={error} onRetry={refresh} /> : loading ? (
            <div className="space-y-3 p-5" role="status" aria-label="Loading customers">
              {[0, 1, 2, 3].map((row) => <div key={row} className="h-12 animate-pulse rounded-lg theme-surface-secondary" />)}
            </div>
          ) : customers.length === 0 ? (
            <EmptyState
              title={search || statusFilter || startDate || endDate ? "No customers found" : "No customers yet"}
              message={search || statusFilter || startDate || endDate ? "Try changing the search or filters." : "Customers added to Udhaar Khata will appear here."}
              className="min-h-[280px]"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="theme-surface-secondary theme-text-muted">
                  <tr>
                    {[
                      ["Customer", "name"], ["Phone", "phone"], ["Total Udhaar", "totalUdhaar"], ["Paid", "totalPaid"],
                      ["Pending", "pendingAmount"], ["Last transaction", "lastTransaction"], ["Status", "status"]
                    ].map(([label, field]) => <th key={label} className="px-4 py-3 font-medium">
                      <SortableHeader field={field} sortBy={sortBy} sortOrder={order} onSort={toggleSort}>{label}</SortableHeader>
                    </th>)}
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border-subtle">
                  {customers.map((customer) => {
                    const pending = Number(customer.pendingAmount || 0);
                    const status = customer.status === "paid" ? "Paid" : customer.status === "none" ? "No Udhaar" : customer.status === "partial" ? "Partial" : "Pending";
                    return (
                      <tr key={customer._id} className="theme-hover-surface">
                        <td className="px-4 py-3">
                          {canViewLedger
                            ? <Link className="font-medium theme-primary-text hover:underline" to={`/customers/${customer._id}`}>{customer.name}</Link>
                            : <span className="font-medium theme-text-primary">{customer.name}</span>}
                        </td>
                          <td className="px-4 py-3 theme-text-secondary">{customer.phone || "—"}</td>
                        <td className="px-4 py-3 theme-text-secondary">{money(customer.totalUdhaar)}</td>
                        <td className="px-4 py-3 theme-text-secondary">{money(customer.totalPaid)}</td>
                        <td className={`px-4 py-3 font-medium ${pending > 0 ? "theme-danger" : "theme-text-secondary"}`}>{money(pending)}</td>
                        <td className="px-4 py-3 theme-text-secondary">{customer.lastTransaction ? new Date(customer.lastTransaction).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status === "Paid" || status === "No Udhaar" ? "theme-success-soft theme-success" : status === "Partial" ? "theme-warning-soft theme-warning" : "theme-danger-soft theme-danger"}`}>{status}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {canViewLedger && <Link className="rounded-lg border theme-border px-2 py-1 text-xs theme-primary-text" to={`/customers/${customer._id}`}>Details</Link>}
                            {canViewLedger && canViewUdhaar && <Link className="rounded-lg border theme-border px-2 py-1 text-xs theme-primary-text" to={`/customers/${customer._id}#udhaar-history`}>Udhaar</Link>}
                            {canViewLedger && canViewPayments && <Link className="rounded-lg border theme-border px-2 py-1 text-xs theme-primary-text" to={`/customers/${customer._id}#payment-history`}>Payments</Link>}
                            {canEdit && <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border theme-border theme-text-muted theme-hover-primary" title={`Edit ${customer.name}`} aria-label={`Edit ${customer.name}`} onClick={() => {
                              setEditing(customer);
                              setEditForm({ name: customer.name || "", phone: customer.phone || "" });
                            }}><Pencil size={15} /></button>}
                            {canDelete && <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border theme-border theme-text-muted theme-hover-danger" title={`Delete ${customer.name}`} aria-label={`Delete ${customer.name}`} onClick={() => setDeleteTarget(customer)}><Trash2 size={15} /></button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {!loading && !error && pagination && customers.length > 0 && (
            <div className="border-t theme-border-subtle">
            <p className="px-4 pt-3 text-center text-xs theme-text-muted">Showing {customers.length} of {pagination.total} customers</p>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.page < pagination.totalPages}
              hasPreviousPage={pagination.page > 1}
              onPageChange={(nextPage) => {
                setPage(nextPage);
                setLoading(true);
              }}
            />
            </div>
          )}
        </section>}
      </div>

      <Modal isOpen={creating || !!editing} onClose={() => !saving && (creating ? setCreating(false) : setEditing(null))} title={editing ? "Edit " : "Add "} size="sm">
        <form onSubmit={saveCustomer} className="space-y-4">
          <label className="block text-sm font-medium theme-text-secondary">Name<input required maxLength="120" className={fieldClass} value={editing ? editForm.name : createForm.name} onChange={(event) => editing ? setEditForm((current) => ({ ...current, name: event.target.value })) : setCreateForm((current) => ({ ...current, name: event.target.value }))} /></label>
          <label className="block text-sm font-medium theme-text-secondary">Phone<input required type="tel" inputMode="numeric" pattern="[0-9]{10}" minLength={10} maxLength={10} title="Enter exactly 10 digits (0-9), with no spaces or symbols." autoComplete="tel" className={fieldClass} value={editing ? editForm.phone : createForm.phone} onChange={(event) => editing ? setEditForm((current) => ({ ...current, phone: event.target.value })) : setCreateForm((current) => ({ ...current, phone: event.target.value }))} /></label>
          <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => editing ? setEditing(null) : setCreating(false)}>Cancel</Button><Button type="submit" loading={saving}>{editing ? "Save " : "Add "}</Button></div>
        </form>
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={archiveCustomer}
        loading={deleting}
        title="Delete customer?"
        message={deleteTarget ? `Delete ${deleteTarget.name} from the active customer list? Historical payment and Udhaar records are kept. Customers with an outstanding balance cannot be deleted.` : ""}
        confirmText="Delete customer"
      />
    </Layout>
  );
};

export default Customers;
