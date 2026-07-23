export type TradeSide = "buy" | "sell";
export type TradeUnit = "usd" | "token";

export interface TradeEstimateInput {
  side: TradeSide;
  /** Unit the `amount` field is denominated in. */
  unit: TradeUnit;
  amount: number;
  priceUsd: number;
  /** Percent, e.g. 1 = 1%. */
  slippagePct: number;
}

export interface TradeEstimate {
  /** What the user gives up. */
  payAmount: number;
  payUnit: TradeUnit;
  /** What the user gets, before slippage. */
  receiveAmount: number;
  receiveUnit: TradeUnit;
  /** Worst-case receive amount at the given slippage tolerance, same unit as receiveUnit. */
  minimumReceived: number;
}

const ZERO_ESTIMATE = (payUnit: TradeUnit, receiveUnit: TradeUnit): TradeEstimate => ({
  payAmount: 0,
  payUnit,
  receiveAmount: 0,
  receiveUnit,
  minimumReceived: 0,
});

/**
 * Converts a buy/sell order in either USD or token units into pay/receive amounts and a
 * slippage-adjusted minimum-received figure.
 *
 * Deliberately does not include a network fee or platform fee line: this build has no real fee
 * schedule, and showing a fabricated fee (even $0.00) would misrepresent a simulation as if it
 * reflected real execution costs.
 */
export function estimateTrade({ side, unit, amount, priceUsd, slippagePct }: TradeEstimateInput): TradeEstimate {
  const payUnit: TradeUnit = side === "buy" ? "usd" : "token";
  const receiveUnit: TradeUnit = side === "buy" ? "token" : "usd";

  if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(priceUsd) || priceUsd <= 0) {
    return ZERO_ESTIMATE(payUnit, receiveUnit);
  }

  const tokenAmount = unit === "token" ? amount : amount / priceUsd;
  const usdAmount = unit === "usd" ? amount : amount * priceUsd;

  const payAmount = side === "buy" ? usdAmount : tokenAmount;
  const receiveAmount = side === "buy" ? tokenAmount : usdAmount;

  const slippageFraction = Number.isFinite(slippagePct) ? Math.max(slippagePct, 0) / 100 : 0;
  const minimumReceived = receiveAmount * (1 - slippageFraction);

  return { payAmount, payUnit, receiveAmount, receiveUnit, minimumReceived };
}
