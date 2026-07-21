import type { Trader } from "@/lib/types";

/**
 * Illustrative leaderboard data. There is no free, keyless API for real Solana wallet trade
 * history/PnL — wiring this to real data means an indexer (Birdeye, Vybe, etc.) with a paid
 * key. This is deterministic sample data, clearly labeled as a demo in the UI, not presented
 * as live.
 */
export const DEMO_TRADERS: Trader[] = [
  { id: "t1", handle: "0xNocturne", avatarSeed: "nocturne", winRate: 78, pnl30dUsd: 184200, pnl30dPct: 312, followers: 4210, tradesCount: 214, avgHoldTime: "6h", topToken: "PUMP", chain: "solana", verified: true },
  { id: "t2", handle: "sandwich.sol", avatarSeed: "sandwich", winRate: 71, pnl30dUsd: 96800, pnl30dPct: 188, followers: 2870, tradesCount: 402, avgHoldTime: "38m", topToken: "BONK", chain: "solana", verified: true },
  { id: "t3", handle: "quiet_alpha", avatarSeed: "quiet", winRate: 66, pnl30dUsd: 71500, pnl30dPct: 94, followers: 1590, tradesCount: 118, avgHoldTime: "2d", topToken: "JTO", chain: "solana" },
  { id: "t4", handle: "degenmath", avatarSeed: "degenmath", winRate: 58, pnl30dUsd: 52300, pnl30dPct: 61, followers: 998, tradesCount: 331, avgHoldTime: "12m", topToken: "WIF", chain: "solana" },
  { id: "t5", handle: "riverwatch", avatarSeed: "river", winRate: 74, pnl30dUsd: 44100, pnl30dPct: 140, followers: 1204, tradesCount: 76, avgHoldTime: "4h", topToken: "ZAMA", chain: "solana", verified: true },
  { id: "t6", handle: "0xVantablack", avatarSeed: "vanta", winRate: 62, pnl30dUsd: 31900, pnl30dPct: 47, followers: 733, tradesCount: 158, avgHoldTime: "1h", topToken: "RAY", chain: "solana" },
  { id: "t7", handle: "slowbleed", avatarSeed: "slowbleed", winRate: 44, pnl30dUsd: -8600, pnl30dPct: -12, followers: 312, tradesCount: 210, avgHoldTime: "22m", topToken: "BOME", chain: "solana" },
  { id: "t8", handle: "north.exe", avatarSeed: "north", winRate: 69, pnl30dUsd: 27200, pnl30dPct: 58, followers: 655, tradesCount: 94, avgHoldTime: "5h", topToken: "PENGU", chain: "solana" },
  { id: "t9", handle: "cinderpump", avatarSeed: "cinder", winRate: 81, pnl30dUsd: 118700, pnl30dPct: 264, followers: 3390, tradesCount: 187, avgHoldTime: "3h", topToken: "PUMP", chain: "solana", verified: true },
  { id: "t10", handle: "gm_farmer", avatarSeed: "gm", winRate: 51, pnl30dUsd: 6100, pnl30dPct: 9, followers: 210, tradesCount: 442, avgHoldTime: "9m", topToken: "SOL", chain: "solana" },
];
