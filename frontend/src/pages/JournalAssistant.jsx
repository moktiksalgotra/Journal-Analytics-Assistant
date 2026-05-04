/**
 * Main Journal Assistant Workspace.
 * Handles conversation state, API interaction, and layout transitions.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

import { AssistantChatThread } from "../components/AssistantChatThread.jsx";
import { AssistantComposer } from "../components/AssistantComposer.jsx";
import { AssistantSidebar } from "../components/AssistantSidebar.jsx";
import { AssistantWelcome } from "../components/AssistantWelcome.jsx";

import { WELCOME_SUGGESTIONS } from "../constants/suggestions.js";
import { useConversations } from "../hooks/useConversations.js";
import { askQuestion } from "../services/api.js";
import { getNowIso, mapApiToBundle } from "../utils/chatUtils.js";
import TaylorLogo from "../assets/Taylor_and_Francis.svg";

export function JournalAssistant({ profile, pushToast, onOpenProfile, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { byId, groupedSidebar, hydrated, deleteConversation, persist } = useConversations();

  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const handledSeedRef = useRef(null);

  // Helper to scroll to the bottom of the chat
  const scrollToBottom = () => {
    window.requestAnimationFrame(() => {
      document.getElementById("assistant-thread-end")?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  };

  const handleNewChat = useCallback(() => {
    setActiveId(null);
    setMobileSidebarOpen(false);
  }, []);

  const handleSelectConversation = useCallback((id) => {
    setActiveId(id);
    setMobileSidebarOpen(false);
    scrollToBottom();
  }, []);

  const handleDeleteConversation = useCallback(
    (id) => {
      deleteConversation(id);
      if (activeId === id) setActiveId(null);
    },
    [activeId, deleteConversation]
  );

  /**
   * Processes a new user question.
   */
  const handleQuestion = useCallback(
    async (question, options = {}) => {
      const query = question.trim();
      if (!query || !hydrated || loading) return false;

      const conversationId = activeId ?? crypto.randomUUID();

      // 1. Optimistically update UI with user message
      persist((draft) => {
        const existing = draft[conversationId];
        const title = existing?.title || (query.length > 60 ? `${query.slice(0, 57)}...` : query);

        const userMessage = {
          id: crypto.randomUUID(),
          role: "user",
          createdAt: getNowIso(),
          text: query,
        };

        const messages = existing ? [...existing.messages, userMessage] : [userMessage];

        return {
          ...draft,
          [conversationId]: {
            id: conversationId,
            title,
            updatedAt: getNowIso(),
            messages,
          },
        };
      });

      setActiveId(conversationId);
      setLoading(true);
      if (!options.silent) setMobileSidebarOpen(false);
      scrollToBottom();

      try {
        // 2. Fetch API response
        const payload = await askQuestion(query);
        const bundle = mapApiToBundle(payload);

        const assistantMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          createdAt: getNowIso(),
          bundle,
        };

        // 3. Update conversation with assistant response
        persist((draft) => {
          const entry = draft[conversationId];
          if (!entry) return draft;
          return {
            ...draft,
            [conversationId]: {
              ...entry,
              updatedAt: getNowIso(),
              messages: [...entry.messages, assistantMessage],
            },
          };
        });

        if (payload.error) {
          pushToast?.({ type: "error", message: payload.error });
        }
      } catch (err) {
        const errorMessage = err?.response?.data?.detail || err?.message || "Connection error.";

        const errorAssistantMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          createdAt: getNowIso(),
          bundle: { error: errorMessage, results: [] },
        };

        persist((draft) => {
          const entry = draft[conversationId];
          if (!entry) return draft;
          return {
            ...draft,
            [conversationId]: {
              ...entry,
              updatedAt: getNowIso(),
              messages: [...entry.messages, errorAssistantMessage],
            },
          };
        });

        pushToast?.({ type: "error", message: errorMessage });
      } finally {
        setLoading(false);
        scrollToBottom();
      }

      return true;
    },
    [activeId, hydrated, loading, persist, pushToast]
  );

  // Handle external seed questions (e.g. from landing or URL state)
  useEffect(() => {
    const seed = location.state?.seedQuestion;
    if (hydrated && seed && handledSeedRef.current !== seed) {
      handledSeedRef.current = seed;
      void handleQuestion(seed, { silent: true });
      navigate(".", { replace: true, state: {} });
    }
  }, [handleQuestion, hydrated, location.state, navigate]);

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center bg-journal-bg text-sm text-journal-muted">
        Initializing workspace...
      </div>
    );
  }

  const conversation = activeId ? byId[activeId] : null;
  const messages = conversation?.messages ?? [];
  const isWelcomeState = !activeId || messages.length === 0;

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-journal-bg text-journal-ink">
      {/* Mobile Backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setMobileSidebarOpen(false)}
        className={`fixed inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity md:hidden ${mobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
      />

      {/* Sidebar (Responsive) */}
      <div
        className={`fixed inset-y-0 left-0 z-40 h-full transition-transform md:static md:flex md:translate-x-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <AssistantSidebar
          grouped={groupedSidebar}
          activeId={activeId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
          busy={loading}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header */}
        <div className="flex items-center border-b border-journal-border bg-journal-panel px-4 py-2 md:hidden">
          <button
            type="button"
            className="rounded-full p-2 text-journal-muted hover:bg-journal-bg"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-3 flex items-center gap-2">
            <img src={TaylorLogo} alt="T&F" className="h-6 w-auto" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight">Annie</span>
              <span className="text-[8px] font-medium tracking-wider text-journal-muted">by taylor & francis</span>
            </div>
          </div>
        </div>

        {/* Thread Container */}
        <div className={`flex-1 min-h-0 bg-journal-bg scrollbar-thin ${isWelcomeState ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {isWelcomeState ? (
            <AssistantWelcome
              userName={profile?.fullName}
              suggestions={WELCOME_SUGGESTIONS}
              disabled={loading}
              onPickSuggestion={(q) => void handleQuestion(q)}
            />
          ) : (
            <AssistantChatThread messages={messages} notify={pushToast} loading={loading} />
          )}
        </div>

        {/* Input Area */}
        {!isWelcomeState && (
          <AssistantComposer loading={loading} onSubmit={(q) => void handleQuestion(q)} />
        )}
      </main>
    </div>
  );
}
