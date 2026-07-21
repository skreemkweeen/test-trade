import { SniperConsole } from "@/components/sniper/sniper-console";
import { getNewPairs } from "@/lib/market/aggregate";
import { DEFAULT_RULES } from "@/lib/demo/sniper-rules";

export const metadata = { title: "Sniper" };

export default async function SniperPage() {
  const feed = await getNewPairs("solana");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Sniper</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Rule-based new-pair automation on Solana, watching the live feed.
        </p>
      </div>
      <SniperConsole initialRules={DEFAULT_RULES} initialFeed={feed} />
    </div>
  );
}
