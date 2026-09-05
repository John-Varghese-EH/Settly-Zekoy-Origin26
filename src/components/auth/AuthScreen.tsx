"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "@/lib/firebase/client";

type Mode = "signin" | "signup";

function friendlyError(msg: string): string {
  if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential"))
    return "Incorrect email or password.";
  if (msg.includes("email-already-in-use")) return "An account with this email already exists.";
  if (msg.includes("weak-password")) return "Password must be at least 7 characters.";
  if (msg.includes("popup-closed") || msg.includes("cancelled")) return "Sign-in was cancelled.";
  if (msg.includes("network")) return "Network error - check your connection.";
  return "Authentication failed. Please try again.";
}

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

  const focusLogin = () => {
    document.getElementById("login-box")?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("email-input")?.focus();
  };

  return (
    <div className="relative w-full h-screen overflow-y-auto overflow-x-hidden bg-[#02040a] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex flex-row justify-between px-8 py-6 max-w-7xl mx-auto items-center">
        <div className="flex items-center gap-2.5 cursor-pointer">
          <span className="text-2xl tracking-tight text-white flex items-baseline gap-[4px]" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Settly
            <span className="text-[10px] font-sans font-bold tracking-widest text-indigo-300 opacity-80 leading-none uppercase">ZEKOY</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <span className="text-sm text-white transition-colors cursor-pointer">Product</span>
          <span className="text-sm text-[#a3a3a3] hover:text-white transition-colors cursor-pointer">How it Works</span>
          <span className="text-sm text-[#a3a3a3] hover:text-white transition-colors cursor-pointer">For Support Teams</span>
          <span className="text-sm text-[#a3a3a3] hover:text-white transition-colors cursor-pointer">Docs</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={focusLogin} className="text-sm text-white font-medium hover:text-[#a3a3a3] transition-colors cursor-pointer hidden sm:block">
            Sign In
          </button>
          <button onClick={focusLogin} className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white hover:scale-[1.03] transition-transform cursor-pointer">
            Try the Agent
          </button>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section className="relative w-full min-h-screen flex items-center justify-center pt-24 pb-20">
        {/* Fullscreen Video Background for Hero */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Subtle noise overlay */}
          <div className="absolute inset-0 z-20 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2VGaWx0ZXIpIi8+PC9zdmc+')]"></div>
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#02040a]/40 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#02040a]/70 via-[#02040a]/20 to-transparent z-10 w-[80%] pointer-events-none" />
          
          {/* Ambient Glows */}
          <motion.div animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-indigo-500/20 rounded-full blur-[120px] z-10 pointer-events-none mix-blend-screen" />
          <motion.div animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-1/4 right-0 w-1/3 h-1/3 bg-blue-500/10 rounded-full blur-[100px] z-10 pointer-events-none mix-blend-screen" />
          
          <video
            autoPlay loop muted playsInline
            className="w-full h-full object-cover object-bottom opacity-100"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          
          {/* Left: Cinematic Text */}
          <div className="flex-1 flex flex-col items-start text-left max-w-2xl">
            <motion.div initial="hidden" animate="visible" variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}>

              <motion.h1 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }} className="text-5xl sm:text-6xl md:text-7xl leading-[0.95] tracking-[-1.5px] font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                The Autonomous Agent That Explains Every Settlement <br/><em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-200 drop-shadow-sm">- Instantly.</em>
              </motion.h1>
              <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }} className="text-[#a3a3a3] text-base sm:text-lg mt-8 leading-relaxed max-w-xl">
                Settly automates payment reconciliation by tracing transaction IDs across Gateway, Bank, and Ledger logs - resolving what it can on its own, and honestly escalating what it can&apos;t.
              </motion.p>
              
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }} className="flex flex-wrap items-center gap-4 mt-10">
                <button onClick={focusLogin} className="liquid-glass rounded-full px-8 py-4 text-sm font-medium text-white hover:scale-[1.03] active:scale-[0.98] transition-transform cursor-pointer">
                  Try the Agent
                </button>
                <button className="rounded-full px-8 py-4 text-sm font-medium text-white border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer backdrop-blur-md hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] active:scale-[0.98]">
                  Simulate a Dispute
                </button>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1, delay: 0.6 } } }} className="mt-8 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <p className="text-xs text-white/60">No hallucinations. Every answer is evidence-backed.</p>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Login Box */}
          <div className="w-full max-w-[420px] lg:w-[420px] shrink-0 relative" id="login-box">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", damping: 25 }}
              whileHover={{ y: -5, boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 0 60px 0 rgba(99, 102, 241, 0.15)" }}
              className="w-full relative z-10 p-8 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-xl bg-white/[0.02] transition-shadow duration-500"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 0 40px 0 rgba(99, 102, 241, 0.1)"
              }}
            >
              <div className="flex mb-8 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {(["signin", "signup"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(""); }}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{ background: mode === m ? "#fff" : "transparent", color: mode === m ? "#000" : "rgba(255,255,255,0.6)" }}
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
                  <h2 className="text-3xl tracking-tight text-white mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    {mode === "signin" ? "Welcome back." : "Create your account."}
                  </h2>
                  <p className="text-sm mb-8 font-light text-white/60">
                    {mode === "signin" ? "Sign in to access your dashboard." : "Set up your agent access."}
                  </p>

                  <div className="mb-6 px-4 py-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4" style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.25)" }}>
                    <div>
                      <h3 className="text-xs font-semibold mb-0.5" style={{ color: "#ff8787" }}>🧪 Demo Login</h3>
                      <p className="text-[10px] leading-tight max-w-[200px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                        Google/Email auth works fully. These are for fast evaluation.
                      </p>
                    </div>
                    <div className="text-[11px] font-mono whitespace-nowrap shrink-0" style={{ color: "rgba(255,255,255,0.8)" }}>
                      <div className="flex justify-between gap-3 mb-1">
                        <span className="text-white/40 uppercase text-[9px] tracking-wider mt-0.5">Email</span>
                        <span className="text-white bg-black/40 px-1.5 py-0.5 rounded border border-white/5">jury@admin.com</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-white/40 uppercase text-[9px] tracking-wider mt-0.5">Pass</span>
                        <span className="text-white bg-black/40 px-1.5 py-0.5 rounded border border-white/5">Jury123</span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    onClick={handleGoogle}
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl text-sm font-medium transition-colors mb-6 disabled:opacity-40"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
                    onMouseEnter={(e) => !loading && ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)")}
                  >
                    <GoogleIcon />
                    Continue with Google
                  </motion.button>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">or with email</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <form onSubmit={handleEmail} className="flex flex-col gap-4">
                    {mode === "signup" && (
                      <InputField
                        label="Full name"
                        type="text"
                        value={name}
                        onChange={setName}
                        placeholder="Jane Doe"
                        required
                      />
                    )}
                    <InputField
                      id="email-input"
                      label="Email address"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder="you@company.com"
                      required
                    />
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-white/60">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={7}
                          placeholder={mode === "signup" ? "Min. 7 characters" : "•••••••"}
                          className="w-full h-12 px-4 pr-10 rounded-2xl text-sm focus:outline-none transition-all placeholder:text-white/30 bg-black/20 border border-white/10 text-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] focus:border-white/30 focus:bg-white/5"
                        />
                        <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
                          {showPassword ? (
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1 7.5C2.5 4 4.8 2 7.5 2s5 2 6.5 5.5C12.5 11 10.2 13 7.5 13S2.5 11 1 7.5z" stroke="currentColor" strokeWidth="1.2" /><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.2" /><path d="M2 2l11 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1 7.5C2.5 4 4.8 2 7.5 2s5 2 6.5 5.5C12.5 11 10.2 13 7.5 13S2.5 11 1 7.5z" stroke="currentColor" strokeWidth="1.2" /><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.2" /></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-xs mt-1 bg-[#ff4444]/10 border border-[#ff4444]/20 text-[#ff8f8f]">
                            <span className="shrink-0 mt-0.5">⚠</span>{error}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="liquid-glass mt-4 w-full h-12 rounded-2xl text-sm font-medium transition-all disabled:opacity-50 text-white"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                          Processing...
                        </span>
                      ) : mode === "signin" ? "Sign In" : "Create Account"}
                    </motion.button>
                  </form>
                  {mode === "signup" && (
                    <p className="text-[11px] text-center mt-5 leading-relaxed text-white/40">
                      By creating an account you agree to our Terms of Service and Privacy Policy.
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Problem & Solution Section */}
      <section className="w-full py-32 px-6 max-w-7xl mx-auto relative z-10 border-t border-white/10">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h3 className="text-sm uppercase tracking-widest text-indigo-400 mb-6 font-semibold">Problem</h3>
            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-medium text-white mb-2">Manual Checks</h4>
                <p className="text-[#a3a3a3] leading-relaxed text-sm">Settlement issues require checking Gateway, Bank & Ledger separately.</p>
              </div>
              <div>
                <h4 className="text-xl font-medium text-white mb-2">Scattered Data</h4>
                <p className="text-[#a3a3a3] leading-relaxed text-sm">Finding the exact delay or failure is slow and difficult.</p>
              </div>
              <div>
                <h4 className="text-xl font-medium text-white mb-2">Unclear Answers</h4>
                <p className="text-[#a3a3a3] leading-relaxed text-sm">Missing or conflicting records create uncertainty.</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm uppercase tracking-widest text-[#4ade80] mb-6 font-semibold">Solution</h3>
            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-medium text-white mb-2">AI-Powered Agent</h4>
                <p className="text-[#a3a3a3] leading-relaxed text-sm">Settly automatically traces transactions across all three systems.</p>
              </div>
              <div>
                <h4 className="text-xl font-medium text-white mb-2">Smart Analysis</h4>
                <p className="text-[#a3a3a3] leading-relaxed text-sm">Detects delays, failures and mismatches to find the likely root cause.</p>
              </div>
              <div>
                <h4 className="text-xl font-medium text-white mb-2">Clear Resolution</h4>
                <p className="text-[#a3a3a3] leading-relaxed text-sm">Gives an evidence-based explanation with confidence & exceptions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Demo Section */}
      <section className="w-full py-32 px-6 bg-white/5 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl text-center mb-16 text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Watch Settly Work</h2>
          
          <div className="bg-[#0D0D10] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 17 17" fill="none"><rect x="1.5" y="1.5" width="6" height="6" rx="1.5" fill="#000" /><rect x="9.5" y="1.5" width="6" height="6" rx="1.5" fill="#000" opacity="0.35" /><rect x="1.5" y="9.5" width="6" height="6" rx="1.5" fill="#000" opacity="0.35" /><rect x="9.5" y="9.5" width="6" height="6" rx="1.5" fill="#000" /></svg>
              </div>
              <div>
                <h4 className="text-sm font-medium">Settly Support Agent</h4>
                <p className="text-xs text-white/50">Online</p>
              </div>
            </div>
            
            {/* Chat Body */}
            <div className="p-6 space-y-6">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-indigo-500/20 text-white px-5 py-3 rounded-2xl rounded-tr-sm text-sm max-w-[80%] border border-indigo-500/30">
                  Why hasn&apos;t my settlement for TXN10456 gone through?
                </div>
              </div>
              
              {/* Bot Processing */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 shrink-0 rounded-full bg-white/10 flex items-center justify-center mt-1">
                  <svg width="14" height="14" viewBox="0 0 17 17" fill="none"><rect x="1.5" y="1.5" width="6" height="6" rx="1.5" fill="#fff" /><rect x="9.5" y="1.5" width="6" height="6" rx="1.5" fill="#fff" opacity="0.5" /><rect x="1.5" y="9.5" width="6" height="6" rx="1.5" fill="#fff" opacity="0.5" /><rect x="9.5" y="9.5" width="6" height="6" rx="1.5" fill="#fff" /></svg>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-indigo-300 font-mono">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                    Tracing: Gateway - Bank - Ledger
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-5 text-sm text-white/90 leading-relaxed shadow-sm">
                    <p className="mb-4">Your payment was successfully captured at the Gateway. The bank settlement is still pending (Batch #SETT99) - expected to clear by tomorrow.</p>
                    
                    <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-[#4ade80]/10 text-[#4ade80] rounded text-[10px] font-mono border border-[#4ade80]/20">Confidence Score: 0.92</span>
                      </div>
                      <button className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1 transition-colors">
                        Show proof
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Safe Autonomy Section */}
      <section className="w-full py-32 px-6 max-w-7xl mx-auto relative z-10 border-b border-white/10">
        <h2 className="text-4xl md:text-5xl text-center mb-16 text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Safe Autonomy</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-medium text-white mb-4">Deterministic Rule Engine</h3>
            <p className="text-[#a3a3a3] text-sm leading-relaxed">The AI never guesses. A rule engine cross-references Gateway, Bank & Ledger data first, assigning a fixed category like IN_CYCLE, FEE_DEDUCTION, or DATA_LAG.</p>
          </div>
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-medium text-white mb-4">Confidence Scoring</h3>
            <p className="text-[#a3a3a3] text-sm leading-relaxed">Every answer carries a 0–1 confidence score. Anything below threshold is automatically escalated - never guessed.</p>
          </div>
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-medium text-white mb-4">Bounded Actions</h3>
            <p className="text-[#a3a3a3] text-sm leading-relaxed">Settly can safely retry a settlement sync or auto-close a resolved ticket - always from a whitelist of pre-approved, reversible actions.</p>
          </div>
        </div>
        <div className="mt-16 text-center">
          <p className="text-2xl italic text-white/70" style={{ fontFamily: "'Instrument Serif', serif" }}>
            &quot;Autonomous but bounded - not blind automation.&quot;
          </p>
        </div>
      </section>

      {/* 5. Support Team View Section */}
      <section className="w-full py-32 px-6 max-w-5xl mx-auto relative z-10">
        <h2 className="text-4xl md:text-5xl text-center mb-16 text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Built for Support Teams Too</h2>
        <div className="bg-[#0D0D10] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-medium">Exception List</h3>
            <button className="px-4 py-2 bg-indigo-500/20 text-indigo-300 text-xs rounded-lg border border-indigo-500/30">Upload CSV</button>
          </div>
          
          <div className="flex gap-4 mb-8">
            <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
              <p className="text-2xl font-semibold">1,204</p>
              <p className="text-xs text-white/50 mt-1">Settled</p>
            </div>
            <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
              <p className="text-2xl font-semibold">86</p>
              <p className="text-xs text-white/50 mt-1">In Cycle</p>
            </div>
            <div className="flex-1 bg-red-500/10 p-4 rounded-2xl border border-red-500/20 text-center">
              <p className="text-2xl font-semibold text-red-400">12</p>
              <p className="text-xs text-red-400/70 mt-1">Exceptions</p>
            </div>
          </div>
          
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-white/40 uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="pb-3 font-medium">Transaction ID</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Confidence Score</th>
                <th className="pb-3 font-medium text-right">View Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              <tr>
                <td className="py-4 font-mono text-xs">TXN-4892</td>
                <td className="py-4"><span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-[10px]">MISMATCH</span></td>
                <td className="py-4"><span className="text-[#4ade80]">0.95</span></td>
                <td className="py-4 text-right"><button className="text-indigo-400 hover:text-indigo-300">Review</button></td>
              </tr>
              <tr>
                <td className="py-4 font-mono text-xs">TXN-9114</td>
                <td className="py-4"><span className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-[10px]">NOT_FOUND</span></td>
                <td className="py-4"><span className="text-yellow-500">0.72</span></td>
                <td className="py-4 text-right"><button className="text-indigo-400 hover:text-indigo-300">Review</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Technical Strategy / Impact */}
      <section className="w-full py-20 px-6 bg-white/5 relative z-10 border-y border-white/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl mb-8 text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>How It Works</h2>
            <ul className="space-y-6">
              <li className="flex gap-4"><span className="text-indigo-400 font-mono">01</span><p className="text-sm text-white/70"><strong className="text-white">Transaction Input</strong> - TXN ID / Date search & validation.</p></li>
              <li className="flex gap-4"><span className="text-indigo-400 font-mono">02</span><p className="text-sm text-white/70"><strong className="text-white">Data Ingestion</strong> - Gateway, Bank, Ledger records.</p></li>
              <li className="flex gap-4"><span className="text-indigo-400 font-mono">03</span><p className="text-sm text-white/70"><strong className="text-white">Trace Engine</strong> - ID & amount matching, status & timestamp checks, cross-system validation.</p></li>
              <li className="flex gap-4"><span className="text-indigo-400 font-mono">04</span><p className="text-sm text-white/70"><strong className="text-white">Explainable Output</strong> - Evidence-based response with reason, confidence & exception detection.</p></li>
            </ul>
          </div>
          <div>
            <h2 className="text-3xl mb-8 text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Impact</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <h4 className="text-white font-medium mb-1">Faster Resolution</h4>
                <p className="text-xs text-white/50">Reduces manual settlement investigation time.</p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Higher Accuracy</h4>
                <p className="text-xs text-white/50">Cross-checks Gateway, Bank & Ledger data.</p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Better Support</h4>
                <p className="text-xs text-white/50">Gives clear, evidence-backed answers.</p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Greater Transparency</h4>
                <p className="text-xs text-white/50">Shows transaction journey & confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer / Final CTA */}
      <footer className="w-full py-32 px-6 text-center relative z-10 flex flex-col items-center">
        <h2 className="text-5xl md:text-6xl text-white mb-10" style={{ fontFamily: "'Instrument Serif', serif" }}>
          From ticket-per-query to instant resolution.
        </h2>
        <p className="text-lg text-white/60 mb-12">See Settly resolve a dispute in real time.</p>
        <button onClick={focusLogin} className="liquid-glass rounded-full px-14 py-5 text-base font-medium text-white hover:scale-[1.03] transition-transform cursor-pointer">
          Try the Agent
        </button>
        
        <div className="flex gap-6 mt-20 text-sm text-white/40">
          <span className="hover:text-white cursor-pointer transition-colors">Product</span>
          <span className="hover:text-white cursor-pointer transition-colors">How it Works</span>
          <span className="hover:text-white cursor-pointer transition-colors">GitHub</span>
          <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
        </div>
        
        <p className="text-xs text-white/20 mt-10">made with ❤️ by Team.Zekoy</p>
      </footer>
    </div>
  );
}

function InputField({ label, type, value, onChange, placeholder, required, id }: { label: string; type: string; value: string; onChange: (v: string) => void; placeholder: string; required?: boolean; id?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5 text-white/60">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full h-12 px-4 rounded-2xl text-sm focus:outline-none transition-all placeholder:text-white/30 bg-black/20 border border-white/10 text-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] focus:border-white/30 focus:bg-white/5"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" /><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" /><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" /><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" /></svg>
  );
}
