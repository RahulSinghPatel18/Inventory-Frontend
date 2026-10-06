import { useState } from "react";
import { toast } from "sonner";

import Layout from "../components/layout/Layout";
import ReportFilters from "../components/reports/ReportFilters";
import ReportVisualizations from "../components/reports/ReportVisualizations";
import BusinessReports from "../components/reports/BusinessReports";
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
        <header>
          <h1 className="text-2xl font-bold theme-text-primary">Reports</h1>
          <p className="mt-1 text-sm theme-text-muted">Inventory, sales, collections and customer balances</p>
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

        {(canViewSales || canViewUdhaar) && (
          <BusinessReports
            sales={businessReport.data.sales}
            udhaar={businessReport.data.udhaar}
            customers={businessReport.data.customers}
            errors={businessReport.errors}
            loading={businessReport.loading}
            canViewSales={canViewSales}
            canViewUdhaar={canViewUdhaar}
          />
        )}

        {(canViewProducts || canViewStock) && (
          <ReportVisualizations
            loading={report.loading}
            productsError={report.productsError}
            historyError={report.historyError}
            summary={report.summary}
            categoryData={report.categoryData}
            stockOverview={report.stockOverview}
            topProducts={report.topProducts}
            lowStockProducts={report.lowStockProducts}
            recentActivity={report.recentActivity}
            formatDate={report.formatDate}
            canViewProducts={canViewProducts}
            canViewStock={canViewStock}
            canViewProductDetails={canViewProductDetails}
          />
        )}
      </div>
    </Layout>
  );
};

export default Reports;
