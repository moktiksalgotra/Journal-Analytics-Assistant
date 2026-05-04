/**
 * Message Thread Component.
 * Displays user and assistant messages in a vertically stacked layout.
 */
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, Terminal, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ChartCard } from "./ChartCard.jsx";
import { DataTable } from "./DataTable.jsx";
import { rowsToCsv, downloadCsv } from "../utils/csv.js";

/**
 * Typewriter effect for AI responses.
 */
function Typewriter({ text, speed = 15, isLast, onComplete }) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    // If not the last message, just show full text immediately
    if (!isLast) {
      setDisplayedText(text);
      setIndex(text.length);
      setIsTyping(false);
      return;
    }

    if (index < text.length) {
      const char = text[index];
      // Faster typing for spaces and shorter characters
      const nextSpeed = char === " " ? speed * 0.5 : speed;
      
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + char);
        setIndex((prev) => prev + 1);
      }, nextSpeed);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
      onComplete?.();
    }
  }, [index, text, speed, isLast, onComplete]);

  return (
    <span className="relative inline">
      {displayedText}
      {isTyping && (
        <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 bg-journal-ink/80 animate-cursor" />
      )}
    </span>
  );
}

function ArtifactSkeleton({ type }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-journal-border bg-white/50 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-4 w-4 rounded bg-journal-muted/10" />
        <div className="h-3 w-32 rounded bg-journal-muted/10" />
      </div>
      {type === "chart" ? (
        <div className="flex items-end gap-3 h-48 px-2">
          {[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
            <div key={i} className="flex-1 bg-journal-muted/5 rounded-t-lg" style={{ height: `${h}%` }} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-full rounded bg-journal-muted/5" />
          ))}
        </div>
      )}
      <div className="absolute inset-0 animate-shimmer" />
    </div>
  );
}

/**
 * Common action buttons for messages (Copy, Export).
 */
function MessageActions({ variant, onCopy, onExport, showExport }) {
  return (
    <div
      className={`absolute z-10 flex gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 ${variant}`}
    >
      <button
        type="button"
        onClick={onCopy}
        className="rounded-lg border border-journal-border bg-white/90 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-journal-muted shadow-sm hover:text-journal-ink backdrop-blur"
      >
        <span className="flex items-center gap-1.5"><Copy className="h-3 w-3" /> Copy</span>
      </button>
      {showExport && (
        <button
          type="button"
          onClick={onExport}
          className="rounded-lg border border-journal-border bg-white/90 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-journal-muted shadow-sm hover:text-journal-ink backdrop-blur"
        >
          <span className="flex items-center gap-1.5"><Download className="h-3 w-3" /> Export CSV</span>
        </button>
      )}
    </div>
  );
}

function UserBubble({ text, onNotify }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      onNotify?.({ type: "success", message: "Copied to clipboard." });
    } catch {
      onNotify?.({ type: "error", message: "Clipboard access failed." });
    }
  };

  return (
    <div className="group relative flex justify-end">
      <MessageActions variant="-top-9 right-0" onCopy={handleCopy} />
      <div className="max-w-[85%] rounded-2xl bg-journal-beige px-4 py-3 text-[15px] text-journal-ink shadow-sm ring-1 ring-black/[0.05]">
        {text}
      </div>
    </div>
  );
}

