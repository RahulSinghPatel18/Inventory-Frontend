import { useEffect, useState } from "react";
import categoryService from "../services/categoryService";

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await categoryService.getCategories();

        if (active) {
          setCategories(data.categories || []);
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
  }, [reloadKey]);

  return {
    categories,
    loading,
    error,
    refetch: () => setReloadKey((key) => key + 1)
  };
};

export default useCategories;