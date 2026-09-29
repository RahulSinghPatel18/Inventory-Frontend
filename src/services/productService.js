import api from "./api";

const productService = {
  createProduct: async (productData) => {
    const response = await api.post( "/products/Create", productData );
     return response.data;
  },

  getProducts: async (params = {}) => {
    const response = await api.get(
      "/products/GetAll", {  params } );

    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get( `/products/GetById/${id}` );

    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/Update/${id}`, productData);

    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete( `/products/Delete/${id}`);

    return response.data;
  }
};

export default productService;