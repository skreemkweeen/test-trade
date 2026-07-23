/** Normalized market token shape used across the whole UI, regardless of upstream source. */
export interface MarketToken {
  id: string; // `${chainId}:${pairAddress}` — stable UI key
  chainId: string;
  dexId?: string;
  pairAddress?: string;
  tokenAddress: string;
  name: string;
  symbol: string;
  imageUrl?: string;
  priceUsd: number;
  priceChange: {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
  };
  volume24h?: number;
  liquidityUsd?: number;
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number; // epoch ms
  txns24h?: { buys: number; sells: number };
  txnsM5?: { buys: number; sells: number };
  url?: string;
  source: "dexscreener" | "coingecko";
}

export interface Trader {
  id: string;
  handle: string;
  avatarSeed: string;
  winRate: number;
  pnl30dUsd: number;
  pnl30dPct: number;
  followers: number;
  tradesCount: number;
  avgHoldTime: string;
  topToken: string;
  chain: string;
  verified?: boolean;
}

export interface PortfolioPosition {
  id: string;
  token: Pick<MarketToken, "symbol" | "name" | "imageUrl" | "priceUsd" | "priceChange" | "chainId" | "tokenAddress">;
  amount: number;
  avgEntryUsd: number;
  valueUsd: number;
  pnlUsd: number;
  pnlPct: number;
}

export interface SniperRule {
  id: string;
  label: string;
  enabled: boolean;
  minLiquidityUsd: number;
  maxAgeMinutes: number;
  minBuysM5: number;
  positionSizeSol: number;
  chain: string;
}

export type Timeframe = "m5" | "h1" | "h6" | "h24";
