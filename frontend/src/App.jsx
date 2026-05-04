import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Toast } from "./components/Toast.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { JournalAssistant } from "./pages/JournalAssistant.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { clearSession, getProfile, getSession, setProfile, setSession } from "./utils/authStorage.js";
import { auth, onAuthStateChanged, signOut } from "./utils/firebase.js";

export default function App() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [session, setSessionState] = useState(() => getSession());
  const [profile, setProfileState] = useState(() => getProfile());
  const [authLoading, setAuthLoading] = useState(true);

  const pushToast = useCallback((next) => {
    setToast(next);
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const nextSession = { email: user.email, uid: user.uid, createdAt: new Date().toISOString() };
        setSession(nextSession);
        setSessionState(nextSession);
        
        setProfileState((prev) => {
          const next = { ...prev, email: user.email, fullName: prev.fullName || user.displayName || "" };
          setProfile(next);
          return next;
        });
      } else {
        clearSession();
        setSessionState(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAuthenticated = Boolean(session?.email);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      pushToast({ type: "success", message: "You have been logged out." });
      navigate("/login");
    } catch (error) {
      pushToast({ type: "error", message: "Logout failed." });
    }
  }, [navigate, pushToast]);

  const handleSaveProfile = useCallback(
    (nextProfile) => {
      setProfile(nextProfile);
      setProfileState(nextProfile);
      pushToast({ type: "success", message: "Profile updated." });
    },
    [pushToast],
  );

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-journal-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-journal-clay border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-journal-bg text-journal-ink">
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/assistant" : "/login"} replace />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/assistant" replace /> : <AuthPage />}
        />
        <Route
          path="/assistant"
          element={
            isAuthenticated ? (
              <JournalAssistant
                profile={profile}
                pushToast={pushToast}
                onOpenProfile={() => navigate("/profile")}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <ProfilePage
                profile={profile}
                onSave={handleSaveProfile}
                onBack={() => navigate("/assistant")}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast toast={toast} onClose={dismissToast} />
    </div>
  );
}
