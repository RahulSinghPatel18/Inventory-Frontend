const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md"
}) => {
  if (!isOpen) {
    return null;
  }

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

      {/* Overlay */}
      <div
        className="absolute inset-0 theme-overlay"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative
          z-10
          w-full
          ${sizes[size]}
          max-h-[90vh]
          overflow-y-auto
          rounded-2xl
          theme-surface
          theme-shadow-lg
        `}
      >

        {/* Header */}
        <div className="flex items-center justify-between border-b theme-border-subtle px-6 py-4">

          <h2 className="text-lg font-semibold theme-text-primary">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-xl theme-text-muted theme-hover-text-secondary cursor-pointer"
          >
            ✕
          </button>

        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Modal;