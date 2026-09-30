import { useEffect, useState } from "react";

import Input from "../common/Input";
import Button from "../common/Button";
import Select from "../common/Select";

const ProductForm = ({
  product,
  onSubmit,
  loading,
  categories = [],
  categoriesLoading = false,
  categoriesError = "",
  onRetryCategories
}) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    category: ""
  });

useEffect(() => {
  if (product) {
    setFormData({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      category: product.category
    });
  } else {
    setFormData({
      name: "",
      price: "",
      quantity: "",
      category: ""
    });
  }
}, [product]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      name: formData.name,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
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
            value: category.name,
            label: category.name
          })),
          ...(product?.category && !categories.some((category) => category.name === product.category)
            ? [{ value: product.category, label: product.category }]
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
        className="w-full"
      >
        {product ? "Update " : "Create "}
      </Button>

    </form>
  );
};

export default ProductForm;