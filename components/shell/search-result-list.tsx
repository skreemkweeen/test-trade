import { Search as SearchIcon } from "lucide-react";
import { formatPrice, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MarketToken } from "@/lib/types";

export function SearchResultList({
  query,
  results,
  loading,
  onSelect,
  emptyClassName,
}: {
  query: string;
  results: MarketToken[];
  loading: boolean;
  onSelect: (token: MarketToken) => void;
  emptyClassName?: string;
}) {
  if (query.trim().length < 2) {
    return (
      <div className={cn("flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-muted-foreground", emptyClassName)}>
        <SearchIcon className="h-5 w-5 opacity-40" />
        Search by token name, symbol, or contract address.
      </div>
    );
  }

  if (results.length === 0 && !loading) {
    return (
      <p className={cn("px-4 py-8 text-center text-sm text-muted-foreground", emptyClassName)}>
        No tokens found for &ldquo;{query}&rdquo;
      </p>
    );
  }

  return (
    <div>
      {results.map((t) => {
        const change = t.priceChange.h24;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold uppercase">
                {t.symbol.slice(0, 2)}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{t.symbol}</span>
                <span className="block truncate text-xs text-muted-foreground">{t.name}</span>
              </span>
            </span>
            <span className="shrink-0 text-right tabular">
              <span className="block font-mono text-xs">{formatPrice(t.priceUsd)}</span>
              {typeof change === "number" && (
                <span className={cn("block text-xs", change >= 0 ? "text-gain" : "text-loss")}>{formatPct(change)}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
