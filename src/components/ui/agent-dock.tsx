"use client";

import {
  ChatIcon,
  PaperPlaneTiltIcon,
  XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useRef,
  useState,
} from "react";

type AgentDockMode = "idle" | "composing" | "working";

interface AgentDockProps {
  agentName: string;
  className?: string;
  idleStatus?: string;
  workingStatus?: string;
  onMessageSubmit?: (message: string) => void | Promise<void>;
  forceMode?: AgentDockMode;
}

const dockTransition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1],
} as const;

export function AgentDock({
  agentName,
  className,
  idleStatus = "Ready",
  workingStatus = "Working...",
  onMessageSubmit,
  forceMode
}: AgentDockProps) {
  const [internalMode, setInternalMode] = useState<AgentDockMode>("idle");
  const mode = forceMode || internalMode;
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldReduceMotion = useReducedMotion();

  function openComposer() {
    setInternalMode("composing");
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }

  async function submitMessage() {
    const nextMessage = message.trim();
    if (!nextMessage) {
      openComposer();
      return;
    }
    setMessage("");
    if (!forceMode) setInternalMode("working");
    await onMessageSubmit?.(nextMessage);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "composing") {
      void submitMessage();
      return;
    }
    openComposer();
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }
    event.preventDefault();
    void submitMessage();
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      <div className="flex w-full flex-col-reverse overflow-hidden rounded-2xl p-2 text-white shadow-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(12px)" }}>
        <div 
          className="flex items-center gap-3 px-1 cursor-pointer"
          onClick={() => { if (mode === "idle") openComposer(); }}
        >
          <div className="size-9 flex items-center justify-center shrink-0 rounded-xl bg-white shadow-sm" style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect width="10" height="10" rx="2" fill="#000" />
              <rect x="14" width="10" height="10" rx="2" fill="#000" />
              <rect y="14" width="10" height="10" rx="2" fill="#000" />
              <rect x="14" y="14" width="10" height="10" rx="2" fill="#a1a1aa" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-none" style={{ color: "var(--foreground)" }}>
              {agentName}
            </p>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 truncate text-xs"
                style={{ color: "var(--muted-foreground)" }}
                exit={{ opacity: 0, y: -6 }}
                initial={{ opacity: 0, y: 6 }}
                key={mode}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                {mode === "working" ? workingStatus : idleStatus}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <DockButton
              icon={
                mode === "composing" ? (
                  <PaperPlaneTiltIcon weight="fill" />
                ) : (
                  <ChatIcon weight="bold" />
                )
              }
              label={mode === "composing" ? "Send" : "Chat"}
              shortcut="Enter"
              type="submit"
              disabled={mode === "working"}
            />
          </div>
        </div>
        <motion.div
          animate={{
            height: mode === "composing" ? 120 : 0,
            opacity: mode === "composing" ? 1 : 0,
          }}
          aria-hidden={mode !== "composing"}
          className="overflow-hidden"
          initial={false}
          transition={shouldReduceMotion ? { duration: 0 } : dockTransition}
        >
          <div className="relative mb-2 mt-2">
            <button
              aria-label="Close composer"
              className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-md text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
              onClick={() => { if (!forceMode) setInternalMode("idle"); }}
              type="button"
            >
              <XIcon className="size-3.5" weight="bold" />
            </button>
            <textarea
              aria-label="Message agent"
              className="h-28 w-full resize-none rounded-xl px-3 py-3 pr-9 text-sm leading-relaxed outline-none"
              style={{ background: "rgba(0,0,0,0.2)", color: "var(--foreground)", border: "1px solid rgba(255,255,255,0.05)" }}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Ask me anything..."
              ref={textareaRef}
              value={message}
            />
          </div>
        </motion.div>
      </div>
    </form>
  );
}

function DockButton({
  icon,
  label,
  shortcut,
  type = "button",
  disabled = false
}: {
  icon: ReactNode;
  label: string;
  shortcut: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ color: "var(--foreground)", background: "rgba(255,255,255,0.03)" }}
      type={type}
      disabled={disabled}
    >
      <span className="size-4 text-[var(--muted-foreground)]">{icon}</span>
      <span>{label}</span>
      <kbd className="flex h-6 px-1.5 items-center justify-center rounded-md font-mono text-[10px]" style={{ background: "rgba(255,255,255,0.1)", color: "var(--muted-foreground)" }}>
        {shortcut}
      </kbd>
    </button>
  );
}

export default AgentDock;
