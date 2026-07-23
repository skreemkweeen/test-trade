"use client";

import Link from "next/link";
import { Bell, Zap } from "lucide-react";
import { GlobalSearch } from "@/components/shell/global-search";
import { MobileSearchTrigger } from "@/components/shell/mobile-search-sheet";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { WalletConnect } from "@/components/shell/wallet-connect";
import { Button } from "@/components/ui/button";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur supports-backdrop-blur:bg-background/80 md:gap-3 md:px-6">
      <Link href="/" className="flex items-center gap-2 md:hidden">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Zap className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </Link>

      <div className="flex flex-1 justify-start">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-0.5 md:gap-1.5">
        <MobileSearchTrigger />
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Alerts">
          <Bell className="h-4 w-4" />
        </Button>
        <ThemeToggle />
        <WalletConnect />
      </div>
    </header>
  );
}
