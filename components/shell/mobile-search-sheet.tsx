"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useTokenSearch } from "@/hooks/use-token-search";
import { SearchResultList } from "@/components/shell/search-result-list";
import type { MarketToken } from "@/lib/types";

/** Full-screen search on mobile — an inline input has no room next to search/alerts/theme/demo
 *  triggers under ~640px, so this opens as its own screen instead of squeezing into the header. */
export function MobileSearchTrigger() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { results, loading } = useTokenSearch(query);

  function go(token: MarketToken) {
    setOpen(false);
    setQuery("");
    router.push(`/app/token/${token.chainId}/${token.tokenAddress}`);
  }

  return (
    <>
      <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" aria-label="Search" onClick={() => setOpen(true)}>
        <Search className="h-4 w-4" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="top" showCloseButton={false} className="h-dvh gap-0 p-0 md:hidden">
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle className="sr-only">Search tokens</SheetTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search token, symbol, or address…"
                  className="pl-9 h-10 bg-secondary/60 border-transparent focus-visible:border-ring"
                  aria-label="Search tokens"
                />
                {loading && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label="Close search" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
            <SearchResultList query={query} results={results} loading={loading} onSelect={go} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
