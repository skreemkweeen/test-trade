"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";
import { estimateTrade, type TradeSide, type TradeUnit } from "@/lib/trade-math";
import { cn } from "@/lib/utils";

const USD_PRESETS = [10, 50, 100, 250];

export function TradePanel({ symbol, priceUsd }: { symbol: string; priceUsd: number }) {
  const [side, setSide] = useState<TradeSide>("buy");
  const [unit, setUnit] = useState<TradeUnit>("usd");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState([1]);
  const [reviewOpen, setReviewOpen] = useState(false);

  const amountNum = Number(amount) || 0;
  const estimate = estimateTrade({ side, unit, amount: amountNum, priceUsd, slippagePct: slippage[0] });

  function openReview() {
    if (amountNum <= 0) {
      toast.error("Enter an amount first");
      return;
    }
    setReviewOpen(true);
  }

  function confirm() {
    toast.success(`Simulated ${side} order filled`, {
      description: `${
        side === "buy"
          ? `Paid ${formatPrice(estimate.payAmount)} → received ~${estimate.receiveAmount.toFixed(4)} ${symbol}`
          : `Sold ${estimate.payAmount.toFixed(4)} ${symbol} → received ~${formatPrice(estimate.receiveAmount)}`
      } · no real transaction was sent.`,
    });
    setAmount("");
    setReviewOpen(false);
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <Tabs value={side} onValueChange={(v) => setSide(v as TradeSide)}>
        <TabsList className="w-full">
          <TabsTrigger value="buy" className="flex-1 data-[state=active]:text-gain">
            Buy
          </TabsTrigger>
          <TabsTrigger value="sell" className="flex-1 data-[state=active]:text-loss">
            Sell
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="amount" className="text-xs text-muted-foreground">
            Amount
          </Label>
          <div className="flex rounded-md border border-border p-0.5 text-[11px]">
            {(["usd", "token"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                aria-pressed={unit === u}
                className={cn(
                  "rounded px-2 py-0.5 font-medium",
                  unit === u ? "bg-secondary text-foreground" : "text-muted-foreground",
                )}
              >
                {u === "usd" ? "USD" : symbol}
              </button>
            ))}
          </div>
        </div>
        <Input
          id="amount"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          className="font-mono"
        />
        {unit === "usd" && (
          <div className="flex gap-1.5 pt-1">
            {USD_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className="flex-1 rounded-md border border-border py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
              >
                ${p}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Slippage tolerance</Label>
          <span className="font-mono text-xs">{slippage[0].toFixed(1)}%</span>
        </div>
        <Slider value={slippage} onValueChange={setSlippage} min={0.1} max={5} step={0.1} />
      </div>

      <div className="mt-4 space-y-1.5 rounded-md bg-secondary/50 px-3 py-2 text-xs">
        <Row label={side === "buy" ? "You pay" : "You sell"} value={formatEstimate(estimate.payAmount, estimate.payUnit, symbol)} />
        <Row label="You receive (est.)" value={formatEstimate(estimate.receiveAmount, estimate.receiveUnit, symbol)} />
        <Row
          label="Minimum received"
          value={formatEstimate(estimate.minimumReceived, estimate.receiveUnit, symbol)}
          muted
        />
      </div>

      <Button
        onClick={openReview}
        className={cn("mt-4 w-full", side === "sell" && "bg-loss text-loss-foreground hover:bg-loss/90")}
      >
        Review simulated order
      </Button>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Simulation only — no wallet, keys, or on-chain transaction involved. No network or
        platform fees apply.
      </p>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Review simulated {side} order</DialogTitle>
            <DialogDescription>
              Nothing is sent on-chain. This confirms the simulated fill you&apos;ll see logged.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 rounded-md border border-border p-3 text-sm">
            <Row label="Side" value={side === "buy" ? "Buy" : "Sell"} />
            <Row label="Token" value={symbol} />
            <Row label={side === "buy" ? "You pay" : "You sell"} value={formatEstimate(estimate.payAmount, estimate.payUnit, symbol)} />
            <Row label="You receive (est.)" value={formatEstimate(estimate.receiveAmount, estimate.receiveUnit, symbol)} />
            <Row label="Slippage tolerance" value={`${slippage[0].toFixed(1)}%`} />
            <Row label="Minimum received" value={formatEstimate(estimate.minimumReceived, estimate.receiveUnit, symbol)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Back
            </Button>
            <Button onClick={confirm} className={cn(side === "sell" && "bg-loss text-loss-foreground hover:bg-loss/90")}>
              Confirm simulated order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatEstimate(value: number, unit: TradeUnit, symbol: string): string {
  return unit === "usd" ? formatPrice(value) : `${value.toFixed(value < 1 ? 6 : 4)} ${symbol}`;
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-mono", muted && "text-muted-foreground")}>{value}</span>
    </div>
  );
}
