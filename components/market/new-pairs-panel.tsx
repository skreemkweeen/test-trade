"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { usePolling } from "@/hooks/use-polling";
import { LiveBadge } from "@/components/market/live-badge";
import { TokenAvatar } from "@/components/market/token-avatar";
import { formatPrice, formatAge } from "@/lib/format";
import type { MarketToken } from "@/lib/types";

export function NewPairsPanel({ initial }: { initial: MarketToken[] }) {
  const { data, status } = usePolling<{ data: MarketToken[] }>("/api/market/new-pairs", {
    intervalMs: 25000,
    initialData: { data: initial },
  });
  const tokens = (data?.data ?? []).slice(0, 8);

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Freshly listed
        </span>
        <LiveBadge status={status} />
      </div>
      <ul className="divide-y divide-border">
        {tokens.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">No fresh pairs yet</li>
        )}
        {tokens.map((t) => (
          <li key={t.id}>
            <Link
              href={`/app/token/${t.chainId}/${t.tokenAddress}`}
              className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
            >
              <TokenAvatar src={t.imageUrl} symbol={t.symbol} size={28} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{t.symbol}</span>
                <span className="block truncate text-xs text-muted-foreground" suppressHydrationWarning>
                  {formatAge(t.pairCreatedAt)} old
                </span>
              </span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{formatPrice(t.priceUsd)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="border-t border-border p-2.5">
        <Link
          href="/app/sniper"
          className="block rounded-md px-2 py-1.5 text-center text-xs font-medium text-primary hover:bg-accent"
        >
          Set up sniper rules →
        </Link>
      </div>
    </div>
  );
}
