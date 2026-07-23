"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarketTable } from "@/components/market/market-table";
import { usePolling } from "@/hooks/use-polling";
import type { MarketToken } from "@/lib/types";

interface Filters {
  q: string;
  minLiquidity: string;
  minVolume: string;
  maxAgeHours: string;
  minChange24h: string;
}

const EMPTY_FILTERS: Filters = { q: "", minLiquidity: "", minVolume: "", maxAgeHours: "", minChange24h: "" };

export function Screener({ initial }: { initial: MarketToken[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const { data, status } = usePolling<{ data: MarketToken[] }>("/api/market/screener?chain=solana", {
    intervalMs: 30000,
    initialData: { data: initial },
  });

  const pool = useMemo(() => data?.data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const minLiquidity = Number(filters.minLiquidity) || 0;
    const minVolume = Number(filters.minVolume) || 0;
    const maxAgeHours = Number(filters.maxAgeHours) || Infinity;
    const minChange24h = filters.minChange24h === "" ? -Infinity : Number(filters.minChange24h);
    // Age filtering is inherently wall-clock-relative; there's no pure alternative to reading
    // the current time here.
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();

    return pool.filter((t) => {
      if (q && !t.symbol.toLowerCase().includes(q) && !t.name.toLowerCase().includes(q)) return false;
      if ((t.liquidityUsd ?? 0) < minLiquidity) return false;
      if ((t.volume24h ?? 0) < minVolume) return false;
      if ((t.priceChange.h24 ?? -Infinity) < minChange24h) return false;
      if (t.pairCreatedAt) {
        const ageHours = (now - t.pairCreatedAt) / 3_600_000;
        if (ageHours > maxAgeHours) return false;
      } else if (maxAgeHours !== Infinity) {
        return false;
      }
      return true;
    });
  }, [pool, filters]);

  function update<K extends keyof Filters>(key: K, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card/50 p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 space-y-1.5 sm:col-span-1">
            <Label className="text-xs text-muted-foreground">Chain</Label>
            <Select defaultValue="solana">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solana">Solana</SelectItem>
                <SelectItem value="ethereum" disabled>
                  Ethereum — soon
                </SelectItem>
                <SelectItem value="base" disabled>
                  Base — soon
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Search</Label>
            <Input placeholder="Symbol or name" value={filters.q} onChange={(e) => update("q", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Min liquidity ($)</Label>
            <Input
              inputMode="numeric"
              placeholder="e.g. 10000"
              value={filters.minLiquidity}
              onChange={(e) => update("minLiquidity", e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Min 24h volume ($)</Label>
            <Input
              inputMode="numeric"
              placeholder="e.g. 5000"
              value={filters.minVolume}
              onChange={(e) => update("minVolume", e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Max age (hours)</Label>
            <Input
              inputMode="numeric"
              placeholder="e.g. 24"
              value={filters.maxAgeHours}
              onChange={(e) => update("maxAgeHours", e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Min 24h change (%)</Label>
            <Input
              inputMode="numeric"
              placeholder="e.g. -10"
              value={filters.minChange24h}
              onChange={(e) => update("minChange24h", e.target.value.replace(/[^0-9.-]/g, ""))}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {pool.length} pairs match
          </p>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setFilters(EMPTY_FILTERS)}>
            <RotateCcw className="h-3 w-3" />
            Reset filters
          </Button>
        </div>
      </div>

      <MarketTable tokens={filtered} status={status} emptyLabel="No pairs match these filters" />
    </div>
  );
}
