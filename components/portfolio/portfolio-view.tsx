import Link from "next/link";
import { Wallet, TrendingUp, Layers, Info } from "lucide-react";
import { TokenAvatar } from "@/components/market/token-avatar";
import { StatCard } from "@/components/market/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, formatUsdCompact, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PortfolioPosition } from "@/lib/types";

export function PortfolioView({ positions }: { positions: PortfolioPosition[] }) {
  const totalValue = positions.reduce((s, p) => s + p.valueUsd, 0);
  const totalCost = positions.reduce((s, p) => s + p.amount * p.avgEntryUsd, 0);
  const totalPnlUsd = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnlUsd / totalCost) * 100 : 0;
  const best = [...positions].sort((a, b) => b.pnlPct - a.pnlPct)[0];

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

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px]">Token</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Amount</TableHead>
                <TableHead className="hidden text-right md:table-cell">Avg entry</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">PnL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.token.tokenAddress ? (
                      <Link
                        href={`/app/token/${p.token.chainId}/${p.token.tokenAddress}`}
                        className="flex items-center gap-2.5"
                      >
                        <TokenAvatar src={p.token.imageUrl} symbol={p.token.symbol} size={28} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{p.token.symbol}</span>
                          <span className="block truncate text-xs text-muted-foreground">{p.token.name}</span>
                        </span>
                      </Link>
                    ) : (
                      <span className="flex items-center gap-2.5">
                        <TokenAvatar src={p.token.imageUrl} symbol={p.token.symbol} size={28} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{p.token.symbol}</span>
                          <span className="block truncate text-xs text-muted-foreground">{p.token.name}</span>
                        </span>
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm tabular text-muted-foreground sm:table-cell">
                    {p.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm tabular text-muted-foreground md:table-cell">
                    {formatPrice(p.avgEntryUsd)}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular">{formatPrice(p.token.priceUsd)}</TableCell>
                  <TableCell className="text-right text-sm font-medium tabular">{formatUsdCompact(p.valueUsd)}</TableCell>
                  <TableCell className={cn("text-right text-sm font-medium tabular", p.pnlUsd >= 0 ? "text-gain" : "text-loss")}>
                    {formatUsdCompact(p.pnlUsd)}
                    <span className="ml-1 text-xs opacity-70">({formatPct(p.pnlPct)})</span>
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
          {positions
            .map((p) => ({ p, pct: totalValue > 0 ? (p.valueUsd / totalValue) * 100 : 0 }))
            .sort((a, b) => b.pct - a.pct)
            .map(({ p, pct }) => (
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
