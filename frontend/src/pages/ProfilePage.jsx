import { useMemo, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { getInitials } from "../utils/authStorage.js";
import { auth, updateEmail } from "../utils/firebase.js";

export function ProfilePage({ profile, onSave, onBack }) {
  const [form, setForm] = useState(profile);
  const initials = useMemo(() => getInitials(form.fullName), [form.fullName]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    
    // If email has changed, try to update it in Firebase first
    if (form.email !== profile.email && auth.currentUser) {
      try {
        await updateEmail(auth.currentUser, form.email);
      } catch (err) {
        console.error("Failed to update email in Firebase:", err);
        // We still continue to save other profile info, 
        // but the user might need to re-login to change email
        alert("To change your email, you must have logged in recently. Please re-login and try again.");
        return;
      }
    }
    
    onSave(form);
  };

  return (
    <div className="min-h-screen bg-journal-bg px-4 py-8 text-journal-ink md:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-journal-border bg-white px-3 py-2 text-sm hover:bg-journal-panel"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to assistant
        </button>

        <div className="rounded-3xl border border-journal-border bg-journal-panel p-6 shadow-sm md:p-8">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-journal-clay text-xl font-bold text-white">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Profile settings</h1>
              <p className="text-sm text-journal-muted">Manage your basic account information.</p>
            </div>
          </div>

          <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-journal-muted">Full name</span>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                className="w-full rounded-xl border border-journal-border bg-white px-3 py-2.5 outline-none focus:border-journal-accent"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-journal-muted">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-xl border border-journal-border bg-white px-3 py-2.5 outline-none focus:border-journal-accent"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-journal-muted">Company</span>
              <input
                type="text"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                className="w-full rounded-xl border border-journal-border bg-white px-3 py-2.5 outline-none focus:border-journal-accent"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-journal-muted">Role</span>
              <input
                type="text"
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
                className="w-full rounded-xl border border-journal-border bg-white px-3 py-2.5 outline-none focus:border-journal-accent"
              />
            </label>

            <label className="space-y-1.5 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-journal-muted">Timezone</span>
              <input
                type="text"
                value={form.timezone}
                onChange={(e) => update("timezone", e.target.value)}
                className="w-full rounded-xl border border-journal-border bg-white px-3 py-2.5 outline-none focus:border-journal-accent"
              />
            </label>

            <label className="space-y-1.5 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-journal-muted">Bio</span>
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                className="w-full resize-none rounded-xl border border-journal-border bg-white px-3 py-2.5 outline-none focus:border-journal-accent"
              />
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-journal-clay px-4 py-2.5 text-sm font-medium text-white hover:bg-journal-accent"
              >
                <Save className="h-4 w-4" />
                Save profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
