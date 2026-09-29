import Modal from "../common/Modal";
import ProductForm from "./ProductForm";

const ProductModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  product
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
      />
    </Modal>
  );
};

export default ProductModal;