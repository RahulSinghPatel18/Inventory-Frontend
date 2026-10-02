const Card = ({ children, className = "" }) => {
return (
<div
className={ `rounded-2xl border theme-border theme-surface-glass theme-shadow ${className}` }
>
{children}
</div>
);
};

export default Card;