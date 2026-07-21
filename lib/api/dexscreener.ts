import type { MarketToken } from "@/lib/types";

const BASE = "https://api.dexscreener.com";

/** Raw shapes we actually read from DexScreener's public API (subset, no key required). */
interface DsPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceUsd?: string;
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number };
  volume?: { h24?: number; h6?: number; h1?: number; m5?: number };
  liquidity?: { usd?: number };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  txns?: { h24?: { buys: number; sells: number }; m5?: { buys: number; sells: number } };
  info?: { imageUrl?: string };
}

interface DsSearchResponse {
  pairs: DsPair[] | null;
}

interface DsTokenProfile {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  description?: string;
}

interface DsTokenBoost {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  description?: string;
  totalAmount?: number;
}

function toMarketToken(p: DsPair): MarketToken {
  return {
    id: `${p.chainId}:${p.pairAddress}`,
    chainId: p.chainId,
    dexId: p.dexId,
    pairAddress: p.pairAddress,
    tokenAddress: p.baseToken.address,
    name: p.baseToken.name,
    symbol: p.baseToken.symbol,
    imageUrl: p.info?.imageUrl,
    priceUsd: p.priceUsd ? Number(p.priceUsd) : 0,
    priceChange: {
      m5: p.priceChange?.m5,
      h1: p.priceChange?.h1,
      h6: p.priceChange?.h6,
      h24: p.priceChange?.h24,
    },
    volume24h: p.volume?.h24,
    liquidityUsd: p.liquidity?.usd,
    fdv: p.fdv,
    marketCap: p.marketCap,
    pairCreatedAt: p.pairCreatedAt,
    txns24h: p.txns?.h24,
    txnsM5: p.txns?.m5,
    url: p.url,
    source: "dexscreener",
  };
}

async function safeJson<T>(url: string, revalidateSeconds: number): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: revalidateSeconds },
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function searchPairs(query: string): Promise<MarketToken[]> {
  const data = await safeJson<DsSearchResponse>(
    `${BASE}/latest/dex/search?q=${encodeURIComponent(query)}`,
    15,
  );
  return (data?.pairs ?? []).filter((p) => p.priceUsd).map(toMarketToken);
}

/** Aggregates a handful of high-liquidity search queries into a broad "market" pool for ranking. */
export async function getMarketPool(chain: string): Promise<MarketToken[]> {
  const queries = chain === "solana" ? ["solana", "pump"] : [chain];
  const results = await Promise.all(queries.map((q) => searchPairs(q)));
  const seen = new Map<string, MarketToken>();
  for (const list of results) {
    for (const t of list) {
      if (t.chainId !== chain) continue;
      if (!t.liquidityUsd || t.liquidityUsd < 1000) continue;
      const existing = seen.get(t.id);
      if (!existing || (t.volume24h ?? 0) > (existing.volume24h ?? 0)) {
        seen.set(t.id, t);
      }
    }
  }
  return Array.from(seen.values());
}

export async function getLatestTokenProfiles(): Promise<DsTokenProfile[]> {
  const data = await safeJson<DsTokenProfile[]>(`${BASE}/token-profiles/latest/v1`, 20);
  return data ?? [];
}

export async function getTopBoosts(): Promise<DsTokenBoost[]> {
  const data = await safeJson<DsTokenBoost[]>(`${BASE}/token-boosts/top/v1`, 20);
  return data ?? [];
}

export async function getTokenPairs(chainId: string, tokenAddress: string): Promise<MarketToken[]> {
  const data = await safeJson<DsSearchResponse>(
    `${BASE}/latest/dex/tokens/${encodeURIComponent(tokenAddress)}`,
    5,
  );
  return (data?.pairs ?? []).filter((p) => p.chainId === chainId).map(toMarketToken);
}

export async function getPairByAddress(chainId: string, pairAddress: string): Promise<MarketToken | null> {
  const data = await safeJson<DsSearchResponse>(
    `${BASE}/latest/dex/pairs/${chainId}/${pairAddress}`,
    3,
  );
  const pair = data?.pairs?.[0];
  return pair ? toMarketToken(pair) : null;
}

/** Enriches boosted/new-profile token lists (which lack price data) with live pair data. */
export async function enrichTokenAddresses(
  entries: { chainId: string; tokenAddress: string }[],
): Promise<MarketToken[]> {
  const results = await Promise.all(
    entries.slice(0, 24).map(async (e) => {
      const pairs = await getTokenPairs(e.chainId, e.tokenAddress);
      return pairs.sort((a, b) => (b.liquidityUsd ?? 0) - (a.liquidityUsd ?? 0))[0] ?? null;
    }),
  );
  return results.filter((t): t is MarketToken => t !== null);
}
