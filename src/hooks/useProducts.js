import { useCallback, useEffect, useState } from "react";
import productService from "../services/productService";

const useProducts = (params = {}) => {
  const { name, category, sort, page, limit } = params;
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getProducts = useCallback(async (
    customParams = { name, category, sort, page, limit },
    isActive = () => true
  ) => {
    if (!isActive()) return;

    try {
      setLoading(true);
      setError("");

      const data = await productService.getProducts(customParams);

      if (!isActive()) return;

      setProducts(data.products);

      setPagination({
        page: data.page,
        limit: data.limit,
        totalProducts: data.totalProducts,
        totalPages: data.totalPages,
        hasNextPage: data.hasNextPage,
        hasPreviousPage: data.hasPreviousPage
      });
    } catch (error) {
      if (isActive()) {
        setError(
          error.response?.data?.message ||
          "Failed to fetch products"
        );
      }
    } finally {
      if (isActive()) setLoading(false);
    }
  }, [name, category, sort, page, limit]);

  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => getProducts(
      { name, category, sort, page, limit },
      () => active
    ));

    return () => {
      active = false;
    };
  }, [getProducts, name, category, sort, page, limit]);

  return {
    products,
    pagination,
    loading,
    error,
    getProducts
  };
};

export default useProducts;