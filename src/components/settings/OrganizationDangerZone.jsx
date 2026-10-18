import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, FileSpreadsheet, FileText, TriangleAlert, Trash2 } from "lucide-react";
import { toast } from "../../utils/appToast";

import Button from "../common/Button";
import Input from "../common/Input";
import Modal from "../common/Modal";
import useAuth from "../../hooks/useAuth";
import backupService from "../../services/backupService";

const OrganizationDangerZone = () => {
  const { user, deleteOrganization, logout } = useAuth();
  const navigate = useNavigate();
  const organizationName = user?.organizationName || "";
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationName, setConfirmationName] = useState("");
  const [backupDownloaded, setBackupDownloaded] = useState(false);
  const [backupFormat, setBackupFormat] = useState("xlsx");
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isAdmin) return null;

  const handleDelete = async (event) => {
    event.preventDefault();
    if (!backupDownloaded || confirmationName !== organizationName) return;
    setDeleting(true);
    try {
      await deleteOrganization(confirmationName);
      logout();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete organization.");
      setDeleting(false);
    }
  };

  const handleBackupDownload = async () => {
    setDownloading(true);
    try {
      const archive = await backupService.downloadFullBackup(backupFormat);
      if (!(archive instanceof Blob) || archive.size < 4) {
        throw new Error("The backup service returned an invalid archive.");
      }
      const signature = new Uint8Array(await archive.slice(0, 4).arrayBuffer());
      if (signature[0] !== 0x50 || signature[1] !== 0x4b) {
        throw new Error("The backup service returned an invalid archive.");
      }
      const url = URL.createObjectURL(archive);
      const link = document.createElement("a");
      link.href = url;
      link.download = backupFormat === "xlsx"
        ? "mystockhub-full-backup.xlsx"
        : "mystockhub-full-backup-csv.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setBackupDownloaded(true);
      toast.success("Your full organization backup has been downloaded.");
    } catch (error) {
      const responseBody = error.response?.data;
      let message = responseBody?.message;
      if (!message && responseBody instanceof Blob) {
        try {
          message = JSON.parse(await responseBody.text()).message;
        } catch {
          message = "";
        }
      }
      toast.error(message || error.message || "Unable to download the organization backup.");
    } finally {
      setDownloading(false);
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
        <Button variant="danger" onClick={() => { setConfirmationName(""); setBackupDownloaded(false); setIsOpen(true); }} className="shrink-0">
          <Trash2 size={16} />
          Delete organization
        </Button>
      </div>
    </section>
    <Modal
      isOpen={isOpen}
      onClose={() => !deleting && !downloading && setIsOpen(false)}
      title="Permanently delete organization"
      size="md"
      footer={(
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" disabled={deleting || downloading} onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
            Keep organization
          </Button>
          <Button
            type="submit"
            form="delete-organization-form"
            variant="danger"
            loading={deleting}
            disabled={!backupDownloaded || confirmationName !== organizationName}
            className="w-full whitespace-normal sm:w-auto"
          >
            Permanently Delete Organization
          </Button>
        </div>
      )}
    >
      <form id="delete-organization-form" onSubmit={handleDelete} className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border theme-danger-border theme-danger-soft p-3">
          <TriangleAlert size={19} className="mt-0.5 shrink-0 theme-danger" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold theme-danger">This action is permanent</p>
            <p className="mt-1 text-sm leading-5 theme-danger">
              Download a full archive of your inventory and sales data before deleting this organization.
            </p>
          </div>
        </div>

        <section aria-labelledby="backup-step-title" className="space-y-2">
          <div>
            <h3 id="backup-step-title" className="text-sm font-semibold theme-text-primary">1. Choose and download a backup</h3>
            <p className="mt-1 text-xs leading-5 theme-text-muted">
              Includes products, categories, sales, stock movements, payments, customers, notifications, and organization members.
            </p>
          </div>
          <fieldset className="grid gap-2 sm:grid-cols-2">
            <legend className="sr-only">Choose backup format</legend>
          {[
            { value: "xlsx", title: "Excel workbook", icon: FileSpreadsheet },
            { value: "csv", title: "CSV files (ZIP)",  icon: FileText }
          ].map(({ value, title, detail, icon: Icon }) => (
            <label
              key={value}
              className={`flex min-w-0 cursor-pointer items-start gap-2 rounded-xl border p-3 transition ${backupFormat === value ? "theme-primary-border theme-primary-soft" : "theme-border theme-hover-surface"}`}
            >
              <input
                type="radio"
                name="backupFormat"
                value={value}
                checked={backupFormat === value}
                disabled={downloading || deleting}
                onChange={() => {
                  setBackupFormat(value);
                  setBackupDownloaded(false);
                }}
                className="mt-1 h-4 w-4 shrink-0 accent-emerald-700"
              />
              <Icon size={17} className="mt-0.5 shrink-0 theme-primary-text" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block break-words text-sm font-semibold leading-5 theme-text-primary">
                  {title}{value === "xlsx" ? <span className="font-medium theme-text-muted"> · Recommended</span> : null}
                </span>
                <span className="mt-0.5 block text-xs leading-4 theme-text-muted">{detail}</span>
              </span>
            </label>
          ))}
          </fieldset>
          <Button
            type="button"
            variant={backupDownloaded ? "secondary" : "outline"}
            loading={downloading}
            loadingText="Preparing your backup..."
            disabled={deleting}
            onClick={handleBackupDownload}
            className="w-full"
          >
            {backupDownloaded
              ? <><CheckCircle2 size={17} /> {backupFormat === "xlsx" ? "Excel" : "CSV"} backup downloaded · Download again</>
              : <>Download {backupFormat === "xlsx" ? "Excel workbook" : "CSV ZIP"} backup</>}
          </Button>
        </section>

        <section aria-labelledby="delete-confirmation-title" className="space-y-2 border-t theme-border-subtle pt-3">
          <div>
            <h3 id="delete-confirmation-title" className="text-sm font-semibold theme-text-primary">2. Confirm organization name</h3>
            <p className="mt-1 text-xs leading-5 theme-text-muted">
              Type the organization name exactly as shown to enable permanent deletion.
            </p>
          </div>
          <Input
            label="Organization name"
            name="confirmationName"
            value={confirmationName}
            onChange={(event) => setConfirmationName(event.target.value)}
            placeholder={organizationName}
            required
            disabled={deleting}
            autoComplete="off"
          />
        </section>
      </form>
    </Modal>
  </>;
};

export default OrganizationDangerZone;
