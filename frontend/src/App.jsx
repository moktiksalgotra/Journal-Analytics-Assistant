import { useCallback, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Toast } from "./components/Toast.jsx";
import { JournalAssistant } from "./pages/JournalAssistant.jsx";

export default function App() {
  const [toast, setToast] = useState(null);

  const pushToast = useCallback((next) => {
    setToast(next);
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <div className="min-h-screen bg-journal-bg text-journal-ink">
      <Routes>
        <Route path="/" element={<JournalAssistant pushToast={pushToast} />} />
      </Routes>
      <Toast toast={toast} onClose={dismissToast} />
    </div>
  );
}
