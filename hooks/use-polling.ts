"use client";

import { useEffect, useRef, useState } from "react";

export type PollStatus = "loading" | "live" | "stale" | "error";

interface UsePollingOptions<T> {
  intervalMs?: number;
  initialData?: T;
  enabled?: boolean;
}

/** Polls a JSON endpoint on an interval and reports connection health for the required
 *  loading/stale/disconnected states — never just silently keeps old data with no signal. */
export function usePolling<T>(url: string | null, opts: UsePollingOptions<T> = {}) {
  const { intervalMs = 15000, initialData, enabled = true } = opts;
  const [data, setData] = useState<T | undefined>(initialData);
  const [status, setStatus] = useState<PollStatus>(initialData ? "live" : "loading");
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const failureCount = useRef(0);

  useEffect(() => {
    if (!url || !enabled) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function tick() {
      try {
        const res = await fetch(url as string, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as T;
        if (cancelled) return;
        failureCount.current = 0;
        setData(json);
        setStatus("live");
        setLastUpdated(Date.now());
      } catch {
        if (cancelled) return;
        failureCount.current += 1;
        setStatus(failureCount.current >= 3 ? "error" : "stale");
      } finally {
        if (!cancelled) timer = setTimeout(tick, intervalMs);
      }
    }

    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [url, intervalMs, enabled]);

  return { data, status, lastUpdated };
}
