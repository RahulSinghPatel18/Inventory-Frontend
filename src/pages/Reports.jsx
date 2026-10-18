import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { toast } from "../utils/appToast";

import Layout from "../components/layout/Layout";
import ReportFilters from "../components/reports/ReportFilters";
import ReportVisualizations from "../components/reports/ReportVisualizations";
import BusinessReports from "../components/reports/BusinessReports";
import ExportMenu from "../components/common/ExportMenu";
import useBusinessReports from "../hooks/useBusinessReports";
import useInventoryReport, { getInitialFilters } from "../hooks/useInventoryReport";
import useAuth from "../hooks/useAuth";
import { hasPermission } from "../utils/permissions";

const Reports = () => {
  const { user } = useAuth();
  const canViewProducts = hasPermission(user, "reports.products");
  const canViewStock = hasPermission(user, "reports.stock");
  const canViewSales = hasPermission(user, "reports.sales");
  const canViewUdhaar = hasPermission(user, "reports.udhaar");
  const canViewProductDetails = hasPermission(user, "products.details");
  const reportAreas = [
    canViewProducts && "Products",
    canViewStock && "Stock",
    canViewSales && "Sales",
    canViewUdhaar && "Udhaar"
  ].filter(Boolean);
  const [draftFilters, setDraftFilters] = useState(getInitialFilters);
  const [filters, setFilters] = useState(getInitialFilters);
  const report = useInventoryReport(filters, { canViewProducts, canViewStock });
  const businessReport = useBusinessReports({ canViewSales, canViewUdhaar });

  const updateDraftFilter = (key, value) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    if (
      draftFilters.startDate &&
      draftFilters.endDate &&
      draftFilters.startDate > draftFilters.endDate
    ) {
      toast.error("End date must be on or after the start date");
      return;
    }
    setFilters({ ...draftFilters });
  };

  const resetFilters = () => {
    const initialFilters = getInitialFilters();
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-3 rounded-2xl border theme-border theme-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl theme-primary-soft theme-primary-text">
              <BarChart3 size={21} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold theme-text-primary sm:text-2xl">Reports</h1>
              <p className="mt-1 text-sm theme-text-muted">Key business and inventory metrics</p>
            </div>
          </div>
          <div className="flex justify-end">
            {reportAreas.length > 0 && (
              <ExportMenu dataset="reports" title="Reports" filters={filters} />
            )}
          </div>
        </header>

        {(canViewProducts || canViewStock) && <ReportFilters
          filters={draftFilters}
          categories={report.categories}
          categoryError={report.categoryError}
          loading={report.loading}
          onChange={updateDraftFilter}
          onApply={applyFilters}
          onReset={resetFilters}
          canViewProducts={canViewProducts}
          canViewStock={canViewStock}
        />}

        {(canViewProducts || canViewStock) && (
          <ReportVisualizations
            loading={report.loading}
            productsError={report.productsError}
            historyError={report.historyError}
            summary={report.summary}
            stockOverview={report.stockOverview}
            lowStockProducts={report.lowStockProducts}
            canViewProducts={canViewProducts}
            canViewStock={canViewStock}
            canViewProductDetails={canViewProductDetails}
          />
        )}

        {(canViewSales || canViewUdhaar) && (
          <BusinessReports
            sales={businessReport.data.sales}
            udhaar={businessReport.data.udhaar}
            errors={businessReport.errors}
            loading={businessReport.loading}
            canViewSales={canViewSales}
            canViewUdhaar={canViewUdhaar}
          />
        )}

        {reportAreas.length === 0 && (
          <section className="rounded-2xl border theme-border theme-surface p-5 shadow-sm">
            <h2 className="text-sm font-semibold theme-text-primary">No report data access</h2>
            <p className="mt-1 text-sm leading-5 theme-text-muted">
              Ask your administrator to enable Product, Stock, Sales, or Udhaar reports for your account.
            </p>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
