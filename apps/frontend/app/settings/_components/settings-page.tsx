"use client";

import { useState } from "react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-700/50 bg-gray-800/80">
        <h2 className="text-sm font-semibold text-gray-200">{title}</h2>
      </div>
      <div className="p-5 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, hint }: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
      />
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [name, setName] = useState("Loyd");
  const [email] = useState("admin@devforge.com");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  const handleSaveProfile = () => {
    setSaved("profile");
    setTimeout(() => setSaved(null), 2500);
  };

  const handleChangePassword = () => {
    if (!currentPw || !newPw || !confirmPw) return;
    if (newPw !== confirmPw) return;
    setSaved("password");
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setTimeout(() => setSaved(null), 2500);
  };

  return (
    <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Section title="Profile">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-xl font-bold text-slate-950 shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{name}</p>
            <p className="text-xs text-gray-500">{email}</p>
          </div>
        </div>
        <Field label="Display Name" value={name} onChange={setName} placeholder="Your name" />
        <Field label="Email Address" value={email} onChange={() => {}} hint="Email cannot be changed here. Contact admin." />
        <button
          onClick={handleSaveProfile}
          className="self-start px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saved === "profile" ? "✓ Saved!" : "Save Profile"}
        </button>
      </Section>

      {/* Password */}
      <Section title="Change Password">
        <Field label="Current Password" type="password" value={currentPw} onChange={setCurrentPw} placeholder="••••••••" />
        <Field label="New Password" type="password" value={newPw} onChange={setNewPw} placeholder="••••••••" hint="Minimum 8 characters" />
        <Field label="Confirm New Password" type="password" value={confirmPw} onChange={setConfirmPw} placeholder="••••••••" />
        {newPw && confirmPw && newPw !== confirmPw && (
          <p className="text-xs text-red-400">Passwords do not match</p>
        )}
        <button
          onClick={handleChangePassword}
          disabled={!currentPw || !newPw || !confirmPw || newPw !== confirmPw}
          className="self-start px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saved === "password" ? "✓ Password Updated!" : "Update Password"}
        </button>
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        {[
          { label: "Email notifications for errors", defaultChecked: true },
          { label: "Email notifications for pipeline failures", defaultChecked: true },
          { label: "Real-time alerts in browser", defaultChecked: false },
        ].map((pref) => (
          <label key={pref.label} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              defaultChecked={pref.defaultChecked}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{pref.label}</span>
          </label>
        ))}
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone">
        <p className="text-xs text-gray-400">These actions are irreversible. Please be certain.</p>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 text-xs font-medium rounded-lg transition-colors">
            Delete Account
          </button>
          <button className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-400 text-xs font-medium rounded-lg transition-colors">
            Export My Data
          </button>
        </div>
      </Section>
    </div>
  );
}
