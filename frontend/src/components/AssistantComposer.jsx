import { 
  Loader2, 
  ArrowUp,
  Mic,
  Square
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useVoice } from "../hooks/useVoice";

export function AssistantComposer({
  loading,
  onSubmit,
  quickPicks,
  isLanding = false,
}) {
  const [input, setInput] = useState("");
  const [baseText, setBaseText] = useState("");
  const inputRef = useRef(null);

  const { isRecording, toggleRecording } = useVoice({
    onTranscriptUpdate: (transcript) => {
      const nextText = baseText ? `${baseText.trim()} ${transcript}` : transcript;
      setInput(nextText);
      
      // Auto-resize on every transcript update
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      }
    }
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleVoiceToggle = () => {
    if (!isRecording) {
      setBaseText(input); // Save current input as base
    }
    toggleRecording();
  };

  const dispatch = () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    onSubmit(q);
  };

  return (
    <div
      id="journal-assistant-composer-anchor"
      className={`px-4 py-4 md:px-8 ${isLanding ? "w-full" : "bg-journal-bg pb-[max(env(safe-area-inset-bottom),1rem)]"}`}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        {/* Main Input Box */}
        <div className="group relative flex flex-col overflow-hidden rounded-[24px] border border-journal-border bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/[0.02] transition-all duration-200 focus-within:border-journal-accent/40 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus-within:ring-journal-accent/10">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                dispatch();
              }
            }}
            placeholder={isRecording ? "Listening..." : "How can I help you today?"}
            className="max-h-60 min-h-[100px] w-full resize-none bg-transparent px-6 py-5 text-[16px] leading-relaxed text-journal-ink outline-none placeholder:text-journal-muted/60"
          />
          
          {/* Bottom Bar inside Input Box */}
          <div className="flex items-center justify-between px-4 pb-3 pt-1">
            <div className="flex items-center gap-1">
              {/* Left empty as the + icon was removed */}
            </div>

            <div className="flex items-center gap-3">
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  disabled={loading}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
                    isRecording 
                      ? "bg-red-500 border-red-500 text-white animate-pulse shadow-lg scale-110" 
                      : "border-journal-clay/40 text-journal-clay hover:bg-journal-clay/10 hover:border-journal-clay"
                  }`}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  {isRecording ? (
                    <Square className="h-4 w-4 fill-current" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </button>

                <button
                  type="button"
                  disabled={loading || !input.trim() || isRecording}
                  onClick={dispatch}
                  className={`ml-1 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${
                    input.trim() && !isRecording
                      ? "bg-journal-clay text-white shadow-sm scale-100 opacity-100" 
                      : "bg-journal-border/10 text-journal-muted/40 scale-95 opacity-50 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
