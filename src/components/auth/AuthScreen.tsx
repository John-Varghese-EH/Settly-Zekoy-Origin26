"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "@/lib/firebase/client";

type Mode = "signin" | "signup";

function friendlyError(msg: string): string {
  if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential"))
    return "Incorrect email or password.";
  if (msg.includes("email-already-in-use")) return "An account with this email already exists.";
  if (msg.includes("weak-password")) return "Password must be at least 8 characters.";
  if (msg.includes("popup-closed") || msg.includes("cancelled")) return "Sign-in was cancelled.";
  if (msg.includes("network")) return "Network error - check your connection.";
  return "Authentication failed. Please try again.";
}

// Animated grid dots background
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Dynamic radial glow */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[20%] w-[800px] h-[800px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)" }}
      />
      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(to bottom right, black, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom right, black, transparent)"
        }}
      />
    </div>
  );
}

function SettlyWordmark() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "#ffffff" }}
      >
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
          <rect x="1.5" y="1.5" width="6" height="6" rx="1.5" fill="#000" />
          <rect x="9.5" y="1.5" width="6" height="6" rx="1.5" fill="#000" opacity="0.35" />
          <rect x="1.5" y="9.5" width="6" height="6" rx="1.5" fill="#000" opacity="0.35" />
          <rect x="9.5" y="9.5" width="6" height="6" rx="1.5" fill="#000" />
        </svg>
      </div>
      <span className="text-xl font-semibold tracking-tight text-white">Settly</span>
    </div>
  );
}

const FEATURES = [
  { icon: "⚡", title: "Agentic Settlement Tracing", desc: "Trace any transaction across Gateway → Bank → Ledger in seconds" },
  { icon: "🔍", title: "Anomaly & Exception Detection", desc: "AI flags duplicates, failed batches, and settlement gaps automatically" },
  { icon: "📊", title: "Real-time Financial Intelligence", desc: "Forecasts, budget analysis, and spend insights on demand" },
  { icon: "🔒", title: "Secure & Auditable", desc: "Every agent action is logged, traceable, and reversible" },
];

