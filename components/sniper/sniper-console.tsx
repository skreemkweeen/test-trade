"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Crosshair, Plus, Trash2, Zap, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TokenAvatar } from "@/components/market/token-avatar";
import { LiveBadge } from "@/components/market/live-badge";
import { RelativeAge } from "@/components/market/relative-age";
import { usePolling } from "@/hooks/use-polling";
import { formatUsdCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MarketToken, SniperRule } from "@/lib/types";
import { toast } from "sonner";

interface LogEntry {
  id: string;
  ts: number;
  ruleLabel: string;
  token: MarketToken;
  positionSizeSol: number;
}

function evaluate(rule: SniperRule, token: MarketToken): boolean {
  if (!rule.enabled) return false;
  if ((token.liquidityUsd ?? 0) < rule.minLiquidityUsd) return false;
  if (!token.pairCreatedAt) return false;
  const ageMinutes = (Date.now() - token.pairCreatedAt) / 60000;
  if (ageMinutes > rule.maxAgeMinutes) return false;
  if ((token.txnsM5?.buys ?? 0) < rule.minBuysM5) return false;
  return true;
}

export function SniperConsole({ initialRules, initialFeed }: { initialRules: SniperRule[]; initialFeed: MarketToken[] }) {
  const [rules, setRules] = useState<SniperRule[]>(initialRules);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const seen = useRef<Set<string>>(new Set());

  const { data, status } = usePolling<{ data: MarketToken[] }>("/api/market/new-pairs", {
    intervalMs: 20000,
    initialData: { data: initialFeed },
  });

  const feed = useMemo(() => data?.data ?? [], [data]);
  const anyArmed = rules.some((r) => r.enabled);

  // Reacts to the polled feed (an external data source) by logging any newly-matching pair —
  // a legitimate synchronize-with-external-system effect, not derived render state.
  useEffect(() => {
    if (!anyArmed) return;
    const newEntries: LogEntry[] = [];
    for (const token of feed) {
      for (const rule of rules) {
        const key = `${rule.id}:${token.id}`;
        if (seen.current.has(key)) continue;
        if (evaluate(rule, token)) {
          seen.current.add(key);
          newEntries.push({
            id: key,
            ts: Date.now(),
            ruleLabel: rule.label,
            token,
            positionSizeSol: rule.positionSizeSol,
          });
        }
      }
    }
    if (newEntries.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLog((prev) => [...newEntries, ...prev].slice(0, 40));
      newEntries.forEach((e) =>
        toast(`Sniper match: ${e.token.symbol}`, {
          description: `Rule "${e.ruleLabel}" matched — simulated ${e.positionSizeSol} SOL buy, no real transaction sent.`,
        }),
      );
    }
  }, [feed, rules, anyArmed]);

  function toggleRule(id: string) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  }

  function deleteRule(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  function addRule(rule: SniperRule) {
    setRules((prev) => [...prev, rule]);
    setDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-primary" />
          Rules are evaluated against the real live new-pairs feed. Matches are logged, not
          executed — no wallet, keys, or on-chain transactions are involved in this build.
        </span>
        <LiveBadge status={status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium">Rules</h2>
              <RuleDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={addRule} />
            </div>
            <div className="space-y-2">
              {rules.length === 0 && (
                <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No rules yet — add one to start watching.
                </p>
              )}
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-1.5 w-1.5 rounded-full", rule.enabled ? "bg-gain" : "bg-muted-foreground")} />
                      <p className="truncate text-sm font-medium">{rule.label}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Liq ≥ {formatUsdCompact(rule.minLiquidityUsd)} · age ≤ {rule.maxAgeMinutes}m · buys(5m) ≥{" "}
                      {rule.minBuysM5} · size {rule.positionSizeSol} SOL
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} aria-label={`Toggle ${rule.label}`} />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteRule(rule.id)} aria-label={`Delete ${rule.label}`}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium">Activity log</h2>
            <div className="rounded-lg border border-border">
              {log.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
                  <Zap className="h-5 w-5 opacity-50" />
                  {anyArmed ? "Watching — matches will appear here as they happen." : "Arm a rule to start watching."}
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {log.map((entry) => (
                    <li key={entry.id} className="flex items-center gap-3 px-4 py-2.5">
                      <TokenAvatar src={entry.token.imageUrl} symbol={entry.token.symbol} size={26} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">
                          <span className="font-medium">{entry.token.symbol}</span>{" "}
                          <span className="text-muted-foreground">matched &ldquo;{entry.ruleLabel}&rdquo;</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          simulated {entry.positionSizeSol} SOL · {new Date(entry.ts).toLocaleTimeString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-medium">Live new-pairs feed</span>
            <span className="text-xs text-muted-foreground">{feed.length}</span>
          </div>
          <ul className="max-h-[560px] divide-y divide-border overflow-y-auto">
            {feed.length === 0 && (
              <li className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
                <Inbox className="h-5 w-5 opacity-50" />
                No fresh pairs right now
              </li>
            )}
            {feed.map((t) => (
              <li key={t.id} className="flex items-center gap-2.5 px-4 py-2.5">
                <TokenAvatar src={t.imageUrl} symbol={t.symbol} size={26} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.symbol}</p>
                  <p className="text-xs text-muted-foreground">
                    <RelativeAge createdAt={t.pairCreatedAt} /> old · liq {formatUsdCompact(t.liquidityUsd)} · buys(5m){" "}
                    {t.txnsM5?.buys ?? "—"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RuleDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (rule: SniperRule) => void;
}) {
  const [label, setLabel] = useState("");
  const [minLiquidityUsd, setMinLiquidityUsd] = useState("5000");
  const [maxAgeMinutes, setMaxAgeMinutes] = useState("30");
  const [minBuysM5, setMinBuysM5] = useState("5");
  const [positionSizeSol, setPositionSizeSol] = useState("0.5");

  function submit() {
    if (!label.trim()) {
      toast.error("Give the rule a name");
      return;
    }
    onSubmit({
      id: crypto.randomUUID(),
      label: label.trim(),
      enabled: true,
      minLiquidityUsd: Number(minLiquidityUsd) || 0,
      maxAgeMinutes: Number(maxAgeMinutes) || 30,
      minBuysM5: Number(minBuysM5) || 0,
      positionSizeSol: Number(positionSizeSol) || 0.1,
      chain: "solana",
    });
    setLabel("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New rule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New sniper rule</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Tight new launches" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Min liquidity ($)</Label>
              <Input inputMode="numeric" value={minLiquidityUsd} onChange={(e) => setMinLiquidityUsd(e.target.value.replace(/[^0-9]/g, ""))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Max age (min)</Label>
              <Input inputMode="numeric" value={maxAgeMinutes} onChange={(e) => setMaxAgeMinutes(e.target.value.replace(/[^0-9]/g, ""))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Min buys (5m)</Label>
              <Input inputMode="numeric" value={minBuysM5} onChange={(e) => setMinBuysM5(e.target.value.replace(/[^0-9]/g, ""))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Position size (SOL)</Label>
              <Input inputMode="decimal" value={positionSizeSol} onChange={(e) => setPositionSizeSol(e.target.value.replace(/[^0-9.]/g, ""))} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Create &amp; arm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
