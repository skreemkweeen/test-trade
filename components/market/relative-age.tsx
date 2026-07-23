"use client";

import { useEffect, useState } from "react";
import { formatAge } from "@/lib/format";

/**
 * Relative "age" text depends on wall-clock time, which can differ between server render and
 * client hydration (network/compile latency can cross a minute boundary), causing a hydration
 * mismatch. Rendering a stable placeholder until mount — identical on server and first client
 * paint — then swapping to the real value client-side avoids the mismatch entirely rather than
 * just suppressing the resulting warning.
 */
export function RelativeAge({ createdAt }: { createdAt: number | undefined }) {
  const [mounted, setMounted] = useState(false);
  // Client-mount guard: server and pre-mount client render identically ("—"), so there is no
  // hydration mismatch to produce — this only swaps in the real value after hydration completes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  return <>{mounted ? formatAge(createdAt) : "—"}</>;
}
