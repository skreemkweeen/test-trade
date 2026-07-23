"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataSkyline, type SkylinePoint } from "@/components/marketing/data-skyline";

gsap.registerPlugin(useGSAP);

export function Hero({ skylinePoints }: { skylinePoints: SkylinePoint[] }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from("[data-hero-eyebrow]", { opacity: 0, y: 12, duration: 0.5 })
          .from("[data-hero-line]", { opacity: 0, y: 28, stagger: 0.09, duration: 0.7 }, "-=0.2")
          .from("[data-hero-sub]", { opacity: 0, y: 14, duration: 0.6 }, "-=0.35")
          .from("[data-hero-cta] > *", { opacity: 0, y: 14, stagger: 0.08, duration: 0.5 }, "-=0.3")
          .from("[data-hero-canvas]", { opacity: 0, scale: 0.94, duration: 0.9 }, "-=0.6");
        return () => tl.kill();
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            "[data-hero-eyebrow]",
            "[data-hero-line]",
            "[data-hero-sub]",
            "[data-hero-cta] > *",
            "[data-hero-canvas]",
          ],
          { opacity: 1, y: 0, scale: 1 },
        );
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative overflow-hidden bg-grid">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 pt-14 pb-16 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:pt-20 md:pb-24">
        <div>
          <p
            data-hero-eyebrow
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            <Radio className="h-3 w-3 text-primary" />
            Live on-chain data · no signup required to browse
          </p>

          <h1 className="mt-6 text-[13vw] leading-[0.92] font-semibold tracking-tight sm:text-6xl md:text-[4.4rem]">
            <span data-hero-line className="block">
              Every market.
            </span>
            <span data-hero-line className="block text-muted-foreground">
              One <span className="text-primary">terminal.</span>
            </span>
          </h1>

          <p data-hero-sub className="mt-6 max-w-md text-base text-muted-foreground md:text-lg">
            Trending, gainers, screener, copy trading and sniper tooling — the surfaces you
            currently keep six tabs open for, rebuilt as a single fast, live, mobile-ready
            terminal.
          </p>

          <div data-hero-cta className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="gap-2 text-[15px]">
              <Link href="/app">
                Open the terminal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-[15px]">
              <Link href="/app/screener">Browse the screener</Link>
            </Button>
          </div>
        </div>

        <div
          data-hero-canvas
          className="relative aspect-square w-full max-w-md justify-self-center md:justify-self-end"
          aria-hidden
        >
          <DataSkyline points={skylinePoints} />
        </div>
      </div>
    </section>
  );
}
