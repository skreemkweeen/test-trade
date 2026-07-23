import { formatPrice, formatPct } from "@/lib/format";
import type { MarketToken } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TickerTape({ tokens }: { tokens: MarketToken[] }) {
  const loop = [...tokens, ...tokens];
  return (
    <div
      className="relative w-full overflow-hidden border-y border-border bg-card/60"
      role="marquee"
      aria-label="Live token prices"
    >
      <div className="flex w-max animate-marquee motion-reduce:animate-none py-2.5">
        {loop.map((t, i) => (
          <span key={`${t.id}-${i}`} className="flex items-center gap-2 px-5 text-xs whitespace-nowrap tabular">
            <span className="font-semibold text-foreground">{t.symbol}</span>
            <span className="font-mono text-muted-foreground">{formatPrice(t.priceUsd)}</span>
            <span className={cn("font-medium", (t.priceChange.h24 ?? 0) >= 0 ? "text-gain" : "text-loss")}>
              {formatPct(t.priceChange.h24)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
