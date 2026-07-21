import { TrendingUp, Activity, Zap, Flame } from "lucide-react";
import { StatCard } from "@/components/market/stat-card";
import { MarketDashboard } from "@/components/market/market-dashboard";
import { NewPairsPanel } from "@/components/market/new-pairs-panel";
import { getMovers, getNewPairs } from "@/lib/market/aggregate";
import { formatUsdCompact, formatPct } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [movers, newPairs] = await Promise.all([getMovers("movers", "solana"), getNewPairs("solana")]);

  const totalVolume = movers.reduce((sum, t) => sum + (t.volume24h ?? 0), 0);
  const topGainer = [...movers].sort((a, b) => (b.priceChange.h24 ?? 0) - (a.priceChange.h24 ?? 0))[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Live Solana on-chain markets, updated continuously.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="24h volume tracked" value={formatUsdCompact(totalVolume)} icon={Activity} />
        <StatCard label="Liquid pairs" value={String(movers.length)} icon={Zap} />
        <StatCard
          label="Top gainer (24h)"
          value={topGainer ? topGainer.symbol : "—"}
          sub={topGainer ? formatPct(topGainer.priceChange.h24) : undefined}
          icon={TrendingUp}
          tone="gain"
        />
        <StatCard label="Fresh pairs" value={String(newPairs.length)} sub="last hour" icon={Flame} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <MarketDashboard initialMovers={movers} />
        <NewPairsPanel initial={newPairs} />
      </div>
    </div>
  );
}
