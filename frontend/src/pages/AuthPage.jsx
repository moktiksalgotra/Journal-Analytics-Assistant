import { useState } from "react";
import TaylorLogo from "../assets/Taylor_and_Francis.svg";
import { Plus, Minus } from "lucide-react";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from "../utils/firebase.js";

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-black/5 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-6 text-left transition-colors hover:text-journal-clay"
      >
        <span className="text-xl font-medium tracking-tight md:text-2xl">{question}</span>
        {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </button>
      {isOpen && (
        <div className="pb-6 text-black/60 leading-relaxed max-w-2xl text-lg">
          {answer}
        </div>
      )}
    </div>
  );
}

export function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const faqs = [
    {
      question: "What is Annie and how does it work?",
      answer: "Annie is an AI-powered analytics assistant specifically designed for Taylor & Francis. It helps you navigate complex publication data, analyze journal trends, and extract meaningful insights through natural language conversation."
    },
    {
      question: "What should I use Annie for?",
      answer: "Annie is ideal for monitoring submission trends, analyzing editor workloads, comparing category performance, and identifying high-impact research areas. It's your partner in making data-driven editorial and strategic decisions."
    },
    {
      question: "How do I get started?",
      answer: "Simply sign in with your Taylor & Francis credentials or use Google Auth. Once inside, you can start asking questions about your journal data immediately—no complex SQL or spreadsheet skills required."
    }
  ];

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [success, setSuccess] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailAction = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      if (isSignUp) {
        // Explicit Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setSuccess("Account created! A verification email has been sent to " + email);
      } else {
        // Explicit Login
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error("Auth error:", err.code, err.message);
      
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        if (!isSignUp) {
          setError("No account found with this email. Try signing up instead.");
        } else {
          setError("Account creation failed. Please try again.");
        }
      } else if (err.code === "auth/email-already-in-use") {
        setError("An account already exists with this email. Please log in.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak.");
      } else {
        setError(err.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f6f3] text-[#201a17]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <img src={TaylorLogo} alt="Taylor & Francis" className="h-10 w-auto" />
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold tracking-tight">Annie</span>
            <span className="text-[10px] font-medium tracking-widest text-black/40">by Taylor & Francis</span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 pt-12 pb-24 lg:grid-cols-2">
        <section className="flex flex-col items-start text-left lg:pl-32">
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Unlock insights, <br />
            better & faster
          </h1>
          <p className="mt-6 text-2xl font-light italic text-black/60 tracking-wide">
            Discover trends. Publish smarter.
          </p>

          <form
            onSubmit={handleEmailAction}
            className="mt-12 w-full max-w-sm rounded-3xl border border-black/10 bg-white p-6 shadow-md text-left"
          >
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">
              {isSignUp ? "Create an account" : "Sign in to Annie"}
            </h2>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-xl bg-green-50 p-3 text-xs text-green-600 border border-green-100">
                {success}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-black/10 px-4 py-3 text-sm font-medium text-black/80 hover:bg-black/5 transition disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {isSignUp ? "Sign up with Google" : "Continue with Google"}
            </button>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-black/5" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-black/30">OR</span>
              <div className="h-px flex-1 bg-black/5" />
            </div>

            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none ring-0 placeholder:text-black/40 focus:border-journal-clay transition"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none ring-0 placeholder:text-black/40 focus:border-journal-clay transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white hover:bg-black/90 transition disabled:opacity-50"
            >
              {loading ? "Please wait..." : isSignUp ? "Sign up" : "Sign in"}
            </button>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setSuccess("");
                }}
                className="text-sm text-black/60 hover:text-black"
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </section>

        <section className="hidden items-center justify-center lg:flex">
          <div className="flex h-[480px] w-full max-w-lg items-center justify-center rounded-[40px] border border-black/[0.03] bg-white/50 shadow-sm transition-all hover:shadow-md">
            <img src={TaylorLogo} alt="Taylor & Francis" className="h-48 w-auto drop-shadow-sm" />
          </div>
        </section>
      </main>

      <section className="mx-auto w-full max-w-4xl px-6 pb-32">
        <h2 className="mb-12 text-center text-3xl font-medium tracking-tight md:text-4xl">
          Frequently asked questions
        </h2>
        <div className="flex flex-col">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} {...faq} />
          ))}
        </div>
      </section>

      <footer className="w-full bg-black py-16 text-center">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center gap-8">
          <h3 className="text-white/80 text-3xl md:text-5xl font-light italic whitespace-nowrap">
            "Foster human progress through knowledge"
          </h3>

          <div className="h-px w-12 bg-white/10" />

          <p className="text-white/40 text-[10px] tracking-widest">
            © 2026 Taylor & Francis. All rights reserved.
          </p>
        </div>
      </footer>
      {/* Bottom overscroll bleed */}
      <div className="fixed bottom-0 left-0 -z-50 h-[50vh] w-full bg-black" />
    </div>
  );
}




