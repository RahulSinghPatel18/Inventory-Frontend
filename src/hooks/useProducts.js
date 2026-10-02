import { useCallback, useEffect, useState } from "react";
import productService from "../services/productService";

const useProducts = (params = {}) => {
  const { name, category, sort, page } = params;
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getProducts = useCallback(async (
    customParams = { name, category, sort, page },
    isActive = () => true
  ) => {
    if (!isActive()) return;

    try {
      setLoading(true);
      setError("");

      const data = await productService.getProducts(customParams);

      if (!isActive()) return;

      setProducts(data.products);
      setPagination(data);
    } catch (error) {
      if (isActive()) {
        setError(
          error.response?.data?.message ||
          (error.request
            ? "Could not connect to the server. Check your connection and try again."
            : error.message) ||
          "Failed to fetch products"
        );
      }
    } finally {
      if (isActive()) setLoading(false);
    }
  }, [name, category, sort, page]);

  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => getProducts(
      { name, category, sort, page },
      () => active
    ));

    return () => {
      active = false;
    };
  }, [getProducts, name, category, sort, page]);

  return {
    products,
    pagination,
    loading,
    error,
    getProducts
  };
};

export default useProducts;