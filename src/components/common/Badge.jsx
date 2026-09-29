const Badge = ({
children,
variant = "default",
className = ""
}) => {
const variants = {
default: "theme-neutral-soft theme-text-secondary",
success: "theme-success-soft theme-success border theme-border-subtle",
warning: "theme-warning-soft theme-warning border theme-border-subtle",
danger: "theme-danger-soft theme-danger border theme-border-subtle",
info: "theme-info-soft theme-info border theme-border-subtle"
};

return (
<span
className={`         inline-flex
        items-center
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold
        ${variants[variant]}
        ${className}
      `}
>
{children} </span>
);
};

export default Badge;
