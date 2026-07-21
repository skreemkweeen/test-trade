import Link from "next/link";
import { ExternalLink, Inbox } from "lucide-react";
import { getTokenPairs } from "@/lib/api/dexscreener";
import { getCoinById, getOhlc } from "@/lib/api/coingecko";
import { TokenAvatar } from "@/components/market/token-avatar";
import { OhlcChart } from "@/components/market/ohlc-chart";
import { LivePriceChart } from "@/components/market/live-price-chart";
import { TradePanel } from "@/components/market/trade-panel";
import { formatPrice, formatPct, formatUsdCompact, formatAge, truncateAddress } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MarketToken } from "@/lib/types";

interface Props {
  params: Promise<{ chain: string; address: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { address } = await params;
  return { title: address };
}

export default async function TokenPage({ params }: Props) {
  const { chain, address } = await params;

  let token: MarketToken | null = null;
  let ohlc: Awaited<ReturnType<typeof getOhlc>> = [];

  if (chain === "market") {
    token = await getCoinById(address);
    if (token) ohlc = await getOhlc(address, 1);
  } else {
    const pairs = await getTokenPairs(chain, address);
    token = [...pairs].sort((a, b) => (b.liquidityUsd ?? 0) - (a.liquidityUsd ?? 0))[0] ?? null;
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-center text-muted-foreground">
        <Inbox className="h-8 w-8 opacity-50" />
        <p className="font-medium text-foreground">Token not found</p>
        <p className="text-sm">
          We couldn&apos;t find a live pair for <span className="font-mono">{truncateAddress(address, 6)}</span> on{" "}
          {chain}.
        </p>
        <Link href="/app/screener" className="mt-2 text-sm text-primary hover:underline">
          Browse the screener instead
        </Link>
      </div>
    );
  }

  const gain = (token.priceChange.h24 ?? 0) >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <TokenAvatar src={token.imageUrl} symbol={token.symbol} size={44} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{token.symbol}</h1>
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                {token.chainId === "market" ? "market" : token.chainId}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{token.name}</p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="font-mono text-2xl font-semibold tabular">{formatPrice(token.priceUsd)}</p>
          <p className={cn("text-sm font-medium tabular", gain ? "text-gain" : "text-loss")}>
            {formatPct(token.priceChange.h24)} · 24h
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Liquidity" value={formatUsdCompact(token.liquidityUsd)} />
        <Stat label="24h volume" value={formatUsdCompact(token.volume24h)} />
        <Stat label="Market cap" value={formatUsdCompact(token.marketCap)} />
        <Stat label="FDV" value={formatUsdCompact(token.fdv)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {token.source === "coingecko" ? (
            <OhlcChart coinId={token.tokenAddress} initial={ohlc} />
          ) : token.pairAddress ? (
            <LivePriceChart chainId={token.chainId} pairAddress={token.pairAddress} initialPriceUsd={token.priceUsd} />
          ) : (
            <div className="rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">
              No live chart available for this pair yet.
            </div>
          )}

          <div className="rounded-lg border border-border p-4">
            <h2 className="text-sm font-medium">Pair details</h2>
            <dl className="mt-3 grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-3">
              <Detail label="Pair age" value={formatAge(token.pairCreatedAt)} />
              <Detail label="24h buys" value={token.txns24h ? String(token.txns24h.buys) : "—"} />
              <Detail label="24h sells" value={token.txns24h ? String(token.txns24h.sells) : "—"} />
              <Detail label="DEX" value={token.dexId ?? "—"} />
              <Detail label="Token address" value={truncateAddress(token.tokenAddress, 6)} mono />
              <Detail label="1h change" value={formatPct(token.priceChange.h1)} tone={(token.priceChange.h1 ?? 0) >= 0 ? "gain" : "loss"} />
            </dl>
            {token.url && (
              <Link
                href={token.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View on source <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>

        <TradePanel symbol={token.symbol} priceUsd={token.priceUsd} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-3">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold tabular">{value}</p>
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "gain" | "loss";
}) {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 font-medium",
          mono && "font-mono text-xs",
          tone === "gain" && "text-gain",
          tone === "loss" && "text-loss",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
