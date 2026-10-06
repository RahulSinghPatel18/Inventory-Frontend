import { useEffect, useState } from "react";
import categoryService from "../services/categoryService";

const useCategories = (params = {}) => {
  const { search, sort, sortBy, sortOrder, page } = params;
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

        const data = await categoryService.getCategories({ search, sort, sortBy, sortOrder, page });

        if (active) {
          setCategories(data.categories);
          setPagination(data);
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
  }, [reloadKey, search, sort, sortBy, sortOrder, page]);

  return {
    categories,
    pagination,
    loading,
    error,
    refetch: () => setReloadKey((key) => key + 1)
  };
};

export default useCategories;