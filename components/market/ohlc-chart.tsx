"use client";

import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, ColorType, type IChartApi } from "lightweight-charts";
import { usePolling } from "@/hooks/use-polling";
import { LiveBadge } from "@/components/market/live-badge";
import type { OhlcCandle } from "@/lib/api/coingecko";

/** Real OHLC candles from CoinGecko, refreshed periodically — used for established coins
 *  that have full historical candle data available for free. */
export function OhlcChart({ coinId, initial }: { coinId: string; initial: OhlcCandle[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ReturnType<IChartApi["addSeries"]> | null>(null);

  const { data, status } = usePolling<{ candles: OhlcCandle[] }>(`/api/chart/ohlc/${coinId}`, {
    intervalMs: 30000,
    initialData: { candles: initial },
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8a93a6",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(148,163,184,0.08)" },
        horzLines: { color: "rgba(148,163,184,0.08)" },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true },
      autoSize: true,
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#a6e22e",
      downColor: "#e2483d",
      borderVisible: false,
      wickUpColor: "#a6e22e",
      wickDownColor: "#e2483d",
    });
    chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => chart.applyOptions({}));
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !data?.candles?.length) return;
    seriesRef.current.setData(
      data.candles.map((c) => ({ time: c.time as never, open: c.open, high: c.high, low: c.low, close: c.close })),
    );
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">Price · 24h candles</span>
        <LiveBadge status={status} />
      </div>
      <div ref={containerRef} className="h-[360px] w-full" />
    </div>
  );
}
