import Modal from "../common/Modal";
import ProductForm from "./ProductForm";

const ProductModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  product,
  categories,
  categoriesLoading,
  categoriesError,
  onRetryCategories
}) => {
  return (
    <Modal 
      isOpen={isOpen}
      onClose={onClose}
      title={
        product
          ? "Update Product"
          : "Create Product"
      }
    >
      <ProductForm
        product={product}
        onSubmit={onSubmit}
        loading={loading}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        onRetryCategories={onRetryCategories}
      />
    </Modal>
  );
};

export default ProductModal;