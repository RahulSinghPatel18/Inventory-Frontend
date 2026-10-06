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

      <div className="mt-6 flex justify-end gap-3">

        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          variant="danger"
          onClick={onConfirm}
          loading={loading}
          loadingText={loadingText}
        >
          {confirmText}
        </Button>

      </div>
    </Modal>
  );
};

export default ConfirmDialog;