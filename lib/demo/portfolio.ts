import type { MarketToken, PortfolioPosition } from "@/lib/types";

/**
 * Simulated holdings — no real wallet is connected in this MVP. Position sizes and entry
 * prices are illustrative, but current price/value/PnL are computed against real live market
 * data so the portfolio reacts to the same feed the rest of the app uses.
 */
const HOLDINGS: { symbol: string; amount: number; avgEntryUsd: number }[] = [
  { symbol: "SOL", amount: 42, avgEntryUsd: 61.2 },
  { symbol: "BONK", amount: 18_500_000, avgEntryUsd: 0.0000021 },
  { symbol: "JUP", amount: 3200, avgEntryUsd: 0.142 },
  { symbol: "WIF", amount: 640, avgEntryUsd: 0.198 },
  { symbol: "RAY", amount: 210, avgEntryUsd: 0.52 },
];

export function buildDemoPositions(pool: MarketToken[]): PortfolioPosition[] {
  const bySymbol = new Map(pool.map((t) => [t.symbol.toUpperCase(), t]));

  return HOLDINGS.map((h, i) => {
    const live = bySymbol.get(h.symbol);
    const priceUsd = live?.priceUsd ?? h.avgEntryUsd;
    const valueUsd = h.amount * priceUsd;
    const costUsd = h.amount * h.avgEntryUsd;
    return {
      id: `pos-${i}`,
      token: {
        symbol: h.symbol,
        name: live?.name ?? h.symbol,
        imageUrl: live?.imageUrl,
        priceUsd,
        priceChange: live?.priceChange ?? {},
        chainId: live?.chainId ?? "solana",
        tokenAddress: live?.tokenAddress ?? "",
      },
      amount: h.amount,
      avgEntryUsd: h.avgEntryUsd,
      valueUsd,
      pnlUsd: valueUsd - costUsd,
      pnlPct: costUsd > 0 ? ((valueUsd - costUsd) / costUsd) * 100 : 0,
    };
  });
}
