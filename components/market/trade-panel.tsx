"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const PRESETS = [0.1, 0.5, 1, 2];

export function TradePanel({ symbol, priceUsd }: { symbol: string; priceUsd: number }) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState([1]);

  const amountNum = Number(amount) || 0;
  const estUsd = side === "buy" ? amountNum * priceUsd : amountNum;

  function submit() {
    if (amountNum <= 0) {
      toast.error("Enter an amount first");
      return;
    }
    toast.success(`Simulated ${side} order placed`, {
      description: `${side === "buy" ? `~${(amountNum / priceUsd || 0).toFixed(4)} ${symbol}` : `${amountNum} ${symbol}`} · no real transaction was sent.`,
    });
    setAmount("");
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <Tabs value={side} onValueChange={(v) => setSide(v as "buy" | "sell")}>
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
        <Label htmlFor="amount" className="text-xs text-muted-foreground">
          Amount {side === "buy" ? "(USD)" : `(${symbol})`}
        </Label>
        <Input
          id="amount"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          className="font-mono"
        />
        <div className="flex gap-1.5 pt-1">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(String(p))}
              className="flex-1 rounded-md border border-border py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Slippage tolerance</Label>
          <span className="font-mono text-xs">{slippage[0].toFixed(1)}%</span>
        </div>
        <Slider value={slippage} onValueChange={setSlippage} min={0.1} max={5} step={0.1} />
      </div>

      <div className="mt-4 flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2 text-xs">
        <span className="text-muted-foreground">Est. {side === "buy" ? "cost" : "receive"}</span>
        <span className="font-mono">{formatPrice(estUsd)}</span>
      </div>

      <Button
        onClick={submit}
        className={cn("mt-4 w-full", side === "sell" && "bg-loss text-loss-foreground hover:bg-loss/90")}
      >
        {side === "buy" ? "Simulate buy" : "Simulate sell"}
      </Button>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Simulation only — no wallet, keys, or on-chain transaction involved.
      </p>
    </div>
  );
}
