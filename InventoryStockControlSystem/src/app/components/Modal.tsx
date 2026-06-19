import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void | Promise<void>;
  submitLabel?: string;
  submitColor?: string;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Modal({ title, open, onClose, onSubmit, submitLabel = "Save", submitColor, size = "md", children }: ModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) setIsSubmitting(false);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && !isSubmitting) onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, isSubmitting]);

  if (!open) return null;

  const handleFormSubmit = async () => {
    if (!onSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const widths = { sm: 420, md: 560, lg: 720 };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }}
    >
      <div
        className="rounded-xl flex flex-col overflow-hidden"
        style={{ background: "var(--card)", border: "1px solid var(--border)", width: widths[size], maxWidth: "100%", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ color: "var(--foreground)", margin: 0 }}>{title}</h3>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="rounded-lg p-1 transition-colors hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed" 
            style={{ color: "var(--muted-foreground)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">{children}</div>

        {/* Footer */}
        {onSubmit && (
          <div className="flex items-center justify-end gap-3 px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg transition-colors hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: 13, color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleFormSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ fontSize: 13, fontWeight: 500, background: submitColor ?? "var(--primary)", color: submitColor ? "#fff" : "var(--primary-foreground)" }}
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {isSubmitting ? "Processing..." : submitLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

export function Field({ label, required, children, hint }: FieldProps) {
  return (
    <div className="mb-4">
      <label className="block mb-1.5" style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)",
  background: "var(--input-background)", color: "var(--foreground)", fontSize: 13, outline: "none", boxSizing: "border-box",
};

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} rows={props.rows ?? 3} style={{ ...inputStyle, resize: "vertical", ...props.style }} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} style={{ ...inputStyle, cursor: "pointer", ...props.style }}>
      {props.children}
    </select>
  );
}

export function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-0" style={{ gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>{children}</div>;
}

export function ConfirmDialog({ open, onClose, onConfirm, label }: { open: boolean; onClose: () => void; onConfirm: () => void; label: string }) {
  return (
    <Modal title="Confirm Delete" open={open} onClose={onClose} onSubmit={onConfirm} submitLabel="Delete" submitColor="#ef4444" size="sm">
      <p style={{ color: "var(--foreground)", fontSize: 13, lineHeight: 1.6 }}>
        Are you sure you want to delete <strong>{label}</strong>? This action cannot be undone.
      </p>
    </Modal>
  );
}