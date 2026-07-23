import { Screener } from "@/components/market/screener";
import { getScreenerPool } from "@/lib/market/aggregate";

export const metadata = { title: "Screener" };

export default async function ScreenerPage() {
  const pool = await getScreenerPool("solana");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Screener</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Filter every liquid Solana pair by liquidity, volume, age, and momentum.
        </p>
      </div>
      <Screener initial={pool} />
    </div>
  );
}
