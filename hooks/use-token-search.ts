"use client";

import { useEffect, useState } from "react";
import type { MarketToken } from "@/lib/types";

export function useTokenSearch(query: string) {
  const [results, setResults] = useState<MarketToken[]>([]);
  const [loading, setLoading] = useState(false);

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

  return { results, loading };
}
