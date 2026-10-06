import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TriangleAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";

import Button from "../common/Button";
import Input from "../common/Input";
import Modal from "../common/Modal";
import useAuth from "../../hooks/useAuth";

const OrganizationDangerZone = () => {
  const { user, deleteOrganization, logout } = useAuth();
  const navigate = useNavigate();
  const organizationName = user?.organizationName || "";
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationName, setConfirmationName] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const [deleting, setDeleting] = useState(false);

  if (!isAdmin) return null;

  const handleDelete = async (event) => {
    event.preventDefault();
    if (confirmationName !== organizationName || confirmationText !== "DELETE") return;
    setDeleting(true);
    try {
      await deleteOrganization(confirmationName, confirmationText);
      logout();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete organization.");
      setDeleting(false);
    }
  };

  return <>
    <section id="danger-zone" className="scroll-mt-6 rounded-2xl border border-[var(--theme-danger)]/40 theme-surface p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg theme-danger-soft theme-danger"><TriangleAlert size={19} /></span>
        <div>
          <h2 className="text-base font-semibold theme-danger">Danger zone</h2>
          <p className="mt-1 text-sm theme-text-muted">Permanently remove this organization and its business data.</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm theme-text-secondary">This deletes all members, products, categories, stock history, customers, sales, Udhaar, and payment records in this organization. This cannot be undone.</p>
        <Button variant="danger" onClick={() => { setConfirmationName(""); setConfirmationText(""); setIsOpen(true); }} className="shrink-0">
          <Trash2 size={16} />
          Delete organization
        </Button>
      </div>
    </section>
    <Modal isOpen={isOpen} onClose={() => !deleting && setIsOpen(false)} title="Permanently delete organization" size="md">
      <form onSubmit={handleDelete} className="space-y-4">
        <p className="text-sm theme-text-secondary">This permanently removes <strong>{organizationName}</strong> and all organization members and data. This action cannot be undone.</p>
        <Input label={`Type "${organizationName}" to confirm`} name="confirmationName" value={confirmationName} onChange={(event) => setConfirmationName(event.target.value)} required disabled={deleting} />
        <Input label='Type DELETE to confirm' name="confirmationText" value={confirmationText} onChange={(event) => setConfirmationText(event.target.value)} required disabled={deleting} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" disabled={deleting} onClick={() => setIsOpen(false)}>Keep organization</Button>
          <Button type="submit" variant="danger" loading={deleting} disabled={confirmationName !== organizationName || confirmationText !== "DELETE"}>Delete permanently</Button>
        </div>
      </form>
    </Modal>
  </>;
};

export default OrganizationDangerZone;
