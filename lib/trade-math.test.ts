import { describe, expect, it } from "vitest";
import { estimateTrade } from "./trade-math";

describe("estimateTrade", () => {
  it("buy in USD: pays exactly the entered USD, receives amount / price in tokens", () => {
    const r = estimateTrade({ side: "buy", unit: "usd", amount: 100, priceUsd: 25, slippagePct: 1 });
    expect(r.payAmount).toBeCloseTo(100);
    expect(r.payUnit).toBe("usd");
    expect(r.receiveAmount).toBeCloseTo(4); // 100 / 25
    expect(r.receiveUnit).toBe("token");
    expect(r.minimumReceived).toBeCloseTo(3.96); // 4 * (1 - 0.01)
  });

  it("buy in token units: pays amount * price in USD, receives exactly the entered tokens", () => {
    const r = estimateTrade({ side: "buy", unit: "token", amount: 4, priceUsd: 25, slippagePct: 0 });
    expect(r.payAmount).toBeCloseTo(100); // 4 * 25
    expect(r.payUnit).toBe("usd");
    expect(r.receiveAmount).toBeCloseTo(4);
    expect(r.receiveUnit).toBe("token");
    expect(r.minimumReceived).toBeCloseTo(4);
  });

  it("sell in token units: pays exactly the entered tokens, receives amount * price in USD", () => {
    const r = estimateTrade({ side: "sell", unit: "token", amount: 10, priceUsd: 78, slippagePct: 2 });
    expect(r.payAmount).toBeCloseTo(10);
    expect(r.payUnit).toBe("token");
    expect(r.receiveAmount).toBeCloseTo(780); // 10 * 78
    expect(r.receiveUnit).toBe("usd");
    expect(r.minimumReceived).toBeCloseTo(764.4); // 780 * 0.98
  });

  it("sell in USD units: pays amount / price in tokens, receives exactly the entered USD", () => {
    const r = estimateTrade({ side: "sell", unit: "usd", amount: 780, priceUsd: 78, slippagePct: 0 });
    expect(r.payAmount).toBeCloseTo(10); // 780 / 78
    expect(r.payUnit).toBe("token");
    expect(r.receiveAmount).toBeCloseTo(780);
    expect(r.receiveUnit).toBe("usd");
  });

  it("regression: buy no longer double-multiplies USD amount by price", () => {
    // Before the fix, estUsd for a buy was `amountNum * priceUsd`, i.e. entering "100" at a
    // price of $78 produced an estimate of $7,800 instead of the correct $100.
    const r = estimateTrade({ side: "buy", unit: "usd", amount: 100, priceUsd: 78, slippagePct: 1 });
    expect(r.payAmount).toBeCloseTo(100);
    expect(r.payAmount).not.toBeCloseTo(7800);
  });

  it("regression: sell no longer treats a token quantity as a USD amount", () => {
    // Before the fix, estUsd for a sell was `amountNum` verbatim, i.e. selling 10 tokens at
    // $78 each produced an estimate of $10 instead of the correct $780.
    const r = estimateTrade({ side: "sell", unit: "token", amount: 10, priceUsd: 78, slippagePct: 0 });
    expect(r.receiveAmount).toBeCloseTo(780);
    expect(r.receiveAmount).not.toBeCloseTo(10);
  });

  it("returns a zero estimate for non-positive or invalid amounts", () => {
    expect(estimateTrade({ side: "buy", unit: "usd", amount: 0, priceUsd: 25, slippagePct: 1 }).payAmount).toBe(0);
    expect(estimateTrade({ side: "buy", unit: "usd", amount: -5, priceUsd: 25, slippagePct: 1 }).payAmount).toBe(0);
    expect(estimateTrade({ side: "buy", unit: "usd", amount: NaN, priceUsd: 25, slippagePct: 1 }).payAmount).toBe(0);
  });

  it("returns a zero estimate when price is non-positive or invalid", () => {
    expect(estimateTrade({ side: "buy", unit: "usd", amount: 100, priceUsd: 0, slippagePct: 1 }).receiveAmount).toBe(0);
  });

  it("clamps negative slippage to zero rather than boosting the receive amount", () => {
    const r = estimateTrade({ side: "buy", unit: "usd", amount: 100, priceUsd: 25, slippagePct: -5 });
    expect(r.minimumReceived).toBeCloseTo(r.receiveAmount);
  });
});
