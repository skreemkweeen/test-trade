"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, AreaSeries, ColorType, type IChartApi, type UTCTimestamp } from "lightweight-charts";
import { usePolling } from "@/hooks/use-polling";
import { LiveBadge } from "@/components/market/live-badge";
import type { MarketToken } from "@/lib/types";

const MAX_POINTS = 300;

/**
 * DexScreener's free API doesn't expose historical OHLC candles for arbitrary pairs, so this
 * builds a real live price line from the moment the page opens by polling the pair endpoint —
 * genuine live data, not a fabricated candle history.
 */
export function LivePriceChart({
  chainId,
  pairAddress,
  initialPriceUsd,
}: {
  chainId: string;
  pairAddress: string;
  initialPriceUsd: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ReturnType<IChartApi["addSeries"]> | null>(null);
  const pointsRef = useRef<{ time: UTCTimestamp; value: number }[]>([]);
  const [pointCount, setPointCount] = useState(1);

  const { data, status } = usePolling<{ token: MarketToken | null; ts: number }>(
    `/api/chart/pair/${chainId}/${pairAddress}`,
    { intervalMs: 4000 },
  );

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
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: true },
      autoSize: true,
    });
    const precision = initialPriceUsd < 0.01 ? 8 : initialPriceUsd < 1 ? 6 : 2;
    const series = chart.addSeries(AreaSeries, {
      lineColor: "#a6e22e",
      topColor: "rgba(166,226,46,0.35)",
      bottomColor: "rgba(166,226,46,0)",
      lineWidth: 2,
      priceFormat: { type: "price", precision, minMove: 1 / 10 ** precision },
    });
    pointsRef.current = [{ time: Math.floor(Date.now() / 1000) as UTCTimestamp, value: initialPriceUsd }];
    series.setData(pointsRef.current);
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
    // Chart is created once on mount; initialPriceUsd only seeds the first point and the
    // price-scale precision, and intentionally shouldn't tear down/rebuild the chart if it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const price = data?.token?.priceUsd;
    if (!price || !seriesRef.current) return;
    const nextPoint = { time: Math.floor((data.ts ?? Date.now()) / 1000) as UTCTimestamp, value: price };
    const last = pointsRef.current[pointsRef.current.length - 1];
    if (last && last.time === nextPoint.time) return;
    pointsRef.current = [...pointsRef.current, nextPoint].slice(-MAX_POINTS);
    seriesRef.current.update(nextPoint);
    setPointCount(pointsRef.current.length);
  }, [data]);

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          Live price · since opened {pointCount > 1 ? `(${pointCount} ticks)` : ""}
        </span>
        <LiveBadge status={status} />
      </div>
      <div ref={containerRef} className="h-[360px] w-full" />
    </div>
  );
}