function AssistantBubble({ message, onNotify, isLast, shouldAnimate }) {
  const [showArtifacts, setShowArtifacts] = useState(!isLast || !shouldAnimate);
  const [showSql, setShowSql] = useState(false);
  const bundle = message.bundle;
  const results = bundle.results || [];

  useEffect(() => {
    // Keep historical messages fully rendered when revisiting chat history.
    if (!isLast || !shouldAnimate) {
      setShowArtifacts(true);
    }
  }, [isLast, shouldAnimate]);

  const handleCopy = async () => {
    const text = [
      bundle.summary,
      bundle.sql ? `SQL Query:\n${bundle.sql}` : "",
      bundle.error ? `Error: ${bundle.error}` : ""
    ].filter(Boolean).join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      onNotify?.({ type: "success", message: "Response copied." });
    } catch {
      onNotify?.({ type: "error", message: "Clipboard access failed." });
    }
  };

  const handleExport = () => {
    if (results.length > 0) {
      downloadCsv(results, `journal-analytics-${Date.now()}.csv`);
      onNotify?.({ type: "success", message: "CSV exported." });
    }
  };

  return (
    <div className="group relative space-y-4">
      <MessageActions 
        variant="-top-9 left-0" 
        onCopy={handleCopy} 
        onExport={handleExport} 
        showExport={results.length > 0} 
      />

      <div className="max-w-full text-[15px] leading-relaxed text-journal-ink">
        {bundle.error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {bundle.error}
          </div>
        ) : (
          <div className="space-y-6">
            {bundle.summary && (
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.03]">
                <div className="font-medium text-journal-ink leading-relaxed">
                  <Typewriter 
                    text={bundle.summary} 
                    isLast={isLast && shouldAnimate}
                    onComplete={() => setShowArtifacts(true)} 
                  />
                </div>
              </div>
            )}

            {bundle.chart?.type && (
              <AnimatePresence mode="wait">
                {!showArtifacts ? (
                  <motion.div key="skeleton" exit={{ opacity: 0 }}>
                    <ArtifactSkeleton type="chart" />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="content"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden rounded-2xl border border-journal-border bg-white shadow-sm"
                  >
                    <ChartCard chart={bundle.chart} tone="light" />
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {results.length > 0 && (
              <AnimatePresence mode="wait">
                {!showArtifacts ? (
                  <motion.div key="skeleton" exit={{ opacity: 0 }}>
                    <ArtifactSkeleton type="table" />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden rounded-2xl border border-journal-border bg-white shadow-sm"
                  >
                    <DataTable variant="light" rows={results} showExportButton={false} animateRows={isLast} />
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {bundle.sql && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowSql(!showSql)}
                  className="flex items-center gap-2 rounded-full border border-journal-border bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-journal-muted hover:bg-journal-bg transition"
                >
                  <Terminal className="h-3 w-3" />
                  {showSql ? "Hide SQL" : "Show SQL"}
                  {showSql ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>

                <AnimatePresence>
                  {showSql && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden rounded-xl bg-journal-panel border border-journal-border shadow-inner"
                    >
                      <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-journal-muted bg-black/[0.02]">
                        <span className="flex items-center gap-2">
                          SQL Query
                          {typeof bundle.row_count === "number" && (
                            <span className="bg-journal-border/30 px-1.5 py-0.5 rounded text-[9px] normal-case">
                              {bundle.row_count} {bundle.row_count === 1 ? 'row' : 'rows'}
                            </span>
                          )}
                        </span>
                        {typeof bundle.execution_time_ms === "number" && (
                          <span className="font-mono">{bundle.execution_time_ms}ms</span>
                        )}
                      </div>
                      <pre className="p-4 font-mono text-[12px] text-journal-ink overflow-x-auto">
                        {bundle.sql}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AssistantChatThread({ messages, notify, loading }) {
  const bottomRef = useRef(null);
  const now = Date.now();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-10 px-4 pb-20 pt-8">
      {messages.map((msg, index) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {msg.role === "user" ? (
            <UserBubble text={msg.text} onNotify={notify} />
          ) : (
            (() => {
              const createdAtMs = new Date(msg.createdAt).getTime();
              const isFreshMessage = Number.isFinite(createdAtMs) && now - createdAtMs < 10_000;
              return (
            <AssistantBubble 
              message={msg} 
              onNotify={notify} 
              isLast={index === messages.length - 1}
              shouldAnimate={isFreshMessage}
            />
              );
            })()
          )}
        </motion.div>
      ))}

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-4"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-journal-panel text-journal-muted shadow-sm ring-1 ring-black/[0.05]">
            <div className="flex gap-1">
              <span className="h-1 w-1 animate-bounce rounded-full bg-journal-muted [animation-delay:-0.3s]"></span>
              <span className="h-1 w-1 animate-bounce rounded-full bg-journal-muted [animation-delay:-0.15s]"></span>
              <span className="h-1 w-1 animate-bounce rounded-full bg-journal-muted"></span>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-1">
             <div className="h-4 w-2 bg-journal-muted/30 animate-cursor rounded-sm" />
          </div>
        </motion.div>
      )}
      
      <div ref={bottomRef} id="assistant-thread-end" />
    </div>
  );
}
