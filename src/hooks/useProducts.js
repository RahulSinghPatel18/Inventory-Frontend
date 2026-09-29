import { useEffect, useState } from "react";
import productService from "../services/productService";

const useProducts = (params = {}) => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getProducts = async (customParams = params) => {
    try {
      setLoading(true);
      setError("");

      const data = await productService.getProducts(customParams);

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
      setError(
        error.response?.data?.message ||
        "Failed to fetch products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts(params);
  }, [
    params.name,
    params.category,
    params.sort,
    params.page
  ]);

  return {
    products,
    pagination,
    loading,
    error,
    getProducts
  };
};

export default useProducts;