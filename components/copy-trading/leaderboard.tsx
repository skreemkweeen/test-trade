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

function Avatar({ trader }: { trader: Trader }) {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
      style={{ backgroundColor: colorFor(trader.avatarSeed) }}
      aria-hidden
    >
      {trader.handle.slice(0, 2).toUpperCase()}
    </span>
  );
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
    <div className="space-y-3">
      {/* Mobile: stacked cards. A 9-column table cannot stay legible under ~640px, so below
          md this renders as cards instead of squeezing columns until text overlaps. */}
      <div className="space-y-2.5 md:hidden">
        {sorted.map((t, i) => {
          const isFollowing = following.has(t.id);
          return (
            <div key={t.id} className="rounded-lg border border-border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-4 shrink-0 text-xs text-muted-foreground tabular">{i + 1}</span>
                  <Avatar trader={t} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1">
                      <span className="truncate text-sm font-medium">{t.handle}</span>
                      {t.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />}
                    </span>
                    <span className="block text-xs text-muted-foreground">{t.tradesCount} trades · {t.avgHoldTime} avg hold</span>
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={isFollowing ? "secondary" : "outline"}
                  className="h-8 shrink-0 gap-1 text-xs"
                  onClick={() => toggleFollow(t)}
                >
                  <Users className="h-3 w-3" />
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-2.5 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground">Win rate</p>
                  <p className="text-sm font-medium tabular">{t.winRate}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">30d PnL</p>
                  <p className={cn("text-sm font-medium tabular", t.pnl30dUsd >= 0 ? "text-gain" : "text-loss")}>
                    {formatUsdCompact(t.pnl30dUsd)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Followers</p>
                  <p className="text-sm font-medium tabular">{formatCompact(t.followers)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop / tablet: table. */}
      <div className="hidden rounded-lg border border-border overflow-hidden md:block">
        <div className="overflow-x-auto">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">#</TableHead>
                <TableHead className="w-[180px]">Trader</TableHead>
                <TableHead className="text-right">Win rate</TableHead>
                <TableHead className="text-right">30d PnL</TableHead>
                <TableHead className="text-right">Followers</TableHead>
                <TableHead className="hidden text-right lg:table-cell">Trades</TableHead>
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
                        <Avatar trader={t} />
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
                    <TableCell className="text-right text-sm tabular text-muted-foreground">
                      {formatCompact(t.followers)}
                    </TableCell>
                    <TableCell className="hidden text-right text-sm tabular text-muted-foreground lg:table-cell">
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
    </div>
  );
}
