"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <Link href="/" className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border shrink-0">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Zap className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <span className="font-semibold tracking-tight text-[15px]">SatoVanta</span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="rounded-md bg-sidebar-accent/50 p-3">
          <p className="text-xs font-medium text-sidebar-accent-foreground">Simulated trading</p>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            Sniper & copy trading run in simulation mode. No wallet keys are held and no on-chain
            transactions are sent.
          </p>
        </div>
      </div>
    </aside>
  );
}
