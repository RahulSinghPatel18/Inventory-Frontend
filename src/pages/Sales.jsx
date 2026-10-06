import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Banknote,
  CalendarDays,
  IndianRupee,
  Package,
  ShoppingCart
} from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/layout/Layout";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import PageHeader from "../components/common/PageHeader";
import BusinessStats from "../components/common/BusinessStats";
import SortableHeader from "../components/common/SortableHeader";
import ProductImage from "../components/products/ProductImage";
import salesService from "../services/salesService";
import productService from "../services/productService";
import useAuth from "../hooks/useAuth";
import { hasPermission } from "../utils/permissions";

const money = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
}).format(Number(amount || 0));

const fieldClass = "mt-1 w-full rounded-xl border theme-border theme-surface px-3 py-2.5 text-sm theme-text-primary";
const emptyLine = () => ({ productId: "", quantity: "1", price: "" });
const nonEmptyFilters = (filters) => Object.fromEntries(
  Object.entries(filters).filter(([, value]) => value !== "")
);

const Sales = () => {
  const { user } = useAuth();
  const canViewSales = hasPermission(user, "sales.view");
  const canCreate = hasPermission(user, "sales.create");
  const canViewUdhaar = hasPermission(user, "udhaar.view");
  const canViewDetails = hasPermission(user, "sales.details");
  const canViewStats = hasPermission(user, ["sales.statistics", "analytics.sales"]);
  const canViewProductDetails = hasPermission(user, "products.details");
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(canViewSales);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(canViewStats);
  const [statsError, setStatsError] = useState("");
  const [statsRefresh, setStatsRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({
    search: "", startDate: "", endDate: "", sortBy: "createdAt", sortOrder: "desc"
  });
  const [draftFilters, setDraftFilters] = useState(filters);
  const [saleForm, setSaleForm] = useState({ paymentMethod: "cash", items: [emptyLine()] });

  const loadData = async () => {
    if (!canViewSales) return;
    setLoading(true);
    setError("");
    try {
      const salesData = await salesService.getSales({ page, limit: 10, ...nonEmptyFilters(filters) });
      if (!Array.isArray(salesData.sales)) throw new Error("Sales API returned an unexpected response.");
      setSales(salesData.sales || []);
      setPages(salesData.totalPages || 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Unable to load sales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canViewSales) {
      return undefined;
    }
    let active = true;
    salesService.getSales({ page, limit: 10, ...nonEmptyFilters(filters) }).then((salesData) => {
      if (!active) return;
      if (!Array.isArray(salesData.sales)) throw new Error("Sales API returned an unexpected response.");
      setError("");
      setSales(salesData.sales || []);
      setPages(salesData.totalPages || 1);
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.message || requestError.message || "Unable to load sales.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [page, filters, canViewSales]);

  useEffect(() => {
    if (!canViewStats) return undefined;
    let active = true;
    salesService.getAnalytics()
      .then((data) => {
        if (active) {
          setStats(data.analytics || data);
          setStatsError("");
        }
      })
      .catch((requestError) => {
        if (active) setStatsError(requestError.response?.data?.message || "Unable to load sales statistics.");
      })
      .finally(() => {
        if (active) setStatsLoading(false);
      });
    return () => { active = false; };
  }, [canViewStats, statsRefresh]);

  const openSaleForm = async () => {
    setProductsLoading(true);
    try {
      const productData = await productService.getProducts({ page: 1, limit: 100 });
      if (!Array.isArray(productData.products)) throw new Error("Product API returned an unexpected response.");
      setProducts(productData.products);
      setShowForm(true);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || requestError.message || "Unable to load products for a new sale.");
    } finally {
      setProductsLoading(false);
    }
  };

  const estimate = useMemo(() => saleForm.items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0
  ), [saleForm.items]);

  const updateItem = (index, patch) => setSaleForm((current) => ({
    ...current,
    items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)
  }));

  const createSale = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await salesService.createSale({
        paymentMethod: saleForm.paymentMethod,
        items: saleForm.items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.price)
        }))
      });
      toast.success("Sale recorded and stock updated.");
      setShowForm(false);
      setSaleForm({ paymentMethod: "cash", items: [emptyLine()] });
      if (canViewStats) setStatsLoading(true);
      setStatsRefresh((current) => current + 1);
      if (canViewSales) await loadData();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Could not create sale.");
    } finally {
      setSaving(false);
    }
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setPage(1);
    setFilters(draftFilters);
  };

  const setDraft = (key, value) => setDraftFilters((current) => ({ ...current, [key]: value }));
  const changeSort = (field, order) => {
    setPage(1);
    setLoading(true);
    setError("");
    setFilters((current) => ({ ...current, sortBy: field, sortOrder: order }));
    setDraftFilters((current) => ({ ...current, sortBy: field, sortOrder: order }));
  };
  const statCards = [
    { label: "Total Sales", value: stats?.totals?.salesCount?.toLocaleString("en-IN") ?? "—", icon: ShoppingCart, tone: "theme-primary-soft theme-primary-text", to: "/sales" },
    { label: "Today's Sales", value: stats?.today?.salesCount?.toLocaleString("en-IN") ?? "—", icon: CalendarDays, tone: "theme-info-soft theme-info", to: "/sales" },
    { label: "Total Sales Amount", value: stats ? money(stats.totals?.totalSales) : "—", icon: IndianRupee, tone: "theme-success-soft theme-success" },
    { label: "Total Collected", value: stats ? money(stats.totals?.totalCollected) : "—", icon: Banknote, tone: "theme-primary-soft theme-primary-text" },
    { label: "Products Sold", value: stats?.totals?.productsSold?.toLocaleString("en-IN") ?? "—", icon: Package, tone: "theme-info-soft theme-info" }
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Sales"
          description={`Product sales for ${user?.organizationName || "your organization"}.`}
          action={canCreate ? <Button onClick={openSaleForm} loading={productsLoading}>New sale</Button> : null}
        />
        {canViewStats && <BusinessStats
          items={statCards}
          loading={statsLoading}
          error={statsError}
          onRetry={() => {
            setStatsLoading(true);
            setStatsRefresh((current) => current + 1);
          }}
        />}
        {canViewUdhaar && <div className="mb-5">
          <Link className="rounded-lg border theme-border px-3 py-2 text-sm theme-text-secondary" to="/udhaar">Open Udhaar Khata</Link>
        </div>}
        {canViewSales && <form onSubmit={applyFilters} className="mb-4 grid gap-3 rounded-2xl border theme-border theme-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
          <input className={fieldClass} aria-label="Search sales" placeholder="Search products" value={draftFilters.search} onChange={(event) => setDraft("search", event.target.value)} />
          <input className={fieldClass} aria-label="Start date" type="date" value={draftFilters.startDate} onChange={(event) => setDraft("startDate", event.target.value)} />
          <input className={fieldClass} aria-label="End date" type="date" value={draftFilters.endDate} onChange={(event) => setDraft("endDate", event.target.value)} />
          <Button type="submit" variant="outline">Apply filters</Button>
        </form>}
        {error && <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border theme-danger-border theme-danger-soft p-4 text-sm theme-danger"><span>{error}</span><Button variant="outline" onClick={loadData}>Retry</Button></div>}
        {canViewSales && <section className="overflow-hidden rounded-2xl border theme-border theme-surface shadow-sm">
          <div className="border-b theme-border-subtle px-5 py-4"><h2 className="font-semibold theme-text-primary">Sales history</h2></div>
          {loading ? <p className="p-6 text-sm theme-text-muted">Loading sales…</p> : sales.length === 0 ? (
            <p className="p-6 text-sm theme-text-muted">No sales found. Create a sale or adjust the filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="theme-surface-secondary theme-text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    {[
                      ["Quantity", "quantity"],
                      ["Total", "totalCents"],
                      ["Collected", "paidCents"],
                      ["Payment method", "paymentMethod"],
                      ["Date", "createdAt"],
                      ["Sold by", "soldBy"]
                    ].map(([label, field]) => <th key={field} className="px-4 py-3 font-medium">
                      <SortableHeader field={field} sortBy={filters.sortBy} sortOrder={filters.sortOrder} onSort={changeSort}>{label}</SortableHeader>
                    </th>)}
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y theme-border-subtle">
                  {sales.map((sale) => <tr key={sale._id} className="theme-hover-surface">
                    <td className="px-4 py-3 font-medium theme-text-primary">
                      <span className="inline-flex items-center gap-3">
                        <ProductImage src={sale.items?.[0]?.productImage} alt={sale.items?.[0]?.productName} className="h-10 w-10 rounded-lg" />
                        {canViewProductDetails && sale.items?.[0]?.productId
                          ? <Link className="hover:underline" to={`/products/${sale.items[0].productId}`}>{sale.items[0].productName || "Product"}</Link>
                          : sale.items?.[0]?.productName || "Product"}
                      </span>
                      {sale.items?.length > 1 && <span className="ml-1 font-normal theme-text-muted">+{sale.items.length - 1} more</span>}
                    </td>
                    <td className="px-4 py-3 theme-text-secondary">{(sale.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</td>
                    <td className="px-4 py-3 font-medium theme-text-primary">{money(sale.totalCents / 100)}</td>
                    <td className="px-4 py-3 theme-text-secondary">{money(sale.paidCents / 100)}</td>
                    <td className="px-4 py-3 capitalize theme-text-secondary">{sale.paymentMethod || "cash"}</td>
                    <td className="px-4 py-3 theme-text-secondary">{new Date(sale.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 theme-text-secondary">{sale.createdBy?.name || "—"}</td>
                    <td className="px-4 py-3">{canViewDetails && <Link className="font-medium theme-primary-text hover:underline" to={`/sales/${sale._id}`}>Details</Link>}</td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          )}
          {!loading && pages > 1 && <div className="flex items-center justify-between border-t theme-border-subtle px-4 py-3 text-sm">
            <span className="theme-text-muted">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => { setLoading(true); setError(""); setPage((current) => current - 1); }}>Previous</Button>
              <Button variant="outline" disabled={page >= pages} onClick={() => { setLoading(true); setError(""); setPage((current) => current + 1); }}>Next</Button>
            </div>
          </div>}
        </section>}
      </div>
      <Modal isOpen={showForm} onClose={() => !saving && setShowForm(false)} title="Create product sale" size="xl">
        <form className="space-y-5" onSubmit={createSale}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold theme-text-primary">Products</h3>
              <Button type="button" variant="outline" onClick={() => setSaleForm((current) => ({ ...current, items: [...current.items, emptyLine()] }))}>Add product</Button>
            </div>
            {saleForm.items.map((item, index) => {
              const selected = products.find((product) => product._id === item.productId);
              return <div key={index} className="grid gap-3 rounded-xl border theme-border p-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
                <label className="text-xs font-medium theme-text-muted">Product
                  <select required className={fieldClass} value={item.productId} onChange={(event) => {
                    const product = products.find((entry) => entry._id === event.target.value);
                    updateItem(index, { productId: event.target.value, price: product?.price ?? "" });
                  }}>
                    <option value="">Select product</option>
                    {products.map((product) => <option key={product._id} value={product._id}>{product.name} · {product.quantity} in stock</option>)}
                  </select>
                  {selected && <span className="mt-2 inline-flex items-center gap-2 rounded-lg theme-surface-secondary p-2">
                    <ProductImage src={selected.image} alt={selected.name} className="h-9 w-9 rounded-lg" />
                    <span className="text-xs theme-text-primary">{selected.name}</span>
                  </span>}
                </label>
                <label className="text-xs font-medium theme-text-muted">Quantity
                  <input required min="1" max={selected?.quantity} type="number" className={fieldClass} value={item.quantity} onChange={(event) => updateItem(index, { quantity: event.target.value })} />
                </label>
                <label className="text-xs font-medium theme-text-muted">Selling price
                  <input required min="0.01" step="0.01" type="number" className={fieldClass} value={item.price} onChange={(event) => updateItem(index, { price: event.target.value })} />
                </label>
                <div className="flex items-end"><Button type="button" variant="outline" disabled={saleForm.items.length === 1} onClick={() => setSaleForm((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))}>Remove</Button></div>
              </div>;
            })}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium theme-text-secondary">Payment method
              <select className={fieldClass} value={saleForm.paymentMethod} onChange={(event) => setSaleForm((current) => ({ ...current, paymentMethod: event.target.value }))}>
                <option value="cash">Cash</option><option value="online">Online</option><option value="other">Other</option>
              </select>
            </label>
            <div className="rounded-xl theme-surface-secondary p-3 text-sm">
              <p className="flex justify-between"><span>Total</span><strong>{money(estimate)}</strong></p>
              <p className="mt-1 flex justify-between"><span>Paid now</span><strong>{money(estimate)}</strong></p>
            </div>
          </div>
          <p className="text-xs theme-text-muted">Normal product sales are paid in full and are not linked to a customer or Udhaar ledger.</p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={saving} loadingText="Saving…" disabled={estimate <= 0}>Confirm sale</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Sales;
