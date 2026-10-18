import {
  CartesianGrid,
  Area,
  AreaChart,
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

const ReportPanel = ({ title, description, children, className = "" }) => (
  <section className={`min-w-0 overflow-hidden rounded-xl border theme-border theme-surface shadow-sm ${className}`}>
    <header className="border-b theme-border-subtle px-5 py-4 sm:px-6">
      <h2 className="text-base font-semibold theme-text-primary">{title}</h2>
      {description && <p className="mt-1 text-xs theme-text-muted">{description}</p>}
    </header>
    {children}
  </section>
);

const parseTrendDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatTrendTick = (value) => {
  const date = parseTrendDate(value);
  return date ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(date) : value;
};

const formatTrendTooltipDate = (value) => {
  const date = parseTrendDate(value);
  return date ? new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date) : value;
};

const compactCurrencyFormatter = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return currencyFormatter.format(0);
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-44 rounded-xl border theme-border theme-surface p-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold theme-text-muted">{formatTrendTooltipDate(label)}</p>
      <div className="space-y-2">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-5 text-xs">
            <span className="flex items-center gap-2 theme-text-secondary">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <strong className="font-semibold theme-text-primary">
              {currencyFormatter.format(Number(item.value) || 0)}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReportTable = ({ headers, children, mobileCards }) => (
  <>
    {mobileCards && <div className="divide-y theme-border-subtle md:hidden">{mobileCards}</div>}
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[540px] text-left text-sm">
        <thead className="theme-surface-secondary text-xs uppercase theme-text-muted">
          <tr>{headers.map((header) => <th key={header} className="px-5 py-3 font-semibold">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y theme-border-subtle">{children}</tbody>
      </table>
    </div>
  </>
);

const SummaryCards = ({ items, loading, error }) => (
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
  errors,
  loading,
  canViewSales,
  canViewUdhaar
}) => {
  const udhaarTrend = udhaar?.udhaarTrend || [];
  const outstandingCustomers = (udhaar?.outstandingCustomers || []).slice(0, 5);
  const outstandingCustomerCards = outstandingCustomers.map((customer) => (
    <article key={customer.customerId} className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold theme-text-primary">{customer.name}</p>
        <p className="mt-0.5 text-xs theme-text-muted">{numberFormatter.format(customer.recordCount)} active records</p>
      </div>
      <p className="shrink-0 text-sm font-semibold theme-warning">{currencyFormatter.format(customer.outstanding)}</p>
    </article>
  ));

  return (
  <div className="space-y-8 motion-safe:animate-[report-enter_360ms_ease-out_both]">
    {canViewSales && (
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold theme-text-primary">Sales</h2>
          <p className="mt-1 text-sm theme-text-muted">Sales totals and activity over the last 30 days.</p>
        </div>
        <SummaryCards
          loading={loading}
          error={errors.sales}
          items={[
            { label: "Total sales", value: currencyFormatter.format(sales?.totals?.totalSales || 0), icon: IndianRupee, tone: "theme-primary-soft theme-primary-text" },
            { label: "Collected", value: currencyFormatter.format(sales?.totals?.totalCollected || 0), icon: Wallet, tone: "theme-success-soft theme-success" },
            { label: "This month", value: currencyFormatter.format(sales?.month?.totalSales || 0), icon: ShoppingBag, tone: "theme-info-soft theme-info" }
          ]}
        />
        {errors.sales ? <ErrorState message={errors.sales} /> : (
          <div className="min-w-0">
            <ReportPanel title="Sales trend" description="Daily sales · last 30 days">
              {!sales?.salesTrend?.length ? (
                <EmptyState title="No sales in this period" message="Completed sales will appear here." />
              ) : (
                <div className="h-[250px] w-full px-1 py-4 sm:h-[300px] sm:px-5">
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
          </div>
        )}
      </section>
    )}

    {canViewUdhaar && (
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold theme-text-primary">Udhaar</h2>
          <p className="mt-1 text-sm theme-text-muted">Credit, collections and customers with outstanding balances.</p>
        </div>
        {errors.udhaar ? <ErrorState message={errors.udhaar} /> : (
          <>
            <SummaryCards
              loading={loading}
              error={errors.udhaar}
              items={[
                { label: "Credit issued", value: currencyFormatter.format(udhaar?.totals?.totalUdhaar || 0), icon: IndianRupee, tone: "theme-primary-soft theme-primary-text" },
                { label: "Collected", value: currencyFormatter.format(udhaar?.totals?.totalPaid || 0), icon: Wallet, tone: "theme-success-soft theme-success" },
                { label: "Outstanding", value: currencyFormatter.format(udhaar?.totals?.pending || 0), icon: Users, tone: "theme-warning-soft theme-warning" }
              ]}
            />
            <div className="grid min-w-0 gap-5 xl:grid-cols-5">
              <ReportPanel title="Credit and collection trend" description="Daily totals · last 30 days" className="xl:col-span-3">
                {!udhaarTrend.length ? (
                  <EmptyState title="No Udhaar activity" message="Credit and collection activity will appear here." />
                ) : (
                  <div className="p-3 sm:p-5">
                    <div className="h-[250px] w-full sm:h-[290px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={udhaarTrend}
                          margin={{ top: 10, right: 8, left: -10, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="udhaarIssuedFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--theme-success)" stopOpacity={0.24} />
                              <stop offset="95%" stopColor="var(--theme-success)" stopOpacity={0.015} />
                            </linearGradient>
                            <linearGradient id="udhaarCollectedFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--theme-info)" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="var(--theme-info)" stopOpacity={0.01} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} stroke="var(--theme-chart-grid)" strokeDasharray="2 6" />
                          <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "var(--theme-chart-label)", fontSize: 10 }}
                            tickFormatter={formatTrendTick}
                            tickMargin={10}
                            interval={Math.max(0, Math.ceil(udhaarTrend.length / 6) - 1)}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "var(--theme-chart-muted)", fontSize: 10 }}
                            tickFormatter={compactCurrencyFormatter}
                            width={54}
                          />
                          <Tooltip content={<TrendTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="udhaar"
                            name="Credit issued"
                            stroke="var(--theme-success)"
                            strokeWidth={2.5}
                            fill="url(#udhaarIssuedFill)"
                            activeDot={{ r: 4, fill: "var(--theme-success)", stroke: "var(--theme-surface)", strokeWidth: 2 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="paid"
                            name="Collected"
                            stroke="var(--theme-info)"
                            strokeWidth={2.5}
                            fill="url(#udhaarCollectedFill)"
                            activeDot={{ r: 4, fill: "var(--theme-info)", stroke: "var(--theme-surface)", strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t theme-border-subtle pt-3">
                      {[
                        { label: "Credit issued", tone: "bg-[var(--theme-success)]" },
                        { label: "Payments collected", tone: "bg-[var(--theme-info)]" }
                      ].map(({ label, tone }) => (
                        <span key={label} className="inline-flex items-center gap-2 text-xs font-medium theme-text-secondary">
                          <span className={`h-2 w-2 rounded-full ${tone}`} />
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </ReportPanel>
              <ReportPanel title="Top outstanding balances" description="Top 5 active customers by amount due" className="xl:col-span-2">
                {outstandingCustomers.length ? (
                  <ReportTable headers={["Customer", "Outstanding", "Records"]} mobileCards={outstandingCustomerCards}>
                    {outstandingCustomers.map((customer) => (
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
};

const tooltipStyle = {
  border: "1px solid var(--theme-border)",
  borderRadius: "10px",
  backgroundColor: "var(--theme-chart-tooltip)",
  color: "var(--theme-text-primary)"
};

export default BusinessReports;
