"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { formatPrice, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MarketToken } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Feature {
  index: string;
  title: string;
  body: string;
}

const FEATURES: Feature[] = [
  {
    index: "01",
    title: "Screener that filters everything",
    body: "Liquidity, volume, market cap, pair age, chain — stack filters the way you would in a spreadsheet, on live on-chain pairs.",
  },
  {
    index: "02",
    title: "Copy trading, with receipts",
    body: "Every wallet on the leaderboard ships win rate, 30-day PnL, and average hold time before you decide to follow it.",
  },
  {
    index: "03",
    title: "Sniper automation, simulated safely",
    body: "Rule-based new-pair watching — minimum liquidity, max age, buy pressure — arm it and review the log. No custody, no live keys in this build.",
  },
  {
    index: "04",
    title: "One portfolio, every position",
    body: "Stop reconciling five wallets in five tabs. Positions, PnL, and allocation in one place.",
  },
];

export function FeatureRows({ proof }: { proof: MarketToken[] }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-feature-row]");
      const triggers = rows.map((row) =>
        gsap.from(row, {
          opacity: 0,
          y: 40,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: row, start: "top 82%", toggleActions: "play none none reverse" },
        }),
      );
      return () => triggers.forEach((t) => t.scrollTrigger?.kill());
    },
    { scope },
  );

  return (
    <section ref={scope} className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <h2 className="max-w-lg text-3xl font-semibold tracking-tight md:text-4xl">
        Six tabs, closed for good.
      </h2>

      <div className="mt-12 divide-y divide-border border-t border-border">
        {FEATURES.map((f, i) => (
          <div
            key={f.index}
            data-feature-row
            className="grid grid-cols-1 gap-4 py-10 md:grid-cols-[80px_1fr_1fr] md:items-start md:gap-8"
          >
            <span className="font-mono text-sm text-muted-foreground">{f.index}</span>
            <h3 className="text-xl font-medium tracking-tight md:text-2xl">{f.title}</h3>
            <p className="max-w-md text-sm text-muted-foreground md:text-base">{f.body}</p>
            {i === 0 && proof.length > 0 && <LiveProofStrip tokens={proof} />}
          </div>
        ))}
      </div>
    </section>
  );
}

function LiveProofStrip({ tokens }: { tokens: MarketToken[] }) {
  return (
    <div className="col-span-full mt-2 rounded-lg border border-border bg-card/60 md:col-start-2 md:col-span-2">
      <p className="border-b border-border px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Live from the screener, right now
      </p>
      <ul className="divide-y divide-border">
        {tokens.slice(0, 4).map((t) => (
          <li key={t.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="font-medium">{t.symbol}</span>
            <span className="flex items-center gap-3 tabular">
              <span className="font-mono text-muted-foreground">{formatPrice(t.priceUsd)}</span>
              <span className={cn("w-16 text-right", (t.priceChange.h24 ?? 0) >= 0 ? "text-gain" : "text-loss")}>
                {formatPct(t.priceChange.h24)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
