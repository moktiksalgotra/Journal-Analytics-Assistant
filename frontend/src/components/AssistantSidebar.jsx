/**
 * Claude-style left rail: New chat, grouped history, company branding footer.
 */
import { LogOut, Menu, Pencil, UserCircle2 } from "lucide-react";
import TaylorLogo from "../assets/Taylor_and_Francis.svg";

const SECTION_LABELS = {
  today: "Today",
  yesterday: "Yesterday",
  last7: "Last 7 days",
  older: "Earlier",
};

function HistoryRow({ conversation, active, onSelect, onDelete }) {
  return (
    <div className="group relative flex w-full items-stretch rounded-xl">
      <button
        type="button"
        onClick={() => onSelect(conversation.id)}
        className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-2 text-left transition ${
          active
            ? "bg-journal-accent/20 shadow-sm ring-1 ring-journal-accent/40"
            : "hover:bg-journal-panel/70"
        }`}
      >
        <Menu aria-hidden className="h-4 w-4 shrink-0 text-journal-muted/80" strokeWidth={1.75} />
        <span className="truncate text-[13px] font-medium leading-snug text-journal-ink">
          {conversation.title}
        </span>
      </button>
      <button
        type="button"
        title="Remove from history"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(conversation.id);
        }}
        className="absolute right-1 top-1 rounded-lg px-1.5 py-1 text-[11px] text-journal-muted opacity-0 transition hover:bg-journal-panel group-hover:pointer-events-auto group-hover:opacity-100 max-sm:pointer-events-auto max-sm:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

export function AssistantSidebar({
  grouped,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onOpenProfile,
  onLogout,
  busy,
}) {
  const sections = [
    { key: "today", rows: grouped.today },
    { key: "yesterday", rows: grouped.yesterday },
    { key: "last7", rows: grouped.last7 },
    { key: "older", rows: grouped.older },
  ].filter((s) => s.rows.length > 0);

  return (
    <aside className="flex h-full w-full max-w-[300px] shrink-0 flex-col border-r border-journal-border bg-journal-bg">
      <div className="p-3">
        <button
          type="button"
          disabled={busy}
          onClick={onNewChat}
          className="flex w-full items-center justify-between rounded-2xl bg-journal-panel px-3 py-3 text-[15px] font-medium text-journal-ink shadow-sm ring-1 ring-journal-border transition hover:bg-journal-panel/85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          New chat
          <Pencil className="h-4 w-4 text-journal-muted" strokeWidth={1.75} />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-4 scrollbar-thin">
        {sections.length === 0 ? (
          <p className="px-2 text-sm text-journal-muted">No conversations yet. Ask your first question.</p>
        ) : null}
        {sections.map(({ key, rows }) => (
          <div key={key}>
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-journal-muted">
              {SECTION_LABELS[key]}
            </p>
            <div className="space-y-0.5">
              {rows.map((c) => (
                <HistoryRow
                  key={c.id}
                  conversation={c}
                  active={c.id === activeId}
                  onSelect={onSelectConversation}
                  onDelete={onDeleteConversation}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-journal-border p-3">
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-journal-border bg-white px-2 py-2 text-[12px] font-medium text-journal-ink hover:bg-journal-panel"
          >
            <UserCircle2 className="h-4 w-4" />
            Profile
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-journal-border bg-white px-2 py-2 text-[12px] font-medium text-journal-ink hover:bg-journal-panel"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
        <div className="flex items-center gap-2.5 opacity-80">
          <img src={TaylorLogo} alt="Taylor & Francis" className="h-5 w-auto grayscale" />
          <span className="text-[11px] font-medium tracking-wide text-journal-muted">
            Taylor &amp; Francis
          </span>
        </div>
      </div>
    </aside>
  );
}
