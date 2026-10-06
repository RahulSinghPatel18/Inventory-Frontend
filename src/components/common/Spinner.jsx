
const Spinner = ({ size = "md", label = "Loading" }) => {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-11 w-11 border-[3px]"
  };

  return (
    <span
      role="status"
      aria-label={label}
      className={`theme-spinner inline-block animate-spin rounded-full border-solid border-r-transparent ${sizes[size] || sizes.md}`}
    />
  );
};

export default Spinner;
