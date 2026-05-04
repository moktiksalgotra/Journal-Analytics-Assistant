/**
 * Welcome Screen Component.
 * Displays the initial greeting, search composer, and suggested questions.
 */
import { AssistantComposer } from "./AssistantComposer.jsx";
import { ClaudeLogo } from "./ClaudeLogo.jsx";
import TaylorLogo from "../assets/Taylor_and_Francis.svg";

export function AssistantWelcome({ suggestions, onPickSuggestion, disabled }) {
  // Determine time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex h-full w-full flex-col items-center justify-between bg-journal-bg px-6 py-8 overflow-hidden">
      <div className="flex w-full max-w-5xl flex-1 flex-col items-center justify-center">

        {/* Header Section */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <ClaudeLogo className="h-10 w-10 text-journal-clay md:h-12 md:w-12" />
            <h1 className="text-4xl font-medium tracking-tight text-journal-ink md:text-5xl" style={{ fontFamily: 'Georgia, serif' }}>
              {greeting}, Moktik
            </h1>
          </div>
        </div>

        {/* Search Input Section */}
        <div className="mb-10 w-full max-w-3xl">
          <AssistantComposer
            loading={disabled}
            onSubmit={onPickSuggestion}
            isLanding={true}
          />
        </div>

        {/* Quick Suggestion Cards */}
        <div className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
          {suggestions.slice(0, 4).map((card) => (
            <button
              key={card.id}
              type="button"
              disabled={disabled}
              onClick={() => onPickSuggestion(card.question)}
              className="group flex flex-col items-start rounded-2xl border border-journal-border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-journal-accent/30 hover:shadow-md disabled:opacity-50"
            >
              <span className="text-[14px] font-bold text-journal-ink group-hover:text-journal-accent transition-colors">
                {card.title}
              </span>
              <span className="mt-1 text-[12px] leading-relaxed text-journal-muted line-clamp-2">
                {card.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Background Branding */}
      <footer className="mt-8 w-full select-none pointer-events-none flex items-center justify-center gap-6 md:gap-10 opacity-70">
        <img
          src={TaylorLogo}
          alt="Taylor & Francis"
          className="h-[clamp(30px,7vw,110px)] w-auto opacity-20 grayscale"
        />
        <h2 className="text-center text-[clamp(24px,6vw,120px)] font-black tracking-tighter text-journal-muted/20 leading-none whitespace-nowrap">
          Taylor & Francis
        </h2>
      </footer>
    </div>
  );
}
