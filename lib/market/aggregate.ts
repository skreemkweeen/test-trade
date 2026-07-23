import { getMarketPool, getLatestTokenProfiles, getTopBoosts, enrichTokenAddresses, searchPairs } from "@/lib/api/dexscreener";
import { getMarkets, getTrendingCoins } from "@/lib/api/coingecko";
import type { MarketToken } from "@/lib/types";

/** DEX APIs occasionally surface broken/manipulated pairs (e.g. a wrapped token whose quote
 *  side has near-zero liquidity, producing a nominal "500,000% gain"). Filter those out before
 *  they can appear as a real ranked result — a trading terminal cannot show implausible numbers. */
function isPlausibleMarketToken(t: MarketToken): boolean {
  if (!(typeof t.priceChange.h24 === "number") || !(t.priceUsd > 0)) return false;
  if (Math.abs(t.priceChange.h24) > 5000) return false;
  return isSanePricing(t);
}

/** Lighter check for feeds (trending/new-pairs) that must tolerate tokens too fresh to have
 *  24h change data yet — still rejects the liquidity/marketCap mismatch that signals a broken pair. */
function isSanePricing(t: MarketToken): boolean {
  if (t.marketCap && t.liquidityUsd && t.liquidityUsd > 0) {
    if (t.marketCap / t.liquidityUsd > 50000) return false;
  }
  return true;
}

/** Gainers/losers/movers ranked from the live Solana on-chain pool (DexScreener) blended with
 *  the broader Solana-ecosystem market (CoinGecko) so the list has both meme-coin volatility
 *  and established-token liquidity. */
export async function getMovers(kind: "gainers" | "losers" | "movers", chain = "solana") {
  const [pool, cgMarkets] = await Promise.all([
    getMarketPool(chain),
    getMarkets({ category: "solana-ecosystem", perPage: 100 }),
  ]);

  const combined: MarketToken[] = [...pool, ...cgMarkets];
  const withChange = combined.filter(isPlausibleMarketToken);

  let ranked: MarketToken[];
  if (kind === "gainers") {
    ranked = withChange.filter((t) => (t.priceChange.h24 ?? 0) > 0).sort((a, b) => (b.priceChange.h24 ?? 0) - (a.priceChange.h24 ?? 0));
  } else if (kind === "losers") {
    ranked = withChange.filter((t) => (t.priceChange.h24 ?? 0) < 0).sort((a, b) => (a.priceChange.h24 ?? 0) - (b.priceChange.h24 ?? 0));
  } else {
    ranked = [...withChange].sort((a, b) => (b.volume24h ?? 0) - (a.volume24h ?? 0));
  }
  return ranked.slice(0, 50);
}

/** "Trending" = boosted/paid-attention DexScreener pairs blended with CoinGecko's own trending search. */
export async function getTrending(chain = "solana") {
  const [boosts, cgTrending] = await Promise.all([getTopBoosts(), getTrendingCoins()]);
  const chainBoosts = boosts.filter((b) => b.chainId === chain);
  const enriched = await enrichTokenAddresses(
    chainBoosts.map((b) => ({ chainId: b.chainId, tokenAddress: b.tokenAddress })),
  );
  return { onchain: enriched.filter(isSanePricing), market: cgTrending };
}

/** Freshly-created pairs — the raw feed a sniper bot would watch. */
export async function getNewPairs(chain = "solana") {
  const profiles = await getLatestTokenProfiles();
  const chainProfiles = profiles.filter((p) => p.chainId === chain);
  const enriched = await enrichTokenAddresses(chainProfiles.map((p) => ({ chainId: p.chainId, tokenAddress: p.tokenAddress })));
  return enriched.filter(isSanePricing);
}

/** Full on-chain pool for the screener — every liquid Solana pair we can see, unranked and
 *  uncapped, for the client to filter/sort locally. */
export async function getScreenerPool(chain = "solana") {
  const [pool, cgMarkets] = await Promise.all([
    getMarketPool(chain),
    getMarkets({ category: "solana-ecosystem", perPage: 100 }),
  ]);
  const combined: MarketToken[] = [...pool, ...cgMarkets];
  return combined.filter(isSanePricing);
}

export async function searchMarket(query: string, chain = "solana") {
  if (!query.trim()) return [];
  const results = await searchPairs(query);
  return results
    .filter((t) => t.chainId === chain)
    .filter(isSanePricing)
    .slice(0, 20);
}
