"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketTable } from "@/components/market/market-table";
import { usePolling } from "@/hooks/use-polling";
import type { MarketToken } from "@/lib/types";

const TABS = [
  { value: "trending", label: "Trending" },
  { value: "gainers", label: "Gainers" },
  { value: "losers", label: "Losers" },
  { value: "movers", label: "Top volume" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export function MarketDashboard({ initialMovers }: { initialMovers: MarketToken[] }) {
  const [tab, setTab] = useState<TabValue>("movers");

  const { data, status } = usePolling<{ data: MarketToken[] }>(`/api/market/movers?kind=${tab}`, {
    intervalMs: 20000,
    initialData: tab === "movers" ? { data: initialMovers } : undefined,
  });

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
      <TabsList>
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="mt-4">
        <MarketTable
          tokens={data?.data}
          status={status}
          emptyLabel={
            tab === "trending"
              ? "Nothing boosted on this chain right now"
              : tab === "gainers"
                ? "No pairs are up right now"
                : tab === "losers"
                  ? "No pairs are down right now"
                  : "No liquid pairs found"
          }
        />
      </div>
    </Tabs>
  );
}
