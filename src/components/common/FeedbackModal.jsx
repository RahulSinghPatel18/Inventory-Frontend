import { CheckCircle2, CircleAlert } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";

const FeedbackModal = ({
  isOpen,
  onClose,
  onAction,
  type = "success",
  title,
  message,
  actionLabel = "Close"
}) => {
  const isSuccess = type === "success";
  const Icon = isSuccess ? CheckCircle2 : CircleAlert;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${isSuccess ? "theme-success-soft theme-success" : "theme-danger-soft theme-danger"}`}>
          <Icon size={28} aria-hidden="true" />
        </span>
        <p role={isSuccess ? "status" : "alert"} className="mt-4 text-sm leading-6 theme-text-secondary">
          {message}
        </p>
        <Button onClick={onAction || onClose} className="mt-6 w-full sm:w-auto">
          {actionLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default FeedbackModal;
