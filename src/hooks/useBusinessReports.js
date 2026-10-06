import { useEffect, useState } from "react";
import salesService from "../services/salesService";
import udhaarService from "../services/udhaarService";

const useBusinessReports = ({ canViewSales, canViewUdhaar }) => {
  const [data, setData] = useState({ sales: null, udhaar: null, customers: null });
  const [errors, setErrors] = useState({ sales: "", udhaar: "", customers: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const loadReports = async () => {
      setLoading(true);
      const [salesResult, udhaarResult, customerResult] = await Promise.all([
        canViewSales
          ? salesService.getAnalytics().then((value) => ({ value }), (error) => ({ error }))
          : Promise.resolve(null),
        canViewUdhaar
          ? udhaarService.getStats().then((value) => ({ value }), (error) => ({ error }))
          : Promise.resolve(null),
        canViewUdhaar
          ? udhaarService.getCustomerStats().then((value) => ({ value }), (error) => ({ error }))
          : Promise.resolve(null)
      ]);
      if (!active) return;

      const results = { sales: salesResult, udhaar: udhaarResult, customers: customerResult };
      setData((current) => Object.fromEntries(
        Object.entries(results).map(([key, result]) => [
          key,
          result?.value ?? current[key]
        ])
      ));
      setErrors(Object.fromEntries(
        Object.entries(results).map(([key, result]) => [
          key,
          result?.error?.response?.data?.message ||
            (result?.error ? `Unable to load ${key} report.` : "")
        ])
      ));
      setLoading(false);
    };

    loadReports();
    return () => {
      active = false;
    };
  }, [canViewSales, canViewUdhaar]);

  return { data, errors, loading };
};

export default useBusinessReports;
