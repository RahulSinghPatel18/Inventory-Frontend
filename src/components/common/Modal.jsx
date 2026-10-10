import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md"
}) => {
  const titleId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousFocus = document.activeElement;
    const initialFocus =
      dialogRef.current?.querySelector("[data-autofocus='true']") || dialogRef.current;
    initialFocus?.focus({ preventScroll: true });
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCloseRef.current?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        className="theme-modal-backdrop absolute inset-0 theme-overlay"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`theme-modal-enter relative z-10 w-[calc(100vw-2rem)] max-w-full ${sizes[size]} max-h-[90dvh] overflow-y-auto rounded-2xl theme-surface theme-shadow-lg sm:w-full`}
      >
        <div className="flex items-center justify-between gap-4 border-b theme-border-subtle px-5 py-4 sm:px-6">
          <h2 id={titleId} className="text-lg font-semibold theme-text-primary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-text-muted transition theme-hover-neutral theme-hover-text-primary"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;