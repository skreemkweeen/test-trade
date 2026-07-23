import Link from "next/link";
import { Wallet, TrendingUp, Layers, Info, AlertTriangle } from "lucide-react";
import { TokenAvatar } from "@/components/market/token-avatar";
import { StatCard } from "@/components/market/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, formatUsdCompact, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PortfolioPosition } from "@/lib/types";

const CONCENTRATION_WARNING_THRESHOLD = 40;

export function PortfolioView({ positions }: { positions: PortfolioPosition[] }) {
  const totalValue = positions.reduce((s, p) => s + p.valueUsd, 0);
  const totalCost = positions.reduce((s, p) => s + p.amount * p.avgEntryUsd, 0);
  const totalPnlUsd = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnlUsd / totalCost) * 100 : 0;
  const best = [...positions].sort((a, b) => b.pnlPct - a.pnlPct)[0];

  const allocations = positions
    .map((p) => ({ p, pct: totalValue > 0 ? (p.valueUsd / totalValue) * 100 : 0 }))
    .sort((a, b) => b.pct - a.pct);
  const largest = allocations[0];

  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-20 text-center text-muted-foreground">
        <Wallet className="h-6 w-6 opacity-50" />
        <p className="font-medium text-foreground">No positions yet</p>
        <p className="text-sm">Connect a wallet to see your holdings here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 text-primary" />
        <p>
          Demo portfolio — position sizes and entry prices are illustrative, but current price,
          value, and PnL are computed from real live market data.
        </p>
      </div>

      {largest && largest.pct >= CONCENTRATION_WARNING_THRESHOLD && (
        <div className="flex gap-2 rounded-lg border border-warn/40 bg-warn/10 p-3 text-xs text-warn">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>
            High concentration: {largest.pct.toFixed(1)}% of the portfolio is exposed to{" "}
            {largest.p.token.symbol}. A 10% {largest.p.token.symbol} decline would reduce
            portfolio value by approximately {(largest.pct / 10).toFixed(1)}%, excluding changes
            in other assets. This is a factual exposure calculation, not investment advice.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total value" value={formatUsdCompact(totalValue)} icon={Wallet} />
        <StatCard
          label="Total PnL"
          value={formatUsdCompact(totalPnlUsd)}
          sub={formatPct(totalPnlPct)}
          icon={TrendingUp}
          tone={totalPnlUsd >= 0 ? "gain" : "loss"}
        />
        <StatCard label="Positions" value={String(positions.length)} icon={Layers} />
        <StatCard
          label="Best performer"
          value={best?.token.symbol ?? "—"}
          sub={best ? formatPct(best.pnlPct) : undefined}
          icon={TrendingUp}
          tone="gain"
        />
      </div>

      {/* Mobile: stacked cards — a 6-column financial table cannot stay legible under ~640px
          (long prices like $0.0000003 collide with adjacent columns), so this renders as
          cards instead of squeezing text until it overlaps. */}
      <div className="space-y-2.5 md:hidden">
        {positions.map((p) => (
          <PositionCard key={p.id} position={p} />
        ))}
      </div>

      {/* Desktop / tablet: table. */}
      <div className="hidden rounded-lg border border-border overflow-hidden md:block">
        <div className="overflow-x-auto">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px]">Token</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="hidden text-right lg:table-cell">Avg entry</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-[150px] text-right">PnL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <TokenLink position={p} />
                  </TableCell>
                  <TableCell className="text-right text-sm tabular text-muted-foreground">
                    {p.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm tabular text-muted-foreground lg:table-cell">
                    {formatPrice(p.avgEntryUsd)}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular">{formatPrice(p.token.priceUsd)}</TableCell>
                  <TableCell className="text-right text-sm font-medium tabular">{formatUsdCompact(p.valueUsd)}</TableCell>
                  <TableCell className={cn("text-right text-sm font-medium tabular", p.pnlUsd >= 0 ? "text-gain" : "text-loss")}>
                    {formatUsdCompact(p.pnlUsd)}
                    <span className="ml-1 block text-xs opacity-70">({formatPct(p.pnlPct)})</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <h2 className="text-sm font-medium">Allocation</h2>
        <div className="mt-3 space-y-2.5">
          {allocations.map(({ p, pct }) => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-xs font-medium">{p.token.symbol}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-12 shrink-0 text-right text-xs tabular text-muted-foreground">{pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TokenLink({ position: p }: { position: PortfolioPosition }) {
  const inner = (
    <>
      <TokenAvatar src={p.token.imageUrl} symbol={p.token.symbol} size={28} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{p.token.symbol}</span>
        <span className="block truncate text-xs text-muted-foreground">{p.token.name}</span>
      </span>
    </>
  );
  return p.token.tokenAddress ? (
    <Link href={`/app/token/${p.token.chainId}/${p.token.tokenAddress}`} className="flex items-center gap-2.5">
      {inner}
    </Link>
  ) : (
    <span className="flex items-center gap-2.5">{inner}</span>
  );
}

function PositionCard({ position: p }: { position: PortfolioPosition }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-3">
        <TokenLink position={p} />
        <div className="shrink-0 text-right">
          <p className="text-sm font-medium tabular">{formatUsdCompact(p.valueUsd)}</p>
          <p className={cn("text-xs font-medium tabular", p.pnlUsd >= 0 ? "text-gain" : "text-loss")}>
            {formatUsdCompact(p.pnlUsd)} ({formatPct(p.pnlPct)})
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-2.5 text-center">
        <div>
          <p className="text-[10px] text-muted-foreground">Amount</p>
          <p className="text-xs font-medium tabular">{p.amount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Avg entry</p>
          <p className="text-xs font-medium tabular">{formatPrice(p.avgEntryUsd)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Price</p>
          <p className="text-xs font-medium tabular">{formatPrice(p.token.priceUsd)}</p>
        </div>
      </div>
    </div>
  );
}
