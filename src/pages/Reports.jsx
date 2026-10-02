import { useState } from "react";
import { toast } from "react-toastify";

import Layout from "../components/layout/Layout";
import ReportFilters from "../components/reports/ReportFilters";
import ReportVisualizations from "../components/reports/ReportVisualizations";
import useInventoryReport, { getInitialFilters } from "../hooks/useInventoryReport";

const Reports = () => {
  const [draftFilters, setDraftFilters] = useState(getInitialFilters);
  const [filters, setFilters] = useState(getInitialFilters);
  const report = useInventoryReport(filters);

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
          <p className="mt-1 text-sm theme-text-muted">Inventory performance and stock movement</p>
        </header>

        <ReportFilters
          filters={draftFilters}
          categories={report.categories}
          categoryError={report.categoryError}
          loading={report.loading}
          onChange={updateDraftFilter}
          onApply={applyFilters}
          onReset={resetFilters}
        />

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
        />
      </div>
    </Layout>
  );
};

export default Reports;
