import { useEffect, useState } from "react";
import categoryService from "../services/categoryService";

const useCategories = (params = { page: 1, limit: 100 }) => {
  const { search, sort, page, limit } = params;
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await categoryService.getCategories({ search, sort, page, limit });

        if (active) {
          setCategories(data.categories || []);
          setPagination({
            page: data.page,
            limit: data.limit,
            totalCategories: data.totalCategories,
            totalPages: data.totalPages,
            hasNextPage: data.hasNextPage,
            hasPreviousPage: data.hasPreviousPage
          });
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message || "Failed to load categories"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      active = false;
    };
  }, [reloadKey, search, sort, page, limit]);

  return {
    categories,
    pagination,
    loading,
    error,
    refetch: () => setReloadKey((key) => key + 1)
  };
};

export default useCategories;