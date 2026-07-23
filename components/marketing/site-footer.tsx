import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <h2 className="max-w-md text-3xl font-semibold tracking-tight md:text-4xl">
            Stop switching tabs. Start in the terminal.
          </h2>
          <Button asChild size="lg" className="gap-2 shrink-0">
            <Link href="/app">
              Open SatoVanta
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} SatoVanta. MVP build — simulated trading, live market data.</p>
          <p>Not financial advice. Sniper &amp; copy trading are simulated in this build.</p>
        </div>
      </div>
    </footer>
  );
}
