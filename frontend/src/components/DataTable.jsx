import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { downloadCsv } from "../utils/csv.js";

export function DataTable({
  rows,
  onExport,
  variant = "dark",
  showExportButton = true,
  animateRows = false,
}) {
  const light = variant === "light";

  if (!rows?.length) {
    return (
      <div
        className={`rounded-2xl border border-dashed p-6 text-center text-sm ${
          light ? "border-black/15 bg-white text-journal-muted" : "border-white/10 bg-white/5 text-slate-400"
        }`}
      >
        No tabular rows returned for this question.
      </div>
    );
  }

  const keys = Object.keys(rows[0]);

  const handleExport = () => {
    downloadCsv(rows, `journal-analytics-${Date.now()}.csv`);
    onExport?.();
  };

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden rounded-2xl border shadow-inner ${
        light
          ? "border-black/[0.08] bg-journal-beige/60 ring-1 ring-black/[0.04]"
          : "border-white/10 bg-slate-950/60 ring-1 ring-white/5"
      }`}
    >
      {showExportButton ? (
        <div
          className={`flex items-center justify-between border-b px-4 py-3 ${
            light ? "border-black/[0.06] bg-white/40" : "border-white/5"
          }`}
        >
          <div>
            <p
              className={`text-sm font-semibold ${
                light ? "text-journal-ink" : "text-slate-100"
              }`}
            >
              Query results
            </p>
            <p className={`text-xs ${light ? "text-journal-muted" : "text-slate-500"}`}>
              {rows.length} row{rows.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className={
              light
                ? "inline-flex items-center gap-2 rounded-xl bg-journal-clay/15 px-3 py-1.5 text-xs font-semibold text-journal-clay ring-1 ring-journal-clay/40 transition hover:bg-journal-clay/25"
                : "inline-flex items-center gap-2 rounded-xl bg-sky-500/15 px-3 py-1.5 text-xs font-medium text-sky-100 ring-1 ring-sky-500/40 transition hover:bg-sky-500/25"
            }
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      ) : (
        <div className={`border-b px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-journal-muted`}>
          Results
        </div>
      )}
      <div className="max-h-[360px] overflow-auto scrollbar-thin">
        <table
          className={`min-w-full border-collapse text-left text-xs ${light ? "text-journal-ink" : "text-slate-200"}`}
        >
          <thead
            className={`sticky top-0 backdrop-blur ${
              light ? "bg-journal-beige/95" : "bg-slate-950/95"
            }`}
          >
            <tr className={light ? "border-b border-black/[0.08]" : "border-b border-white/10"}>
              {keys.map((k) => (
                <th
                  key={k}
                  className={`whitespace-nowrap px-3 py-2 font-semibold ${
                    light ? "text-journal-muted" : "text-slate-300"
                  }`}
                >
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <motion.tr
                key={idx}
                initial={animateRows ? { opacity: 0, x: -4 } : {}}
                animate={animateRows ? { opacity: 1, x: 0 } : {}}
                transition={animateRows ? { delay: idx * 0.05, duration: 0.3 } : {}}
                className={
                  light
                    ? "border-b border-black/[0.05] odd:bg-white/40 hover:bg-black/[0.03]"
                    : "border-b border-white/5 odd:bg-white/[0.02] hover:bg-white/[0.04]"
                }
              >
                {keys.map((k) => (
                  <td key={k} className="px-3 py-2 align-top">
                    {String(row[k] ?? "")}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
