import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { IndianRupee, ShoppingBag, Users, Wallet } from "lucide-react";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import {
  CHART_COLORS,
  currencyFormatter,
  numberFormatter
} from "../../hooks/useInventoryReport";

const SummaryCard = ({ label, value, icon: Icon, tone }) => (
  <article className="rounded-xl border theme-border theme-surface p-4 shadow-sm sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm font-medium theme-text-muted">{label}</p>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon size={18} /></span>
    </div>
    <p className="mt-3 break-words text-2xl font-bold theme-text-primary">{value}</p>
  </article>
);

const ReportPanel = ({ title, description, children }) => (
  <section className="overflow-hidden rounded-xl border theme-border theme-surface shadow-sm">
    <header className="border-b theme-border-subtle px-5 py-4 sm:px-6">
      <h2 className="text-base font-semibold theme-text-primary">{title}</h2>
      {description && <p className="mt-1 text-xs theme-text-muted">{description}</p>}
    </header>
    {children}
  </section>
);

const ReportTable = ({ headers, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[540px] text-left text-sm">
      <thead className="theme-surface-secondary text-xs uppercase theme-text-muted">
        <tr>{headers.map((header) => <th key={header} className="px-5 py-3 font-semibold">{header}</th>)}</tr>
      </thead>
      <tbody className="divide-y theme-border-subtle">{children}</tbody>
    </table>
  </div>
);

const SummaryCards = ({ items, loading, error }) => (
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {items.map((item) => (
      <SummaryCard
        key={item.label}
        {...item}
        value={loading || error || item.error ? "—" : item.value}
      />
    ))}
  </div>
);

const BusinessReports = ({
  sales,
  udhaar,
  customers,
  errors,
  loading,
  canViewSales,
  canViewUdhaar
}) => (
  <div className="space-y-8">
    {canViewSales && (
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold theme-text-primary">Sales performance</h2>
          <p className="mt-1 text-sm theme-text-muted">Lifetime totals, today and this month, with a 30-day sales trend.</p>
        </div>
        <SummaryCards
          loading={loading}
          error={errors.sales}
          items={[
            { label: "Total sales", value: currencyFormatter.format(sales?.totals?.totalSales || 0), icon: IndianRupee, tone: "theme-primary-soft theme-primary-text" },
            { label: "Collected from sales", value: currencyFormatter.format(sales?.totals?.totalCollected || 0), icon: Wallet, tone: "theme-success-soft theme-success" },
            { label: "Sales this month", value: currencyFormatter.format(sales?.month?.totalSales || 0), icon: ShoppingBag, tone: "theme-info-soft theme-info" },
            { label: "Products sold", value: numberFormatter.format(sales?.totals?.productsSold || 0), icon: ShoppingBag, tone: "theme-warning-soft theme-warning" }
          ]}
        />
        {errors.sales ? <ErrorState message={errors.sales} /> : (
          <div className="grid gap-5 xl:grid-cols-5">
            <ReportPanel title="Sales trend" description="Daily sales total over the last 30 days">
              {!sales?.salesTrend?.length ? (
                <EmptyState title="No sales in this period" message="Completed sales will appear here." />
              ) : (
                <div className="h-[300px] w-full px-2 py-4 sm:px-5">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sales.salesTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--theme-chart-grid)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--theme-chart-label)", fontSize: 11 }} minTickGap={24} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--theme-chart-muted)", fontSize: 11 }} />
                      <Tooltip formatter={(value) => currencyFormatter.format(value)} contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="sales" name="Sales" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ReportPanel>
            <ReportPanel title="Sales by payment method" description="Lifetime sales amount by method">
              {!sales?.paymentMethods?.length ? (
                <EmptyState title="No payment data" message="Payment method totals will appear here." />
              ) : (
                <div className="h-[300px] w-full px-2 py-4 sm:px-5">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sales.paymentMethods} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--theme-chart-grid)" />
                      <XAxis dataKey="method" axisLine={false} tickLine={false} tick={{ fill: "var(--theme-chart-label)", fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--theme-chart-muted)", fontSize: 11 }} />
                      <Tooltip formatter={(value) => currencyFormatter.format(value)} contentStyle={tooltipStyle} />
                      <Bar dataKey="sales" name="Sales" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} maxBarSize={44} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ReportPanel>
          </div>
        )}
      </section>
    )}

    {canViewUdhaar && (
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold theme-text-primary">Udhaar & customer health</h2>
          <p className="mt-1 text-sm theme-text-muted">Outstanding balances, collections and customer account activity.</p>
        </div>
        {errors.udhaar ? <ErrorState message={errors.udhaar} /> : (
          <>
            <SummaryCards
              loading={loading}
              error={errors.udhaar}
              items={[
                { label: "Active Udhaar", value: currencyFormatter.format(udhaar?.totals?.totalUdhaar || 0), icon: IndianRupee, tone: "theme-primary-soft theme-primary-text" },
                { label: "Collected", value: currencyFormatter.format(udhaar?.totals?.totalPaid || 0), icon: Wallet, tone: "theme-success-soft theme-success" },
                { label: "Outstanding", value: currencyFormatter.format(udhaar?.totals?.pending || 0), icon: IndianRupee, tone: "theme-warning-soft theme-warning" },
                { label: "Customers with balance", value: numberFormatter.format(customers?.customersWithPendingAmount || 0), icon: Users, tone: "theme-info-soft theme-info", error: errors.customers }
              ]}
            />
            {errors.customers && <ErrorState message={errors.customers} />}
            <div className="grid gap-5 xl:grid-cols-5">
              <ReportPanel title="Udhaar and collection trend" description="Daily credit issued and payments collected over the last 30 days">
                {!udhaar?.udhaarTrend?.length ? (
                  <EmptyState title="No Udhaar activity" message="Credit and collection activity will appear here." />
                ) : (
                  <div className="h-[300px] w-full px-2 py-4 sm:px-5">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={udhaar.udhaarTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--theme-chart-grid)" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--theme-chart-label)", fontSize: 11 }} minTickGap={24} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--theme-chart-muted)", fontSize: 11 }} />
                        <Tooltip formatter={(value) => currencyFormatter.format(value)} contentStyle={tooltipStyle} />
                        <Line type="monotone" dataKey="udhaar" name="Credit issued" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="paid" name="Collected" stroke={CHART_COLORS[4]} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="pending" name="Outstanding balance" stroke={CHART_COLORS[2]} strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </ReportPanel>
              <ReportPanel title="Customers with highest balance" description="Current active Udhaar, ranked by outstanding amount">
                {udhaar?.outstandingCustomers?.length ? (
                  <ReportTable headers={["Customer", "Outstanding", "Records"]}>
                    {udhaar.outstandingCustomers.map((customer) => (
                      <tr key={customer.customerId}>
                        <td className="px-5 py-3.5 font-medium theme-text-primary">{customer.name}</td>
                        <td className="px-5 py-3.5 font-semibold theme-warning">{currencyFormatter.format(customer.outstanding)}</td>
                        <td className="px-5 py-3.5 theme-text-secondary">{numberFormatter.format(customer.recordCount)}</td>
                      </tr>
                    ))}
                  </ReportTable>
                ) : (
                  <EmptyState title="No outstanding balances" message="Customers with pending Udhaar will appear here." />
                )}
              </ReportPanel>
            </div>
          </>
        )}
      </section>
    )}
  </div>
);

const tooltipStyle = {
  border: "1px solid var(--theme-border)",
  borderRadius: "10px",
  backgroundColor: "var(--theme-chart-tooltip)",
  color: "var(--theme-text-primary)"
};

export default BusinessReports;
