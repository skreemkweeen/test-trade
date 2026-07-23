import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shell/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur supports-backdrop-blur:bg-background/70 md:px-8">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Zap className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <span className="font-semibold tracking-tight text-[15px]">SatoVanta</span>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button asChild size="sm">
          <Link href="/app">Launch app</Link>
        </Button>
      </div>
    </header>
  );
}
