import { useState } from "react";
import { toast } from "react-toastify";

import Input from "../common/Input";
import Button from "../common/Button";
import Select from "../common/Select";
import { isPositiveNumber, isRequired } from "../../utils/validators";

const getCategoryId = (category) =>
  typeof category === "object" && category !== null
    ? String(category._id ?? "")
    : category ?? "";

const getCategoryName = (category) =>
  typeof category === "object" && category !== null
    ? category.name ?? ""
    : category ?? "";

const getInitialFormData = (product) => ({
  name: product?.name ?? "",
  price: product?.price ?? "",
  quantity: product?.quantity ?? "",
  category: getCategoryId(product?.category)
});

const ProductForm = ({
  product,
  onSubmit,
  loading,
  categories = [],
  categoriesLoading = false,
  categoriesError = "",
  onRetryCategories
}) => {
  const [formData, setFormData] = useState(() => getInitialFormData(product));
  const productCategoryId = getCategoryId(product?.category);
  const productCategoryName = getCategoryName(product?.category);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const name = formData.name.trim();
    const price = Number(formData.price);
    const quantity = Number(formData.quantity);

    if (!isRequired(name)) {
      toast.error("Product name is required");
      return;
    }
    if (!isRequired(formData.price) || !isPositiveNumber(price)) {
      toast.error("Enter a valid price of 0 or more");
      return;
    }
    if (
      !isRequired(formData.quantity) ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      toast.error("Enter a whole-number quantity of 0 or more");
      return;
    }
    if (!isRequired(formData.category)) {
      toast.error("Select a category");
      return;
    }

    onSubmit({
      name,
      price,
      quantity,
      category: formData.category
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >

      <Input
        label="Product Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter product name"
        required
        disabled={loading}
      />

      <Input
        label="Price"
        name="price"
        type="number"
        step="any"
        value={formData.price}
        onChange={handleChange}
        placeholder="Enter price"
        required
        disabled={loading}
      />

      <Input
        label="Quantity"
        name="quantity"
        type="number"
        value={formData.quantity}
        onChange={handleChange}
        placeholder="Enter quantity"
        min={0}
        step={1}
        required
        disabled={loading}
      />

      <Select
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        placeholder={categoriesLoading ? "Loading categories..." : "Select a category"}
        options={[
          ...categories.map((category) => ({
            value: category._id,
            label: category.name
          })),
          ...(productCategoryId && !categories.some((category) => category._id === productCategoryId)
            ? [{ value: productCategoryId, label: productCategoryName }]
            : [])
        ]}
        error={categoriesError}
        required
        disabled={loading || categoriesLoading || (!categories.length && !product?.category)}
      />

      {categoriesError && onRetryCategories && (
        <button
          type="button"
          onClick={onRetryCategories}
          className="text-sm font-medium theme-primary-text theme-hover-text-primary"
        >
          Retry loading categories
        </button>
      )}

      {!categoriesLoading && !categoriesError && categories.length === 0 && !product?.category && (
        <p className="text-sm theme-text-muted">Create a category before adding a product.</p>
      )}

      <Button
        type="submit"
        loading={loading}
        loadingText={product ? "Updating product..." : "Saving product..."}
        className="w-full"
      >
        {product ? "Update " : "Create "}
      </Button>

    </form>
  );
};

export default ProductForm;