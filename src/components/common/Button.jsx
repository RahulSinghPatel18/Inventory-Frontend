const Button = ({
children,
type = "button",
variant = "primary",
loading = false,
loadingText = "Loading...",
disabled = false,
onClick,
className = ""
}) => {
const variants = {
primary:
"theme-primary-action-bg text-white shadow-sm hover:shadow-md",
secondary:
"theme-neutral-soft theme-text-primary theme-hover-neutral",
danger:
"theme-danger-bg text-white shadow-sm hover:shadow-md",
outline:
"border theme-border theme-surface theme-text-secondary shadow-sm theme-hover-neutral"
};

return (
<button
type={type}
onClick={onClick}
disabled={disabled || loading}
aria-busy={loading || undefined}
className={`         inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        px-4
        min-h-11
        py-2
        text-sm
        font-semibold
        transition-all
        duration-200
        active:scale-[0.98]
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${variants[variant]}
        ${className}
      `}
>
{loading && ( <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
)}


  {loading ? loadingText : children}
</button>


);
};

export default Button;
