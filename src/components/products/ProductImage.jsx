import { useState } from "react";
import { Package } from "lucide-react";

const ProductImage = (props) => (
  <ProductImageContent key={props.src || "missing"} {...props} />
);

const ProductImageContent = ({ src, alt, className = "" }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-xl theme-primary-soft theme-primary-text ${className}`}
        aria-label={alt || "Product image unavailable"}
      >
        <Package size={20} aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ""}
      className={`shrink-0 rounded-xl object-cover ${className}`}
      onError={() => setHasError(true)}
    />
  );
};

export default ProductImage;
