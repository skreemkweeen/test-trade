import type { MarketToken } from "@/lib/types";

const BASE = "https://api.coingecko.com/api/v3";

interface CgMarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
}

interface CgTrendingResponse {
  coins: { item: { id: string; name: string; symbol: string; thumb: string; market_cap_rank: number } }[];
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

function toMarketToken(c: CgMarketCoin): MarketToken {
  return {
    id: `coingecko:${c.id}`,
    chainId: "market",
    tokenAddress: c.id,
    name: c.name,
    symbol: c.symbol.toUpperCase(),
    imageUrl: c.image,
    priceUsd: c.current_price,
    priceChange: {
      h1: c.price_change_percentage_1h_in_currency,
      h24: c.price_change_percentage_24h_in_currency,
    },
    volume24h: c.total_volume,
    marketCap: c.market_cap,
    fdv: c.fully_diluted_valuation ?? undefined,
    source: "coingecko",
  };
}

export async function getMarkets(opts: {
  category?: string;
  perPage?: number;
  page?: number;
}): Promise<MarketToken[]> {
  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: String(opts.perPage ?? 100),
    page: String(opts.page ?? 1),
    sparkline: "true",
    price_change_percentage: "1h,24h,7d",
  });
  if (opts.category) params.set("category", opts.category);
  const data = await safeJson<CgMarketCoin[]>(`${BASE}/coins/markets?${params}`, 30);
  return (data ?? []).map(toMarketToken);
}

export async function getTrendingCoins(): Promise<{ id: string; name: string; symbol: string; thumb: string }[]> {
  const data = await safeJson<CgTrendingResponse>(`${BASE}/search/trending`, 60);
  return (data?.coins ?? []).map((c) => c.item);
}

interface CgCoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: { large: string };
  market_data: {
    current_price: { usd: number };
    price_change_percentage_1h_in_currency?: { usd: number };
    price_change_percentage_24h_in_currency?: { usd: number };
    total_volume: { usd: number };
    market_cap: { usd: number };
    fully_diluted_valuation?: { usd: number };
  };
}

export async function getCoinById(id: string): Promise<MarketToken | null> {
  const data = await safeJson<CgCoinDetail>(
    `${BASE}/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
    20,
  );
  if (!data) return null;
  return {
    id: `coingecko:${data.id}`,
    chainId: "market",
    tokenAddress: data.id,
    name: data.name,
    symbol: data.symbol.toUpperCase(),
    imageUrl: data.image?.large,
    priceUsd: data.market_data.current_price.usd,
    priceChange: {
      h1: data.market_data.price_change_percentage_1h_in_currency?.usd,
      h24: data.market_data.price_change_percentage_24h_in_currency?.usd,
    },
    volume24h: data.market_data.total_volume.usd,
    marketCap: data.market_data.market_cap.usd,
    fdv: data.market_data.fully_diluted_valuation?.usd,
    source: "coingecko",
  };
}

export interface OhlcCandle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

export async function getOhlc(coinId: string, days: 1 | 7 | 30 = 1): Promise<OhlcCandle[]> {
  const data = await safeJson<number[][]>(
    `${BASE}/coins/${encodeURIComponent(coinId)}/ohlc?vs_currency=usd&days=${days}`,
    30,
  );
  return (data ?? []).map(([time, open, high, low, close]) => ({
    time: Math.floor(time / 1000),
    open,
    high,
    low,
    close,
  }));
}
