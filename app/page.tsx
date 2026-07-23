import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Hero } from "@/components/marketing/hero";
import { TickerTape } from "@/components/marketing/ticker-tape";
import { FeatureRows } from "@/components/marketing/feature-rows";
import { getMovers } from "@/lib/market/aggregate";
import type { SkylinePoint } from "@/components/marketing/data-skyline";

export default async function LandingPage() {
  const movers = await getMovers("movers", "solana");
  const tickerTokens = movers.slice(0, 16);
  const skylinePoints: SkylinePoint[] = movers.slice(0, 40).map((t) => ({
    symbol: t.symbol,
    changePct: t.priceChange.h24 ?? 0,
    volume: t.volume24h ?? 0,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <TickerTape tokens={tickerTokens} />
      <main className="flex-1">
        <Hero skylinePoints={skylinePoints} />
        <FeatureRows proof={movers.slice(0, 6)} />
      </main>
      <SiteFooter />
    </div>
  );
}
