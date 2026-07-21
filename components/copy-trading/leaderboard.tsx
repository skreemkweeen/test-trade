"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatUsdCompact, formatCompact } from "@/lib/format";
import type { Trader } from "@/lib/types";
import { toast } from "sonner";

function colorFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `oklch(0.6 0.14 ${hue})`;
}

export function Leaderboard({ traders }: { traders: Trader[] }) {
  const [following, setFollowing] = useState<Set<string>>(new Set());

  const sorted = useMemo(() => [...traders].sort((a, b) => b.pnl30dPct - a.pnl30dPct), [traders]);

  function toggleFollow(t: Trader) {
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(t.id)) {
        next.delete(t.id);
        toast(`Unfollowed ${t.handle}`);
      } else {
        next.add(t.id);
        toast.success(`Copy-following ${t.handle}`, {
          description: "Simulated — no real wallet linkage or trade execution occurs.",
        });
      }
      return next;
    });
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">#</TableHead>
              <TableHead className="w-[180px]">Trader</TableHead>
              <TableHead className="text-right">Win rate</TableHead>
              <TableHead className="text-right">30d PnL</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Followers</TableHead>
              <TableHead className="hidden text-right md:table-cell">Trades</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Avg hold</TableHead>
              <TableHead className="hidden lg:table-cell">Top token</TableHead>
              <TableHead className="w-[110px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((t, i) => {
              const isFollowing = following.has(t.id);
              return (
                <TableRow key={t.id}>
                  <TableCell className="text-xs text-muted-foreground tabular">{i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                        style={{ backgroundColor: colorFor(t.avatarSeed) }}
                        aria-hidden
                      >
                        {t.handle.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex items-center gap-1">
                        <span className="truncate text-sm font-medium">{t.handle}</span>
                        {t.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular">{t.winRate}%</TableCell>
                  <TableCell className={cn("text-right text-sm font-medium tabular", t.pnl30dUsd >= 0 ? "text-gain" : "text-loss")}>
                    {formatUsdCompact(t.pnl30dUsd)}
                    <span className="ml-1 text-xs opacity-70">
                      ({t.pnl30dPct >= 0 ? "+" : ""}
                      {t.pnl30dPct}%)
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-right text-sm tabular text-muted-foreground sm:table-cell">
                    {formatCompact(t.followers)}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm tabular text-muted-foreground md:table-cell">
                    {t.tradesCount}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm tabular text-muted-foreground lg:table-cell">
                    {t.avgHoldTime}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{t.topToken}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={isFollowing ? "secondary" : "outline"}
                      className="h-7 gap-1 text-xs"
                      onClick={() => toggleFollow(t)}
                    >
                      <Users className="h-3 w-3" />
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
