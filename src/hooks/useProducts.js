import { useCallback, useEffect, useState } from "react";
import productService from "../services/productService";

const useProducts = (params = {}) => {
  const { name, category, sortBy, sortOrder, page } = params;
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await productService.getProducts({ name, category, sortBy, sortOrder, page });
        if (active) {
          setProducts(data.products);
          setPagination(data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
            (requestError.request
              ? "Could not connect to the server. Check your connection and try again."
              : requestError.message) ||
            "Failed to fetch products"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      active = false;
    };
  }, [name, category, sortBy, sortOrder, page, reloadKey]);

  return {
    products,
    pagination,
    loading,
    error,
    refetch
  };
};

export default useProducts;