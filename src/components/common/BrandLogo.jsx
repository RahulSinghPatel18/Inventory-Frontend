

const sizeClasses = {
  sm: "text-base tracking-[-0.04em]",
  md: "text-[1.3rem] tracking-[-0.045em]",
  lg: "text-[1.45rem] tracking-[-0.05em]"
};

const BrandLogo = ({ size = "md", className = "", showMark = true }) => (
  <span
    aria-label="MYStockHub"
    className={`inline-flex items-center ${showMark ? "gap-2.5" : ""} whitespace-nowrap font-extrabold leading-none ${sizeClasses[size]} ${className}`}
  >
    <span className="inline-flex items-baseline tracking-[-0.045em]">
      <span className="brand-logo-primary">MY</span>
      <span className="brand-logo-accent">Stock</span>
      <span className="brand-logo-primary">Hub</span>
    </span>
  </span>
);

export default BrandLogo;
