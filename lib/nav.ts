import {
  LayoutDashboard,
  SlidersHorizontal,
  Users,
  Crosshair,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/app",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Trending, gainers, losers, movers",
  },
  {
    href: "/app/screener",
    label: "Screener",
    icon: SlidersHorizontal,
    description: "Filter every pair on-chain",
  },
  {
    href: "/app/copy-trading",
    label: "Copy Trading",
    icon: Users,
    description: "Follow top wallets",
  },
  {
    href: "/app/sniper",
    label: "Sniper",
    icon: Crosshair,
    description: "New-pair automation",
  },
  {
    href: "/app/portfolio",
    label: "Portfolio",
    icon: Wallet,
    description: "Your positions & PnL",
  },
];