const STATS = [
  { value: "₹2.4Cr", label: "Traced daily" },
  { value: "99.7%", label: "Accuracy" },
  { value: "<2s", label: "Trace time" },
];

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") await signInWithEmail(email, password);
      else await signUpWithEmail(email, password);
    } catch (err: unknown) {
      setError(friendlyError(err instanceof Error ? err.message : ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(friendlyError(err instanceof Error ? err.message : ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full overflow-hidden w-full absolute inset-0 z-50 text-white" style={{ background: "#050505", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Left panel ─────────────────────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between w-[480px] shrink-0 px-12 py-12 overflow-hidden border-r border-white/10" style={{ background: "linear-gradient(145deg, #0a0a0f 0%, #000 100%)" }}>
        <GridBackground />

        {/* Top */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10"
        >
          <SettlyWordmark />
          <div className="mt-16">
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold mb-4 text-indigo-400">
              Fintech Agentic AI
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white mb-6">
              Your intelligent<br />settlement<br />command center.
            </h1>
            <p className="text-sm leading-relaxed text-white/50">
              Settly's AI agent traces failed transactions, surfaces exceptions, and analyses your financial data - all in real time.
            </p>
          </div>

          {/* Stats strip */}
          <div className="flex gap-6 mt-10 pt-8 border-t border-white/10">
            {STATS.map((s, i) => (
              <motion.div 
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + (i * 0.1) }}
              >
                <p className="text-xl font-semibold text-white tracking-tight">{s.value}</p>
                <p className="text-[11px] mt-0.5 text-white/40">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features list */}
        <div className="relative z-10 flex flex-col gap-5">
          {FEATURES.map((f, i) => (
            <motion.div 
              key={f.title} 
              className="flex gap-4 items-start"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + (i * 0.1) }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", boxShadow: "0 4px 12px rgba(99,102,241,0.1)" }}>
                {f.icon}
              </div>
              <div className="pt-0.5">
                <p className="text-sm font-medium text-white leading-snug">{f.title}</p>
                <p className="text-[11px] mt-1 leading-relaxed text-white/40">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="relative z-10 text-[11px] text-white/20"
        >
          © 2026 Settly · Fintech AI Platform
        </motion.p>
      </div>

      {/* ── Right panel ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto relative">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom_right,rgba(40,40,60,0.4),transparent_50%)]" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] relative z-10 p-8 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", boxShadow: "0 24px 48px rgba(0,0,0,0.4)" }}
        >

          {/* Mobile logo */}
          <div className="flex lg:hidden mb-10">
            <SettlyWordmark />
          </div>

          {/* Mode toggle */}
          <div className="flex mb-8 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {(["signin", "signup"] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: mode === m ? "#fff" : "transparent",
                  color: mode === m ? "#000" : "rgba(255,255,255,0.4)",
                }}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.38)" }}>
                {mode === "signin"
                  ? "Sign in to access your Settly command center."
                  : "Set up your AI-powered financial co-pilot."}
              </p>

              <motion.button
                onClick={handleGoogle}
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex items-center justify-center gap-3 h-11 rounded-xl text-sm font-medium transition-colors mb-6 disabled:opacity-40"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                onMouseEnter={e => !loading && ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)")}
              >
                <GoogleIcon />
                Continue with Google
              </motion.button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                <span className="text-[11px] uppercase tracking-widest font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>or continue with</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
              </div>

              {/* Form */}
              <form onSubmit={handleEmail} className="flex flex-col gap-3">
                {mode === "signup" && (
                  <InputField
                    label="Full name"
                    type="text"
                    value={name}
                    onChange={setName}
                    placeholder="Riya Sharma"
                    required
                  />
                )}
                <InputField
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@company.com"
                  required
                />
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder={mode === "signup" ? "Min. 8 characters" : "••••••••"}
                      className="w-full h-11 px-3.5 pr-10 rounded-xl text-sm focus:outline-none transition-all placeholder:text-white/20"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
                        e.currentTarget.style.background = "rgba(99,102,241,0.05)";
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      {showPassword
                        ? <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1 7.5C2.5 4 4.8 2 7.5 2s5 2 6.5 5.5C12.5 11 10.2 13 7.5 13S2.5 11 1 7.5z" stroke="currentColor" strokeWidth="1.2" /><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.2" /><path d="M2 2l11 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                        : <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1 7.5C2.5 4 4.8 2 7.5 2s5 2 6.5 5.5C12.5 11 10.2 13 7.5 13S2.5 11 1 7.5z" stroke="currentColor" strokeWidth="1.2" /><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.2" /></svg>
                      }
                    </button>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl text-xs" style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", color: "#ff6b6b" }}>
                        <span className="shrink-0 mt-0.5">⚠</span>
                        {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="mt-3 w-full h-11 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 relative overflow-hidden group"
                  style={{ background: "#fff", color: "#000", boxShadow: "0 4px 12px rgba(255,255,255,0.2)" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                      Processing...
                    </span>
                  ) : mode === "signin" ? "Sign In" : "Create Account"}
                </motion.button>
              </form>

              {/* Terms for signup */}
              {mode === "signup" && (
                <p className="text-[11px] text-center mt-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.2)" }}>
                  By creating an account you agree to our Terms of Service and Privacy Policy.
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Trust badge */}
          <div className="mt-10 pt-6 flex items-center justify-center gap-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {["SOC 2", "ISO 27001", "PCI DSS"].map(badge => (
              <div key={badge} className="flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1L6.18 3.39L9 3.8L7 5.75L7.44 8.6L5 7.32L2.56 8.6L3 5.75L1 3.8L3.82 3.39L5 1z" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" fill="none" />
                </svg>
                <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>{badge}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InputField({ label, type, value, onChange, placeholder, required }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full h-11 px-3.5 rounded-xl text-sm focus:outline-none transition-all placeholder:text-white/20"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
          e.currentTarget.style.background = "rgba(99,102,241,0.05)";
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        }}
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
