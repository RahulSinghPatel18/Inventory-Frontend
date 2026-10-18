import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import dataExportService from "../../services/dataExportService";

const ExportMenu = ({ dataset, title, filters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const [downloading, setDownloading] = useState("");

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const download = async (format) => {
    setDownloading(format);
    try {
      const file = dataset === "reports"
        ? await dataExportService.downloadReports(format, filters)
        : await dataExportService.downloadDataset(dataset, format);
      if (!(file instanceof Blob) || file.size === 0) {
        throw new Error("The export service returned an empty file.");
      }
      const extension = dataset === "reports" && format === "csv"
        ? "zip"
        : format === "xlsx" ? "xlsx" : "csv";
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mystockhub-${dataset}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setIsOpen(false);
      toast.success(`${title} export downloaded.`);
    } catch (error) {
      let message = error.response?.data?.message;
      if (!message && error.response?.data instanceof Blob) {
        try {
          message = JSON.parse(await error.response.data.text()).message;
        } catch {
          message = "";
        }
      }
      toast.error(message || error.message || `Unable to export ${title.toLowerCase()}.`);
    } finally {
      setDownloading("");
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
        className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border theme-border theme-surface px-3 py-1.5 text-sm font-medium theme-text-secondary transition-colors theme-hover-neutral focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)]"
      >
        <Download size={16} aria-hidden="true" />
        Export
        <ChevronDown size={15} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {isOpen && (
        <div
          id={menuId}
          role="group"
          aria-label={`${title} export formats`}
          className="theme-popover-enter absolute right-0 z-30 mt-2 w-36 origin-top-right overflow-hidden rounded-xl border theme-border theme-surface p-1 shadow-lg"
        >
          <div className="space-y-0.5">
            <button
              type="button"
              disabled={!!downloading}
              onClick={() => download("xlsx")}
              className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 text-left text-sm font-medium theme-text-secondary transition theme-hover-surface disabled:cursor-wait disabled:opacity-60"
            >
              <FileSpreadsheet size={16} className="shrink-0 theme-success" aria-hidden="true" />
              {downloading === "xlsx" ? "Preparing…" : "Excel"}
            </button>
            <button
              type="button"
              disabled={!!downloading}
              onClick={() => download("csv")}
              className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 text-left text-sm font-medium theme-text-secondary transition theme-hover-surface disabled:cursor-wait disabled:opacity-60"
            >
              <FileText size={16} className="shrink-0 theme-text-muted" aria-hidden="true" />
              {downloading === "csv" ? "Preparing…" : dataset === "reports" ? "CSV ZIP" : "CSV"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
