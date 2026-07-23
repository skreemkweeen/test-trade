"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTokenSearch } from "@/hooks/use-token-search";
import { SearchResultList } from "@/components/shell/search-result-list";
import type { MarketToken } from "@/lib/types";

/** Desktop/wide-viewport inline search — a dropdown under a persistent input. Below md, the
 *  shell renders MobileSearchTrigger instead, which opens a full-screen sheet: an inline input
 *  this small cannot stay usable next to the other header controls under ~640px. */
export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { results, loading } = useTokenSearch(query);

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
    <div ref={containerRef} className="relative hidden w-full max-w-sm md:block">
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
          <SearchResultList query={query} results={results} loading={loading} onSelect={go} />
        </div>
      )}
    </div>
  );
}
