import Modal from "./Modal";
import Button from "./Button";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  children,
  loading = false,
  confirmText = "Confirm",
  loadingText = "Deleting..."
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <p className="text-sm theme-text-secondary">
        {message}
      </p>

      {children}

      <div className="sticky bottom-0 -mx-4 -mb-4 flex flex-col-reverse gap-3 border-t theme-border-subtle theme-surface p-4 sm:-mx-6 sm:-mb-6 sm:flex-row sm:justify-end sm:p-6">

        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>

        <Button
          variant="danger"
          onClick={onConfirm}
          loading={loading}
          loadingText={loadingText}
          className="w-full sm:w-auto"
        >
          {confirmText}
        </Button>

      </div>
    </Modal>
  );
};

export default ConfirmDialog;