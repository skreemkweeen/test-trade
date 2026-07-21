"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatPrice, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MarketToken } from "@/lib/types";

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MarketToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }
    // Debounced search-in-flight indicator, synchronizing UI with the external fetch below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.data ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function go(token: MarketToken) {
    setOpen(false);
    setQuery("");
    router.push(`/app/token/${token.chainId}/${token.tokenAddress}`);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search token, symbol, or address…"
        className="pl-9 h-9 bg-secondary/60 border-transparent focus-visible:border-ring"
        aria-label="Search tokens"
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}

      {open && query.trim().length >= 2 && (
        <div className="absolute top-11 left-0 right-0 z-50 max-h-80 overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
          {results.length === 0 && !loading && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No tokens found for &ldquo;{query}&rdquo;
            </p>
          )}
          {results.map((t) => {
            const change = t.priceChange.h24;
            return (
              <button
                key={t.id}
                onClick={() => go(t)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold uppercase">
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
                    <span className={cn("block text-xs", change >= 0 ? "text-gain" : "text-loss")}>
                      {formatPct(change)}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
