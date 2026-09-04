"use client";

import ApprovalCard from "@/components/ui/approval-card";

export default function Default() {
  return (
    <div className="flex min-h-[320px] w-full items-center justify-center rounded-[var(--radius-window)] bg-[var(--canvas)] p-6">
      <ApprovalCard />
    </div>
  );
}
