import { useState } from "react";
import { Bug, CircleHelp, Lightbulb, Send } from "lucide-react";
import { toast } from "../../utils/appToast";

import Button from "./Button";
import Modal from "./Modal";
import feedbackService from "../../services/feedbackService";

const feedbackTypes = [
  { value: "bug", label: "Report a bug", detail: "Something isn't working", icon: Bug },
  { value: "suggestion", label: "Share an idea", detail: "Suggest an improvement", icon: Lightbulb },
  { value: "other", label: "Other feedback", detail: "Tell us what you think", icon: CircleHelp }
];

const FeedbackReportModal = ({ isOpen, onClose }) => {
  const [type, setType] = useState("bug");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const close = () => {
    if (submitting) return;
    setType("bug");
    setSubject("");
    setDescription("");
    setFormError("");
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    const cleanSubject = subject.trim();
    const cleanDescription = description.trim();
    if (cleanSubject.length < 3 || cleanSubject.length > 100) {
      setFormError("Add a short subject between 3 and 100 characters.");
      return;
    }
    if (cleanDescription.length < 15 || cleanDescription.length > 2000) {
      setFormError("Please add at least 15 characters and no more than 2000.");
      return;
    }

    setFormError("");
    setSubmitting(true);
    try {
      await feedbackService.submit({
        type,
        subject: cleanSubject,
        description: cleanDescription,
        pagePath: window.location.pathname
      });
      toast.success("Thanks! Your feedback has been saved.");
      setSubmitting(false);
      setType("bug");
      setSubject("");
      setDescription("");
      onClose();
    } catch (error) {
      setFormError(error.response?.data?.message || "Unable to send feedback right now. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Send feedback"
      size="md"
      footer={(
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={submitting} onClick={close} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" form="feedback-report-form" loading={submitting} className="w-full sm:w-auto">
            <Send size={16} aria-hidden="true" />
            Send feedback
          </Button>
        </div>
      )}
    >
      <form id="feedback-report-form" onSubmit={submit} className="space-y-4">
        <p className="text-sm leading-5 theme-text-secondary">
          Your feedback is saved with the current page to help us understand the context.
        </p>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold theme-text-primary">What would you like to share?</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {feedbackTypes.map(({ value, label, detail, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-pressed={type === value}
                onClick={() => setType(value)}
                className={`group flex min-h-16 items-center gap-2 rounded-xl border p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 ${type === value ? "theme-primary-border theme-primary-soft theme-primary-text shadow-sm" : "theme-border theme-surface theme-text-secondary theme-hover-surface"}`}
              >
                <Icon size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold leading-4">{label}</span>
                  <span className="mt-0.5 block text-[10px] leading-3 theme-text-muted">{detail}</span>
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="feedback-subject" className="mb-1.5 block text-sm font-semibold theme-text-primary">
            Subject
          </label>
          <input
            id="feedback-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder={type === "bug" ? "What went wrong?" : "Give your feedback a title"}
            maxLength={100}
            required
            disabled={submitting}
            className="theme-input w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[var(--theme-primary)]/30"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label htmlFor="feedback-description" className="text-sm font-semibold theme-text-primary">
              Details
            </label>
            <span className="text-xs tabular-nums theme-text-muted">{description.length}/2000</span>
          </div>
          <textarea
            id="feedback-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Tell us what happened or what could be better…"
            rows={4}
            minLength={15}
            maxLength={2000}
            required
            disabled={submitting}
            className="theme-input w-full resize-y rounded-xl border px-4 py-3 text-sm leading-5 outline-none transition focus:ring-2 focus:ring-[var(--theme-primary)]/30"
          />
        </div>

        {formError && <p role="alert" className="rounded-lg theme-danger-soft px-3 py-2 text-sm theme-danger">{formError}</p>}
      </form>
    </Modal>
  );
};

export default FeedbackReportModal;
