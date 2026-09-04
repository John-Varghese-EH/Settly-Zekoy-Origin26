"use client";

import { AgentDock } from "@/components/ui/agent-dock";

const avatarSrc =
  "https://cdn.21st.dev/assets/mirror/0e/0eb56130c1d872f702d99f0e4449feee3bad82c30ab14db063ace0927ae5a038.svg";

export default function Default() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--bg-chat)] p-8">
      <AgentDock
        agentName="Zara"
        avatarSrc={avatarSrc}
        className="w-full max-w-md"
        idleStatus="Your hyperaide"
        onMessageSubmit={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }}
        workingStatus="doing stuff..."
      />
    </div>
  );
}
