"use client";

import { cn } from "@/lib/utils";
import type { PollStatus } from "@/hooks/use-polling";

const CONFIG: Record<PollStatus, { label: string; dot: string; text: string }> = {
  loading: { label: "Connecting", dot: "bg-muted-foreground", text: "text-muted-foreground" },
  live: { label: "Live", dot: "bg-gain", text: "text-gain" },
  stale: { label: "Stale", dot: "bg-warn", text: "text-warn" },
  error: { label: "Disconnected", dot: "bg-loss", text: "text-loss" },
};

export function LiveBadge({ status, className }: { status: PollStatus; className?: string }) {
  const cfg = CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", cfg.text, className)}>
      <span className="relative flex h-1.5 w-1.5">
        {status === "live" && (
          <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", cfg.dot)} />
        )}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", cfg.dot)} />
      </span>
      {cfg.label}
    </span>
  );
}
