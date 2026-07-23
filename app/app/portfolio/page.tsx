import { PortfolioView } from "@/components/portfolio/portfolio-view";
import { buildDemoPositions } from "@/lib/demo/portfolio";
import { getScreenerPool } from "@/lib/market/aggregate";

export const metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const pool = await getScreenerPool("solana");
  const positions = buildDemoPositions(pool);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Portfolio</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Every position, one view.</p>
      </div>
      <PortfolioView positions={positions} />
    </div>
  );
}
