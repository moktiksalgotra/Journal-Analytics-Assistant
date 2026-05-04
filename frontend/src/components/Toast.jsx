/** Toast tuned for Claude-style light workspaces. */
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export function Toast({ toast, onClose }) {
  return (
    <AnimatePresence>
      {toast?.message ? (
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 28 }}
          className="fixed bottom-6 right-4 z-[100] max-w-sm"
          role="status"
          aria-live="polite"
        >
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg ${
              toast.type === "error"
                ? "border-red-400/40 bg-red-900/40 text-red-100"
                : "border-journal-border bg-journal-panel text-journal-ink"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            )}
            <p className="text-sm leading-relaxed">{toast.message}</p>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={onClose}
              className="rounded-full border border-transparent p-1 text-journal-muted transition hover:border-journal-border hover:bg-journal-bg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
