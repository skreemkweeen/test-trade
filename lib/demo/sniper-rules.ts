import type { SniperRule } from "@/lib/types";

export const DEFAULT_RULES: SniperRule[] = [
  {
    id: "r1",
    label: "Fresh liquid launches",
    enabled: true,
    minLiquidityUsd: 5000,
    maxAgeMinutes: 30,
    minBuysM5: 5,
    positionSizeSol: 0.5,
    chain: "solana",
  },
  {
    id: "r2",
    label: "Early momentum",
    enabled: false,
    minLiquidityUsd: 15000,
    maxAgeMinutes: 120,
    minBuysM5: 15,
    positionSizeSol: 1,
    chain: "solana",
  },
];
