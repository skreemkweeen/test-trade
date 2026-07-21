"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Inbox } from "lucide-react";
import { TokenAvatar } from "@/components/market/token-avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatPrice, formatPct, formatUsdCompact, formatAge } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MarketToken } from "@/lib/types";
import type { PollStatus } from "@/hooks/use-polling";
import { LiveBadge } from "@/components/market/live-badge";

type SortKey = "priceUsd" | "h1" | "h24" | "volume24h" | "liquidityUsd" | "pairCreatedAt";

const COLUMNS: { key: SortKey; label: string; align?: "right"; hideBelow?: "sm" | "md" | "lg" }[] = [
  { key: "priceUsd", label: "Price", align: "right" },
  { key: "h1", label: "1h", align: "right", hideBelow: "sm" },
  { key: "h24", label: "24h", align: "right" },
  { key: "volume24h", label: "Volume", align: "right", hideBelow: "md" },
  { key: "liquidityUsd", label: "Liquidity", align: "right", hideBelow: "lg" },
  { key: "pairCreatedAt", label: "Age", align: "right", hideBelow: "md" },
];

const HIDE_CLASS: Record<"sm" | "md" | "lg", string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

export function MarketTable({
  tokens,
  status,
  emptyLabel = "No tokens match this view yet",
}: {
  tokens: MarketToken[] | undefined;
  status: PollStatus;
  emptyLabel?: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("volume24h");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const sorted = useMemo(() => {
    if (!tokens) return [];
    const list = [...tokens];
    list.sort((a, b) => {
      const av = sortKey === "h1" ? (a.priceChange.h1 ?? -Infinity) : sortKey === "h24" ? (a.priceChange.h24 ?? -Infinity) : (a[sortKey] ?? -Infinity);
      const bv = sortKey === "h1" ? (b.priceChange.h1 ?? -Infinity) : sortKey === "h24" ? (b.priceChange.h24 ?? -Infinity) : (b[sortKey] ?? -Infinity);
      return av === bv ? 0 : av > bv ? sortDir : -sortDir;
    });
    return list;
  }, [tokens, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(-1);
    }
  }

  const isLoading = status === "loading" && !tokens;

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {tokens ? `${tokens.length} pairs` : "Loading pairs…"}
        </span>
        <LiveBadge status={status} />
      </div>

      <div className="overflow-x-auto">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[140px] sm:w-[220px]">Token</TableHead>
              {COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(col.align === "right" && "text-right", col.hideBelow && HIDE_CLASS[col.hideBelow])}
                >
                  <button
                    onClick={() => toggleSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    aria-label={`Sort by ${col.label}`}
                  >
                    {col.label}
                    <ArrowUpDown className={cn("h-3 w-3", sortKey === col.key ? "opacity-100" : "opacity-30")} />
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-14 text-center text-muted-foreground">
                  <Inbox className="mx-auto mb-2 h-6 w-6 opacity-50" />
                  {emptyLabel}
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              sorted.map((t) => (
                <TableRow key={t.id} className="group">
                  <TableCell>
                    <Link
                      href={`/app/token/${t.chainId}/${t.tokenAddress}`}
                      className="flex items-center gap-2.5 focus-visible:outline-none"
                    >
                      <TokenAvatar src={t.imageUrl} symbol={t.symbol} size={28} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium group-hover:underline">
                          {t.symbol}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">{t.name}</span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular">{formatPrice(t.priceUsd)}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right text-sm tabular",
                      HIDE_CLASS.sm,
                      (t.priceChange.h1 ?? 0) >= 0 ? "text-gain" : "text-loss",
                    )}
                  >
                    {formatPct(t.priceChange.h1)}
                  </TableCell>
                  <TableCell className={cn("text-right text-sm font-medium tabular", (t.priceChange.h24 ?? 0) >= 0 ? "text-gain" : "text-loss")}>
                    {formatPct(t.priceChange.h24)}
                  </TableCell>
                  <TableCell className={cn("text-right text-sm tabular text-muted-foreground", HIDE_CLASS.md)}>
                    {formatUsdCompact(t.volume24h)}
                  </TableCell>
                  <TableCell className={cn("text-right text-sm tabular text-muted-foreground", HIDE_CLASS.lg)}>
                    {formatUsdCompact(t.liquidityUsd)}
                  </TableCell>
                  <TableCell
                    className={cn("text-right text-sm tabular text-muted-foreground", HIDE_CLASS.md)}
                    suppressHydrationWarning
                  >
                    {formatAge(t.pairCreatedAt)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {status === "error" && (
        <div className="flex items-center justify-between gap-3 border-t border-border bg-loss/10 px-4 py-2.5 text-xs text-loss">
          Live feed disconnected — showing the last data received.
          <Button size="sm" variant="outline" onClick={() => location.reload()} className="h-7 text-xs">
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
