import { Info } from "lucide-react";
import { Leaderboard } from "@/components/copy-trading/leaderboard";
import { DEMO_TRADERS } from "@/lib/demo/traders";

export const metadata = { title: "Copy Trading" };

export default function CopyTradingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Copy Trading</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Follow top wallets and mirror their positions automatically.
        </p>
      </div>

      <div className="flex gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 text-primary" />
        <p>
          This leaderboard uses illustrative demo data. Real wallet PnL tracking requires a paid
          on-chain indexer, which isn&apos;t wired up in this MVP. Following a trader here is fully
          simulated — no wallet linkage or trade execution occurs.
        </p>
      </div>

      <Leaderboard traders={DEMO_TRADERS} />
    </div>
  );
}
