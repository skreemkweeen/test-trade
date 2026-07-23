"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Sparkles, ShieldCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useDemoMode } from "@/lib/store/demo-mode";

/**
 * There is no real wallet adapter in this build — nothing here should look or read like one.
 * "Try demo" only flips a persisted local flag; it does not connect to any wallet, hold any
 * keys, or change what data the Portfolio/Sniper/Copy-trading pages show (they already run in
 * simulation mode regardless of this flag). The flag exists so "Demo mode" is a real, visible,
 * shared piece of app state instead of implying a connection that isn't there.
 */
export function WalletConnect() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { active, activate, reset } = useDemoMode();

  // Avoid a hydration mismatch: persisted state is only known after the client reads
  // localStorage, so render the same "inactive" state on server and pre-mount client.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const isActive = mounted && active;

  function handleActivate() {
    activate();
    setOpen(false);
    toast.success("Demo mode on", {
      description: "No wallet, keys, or on-chain transactions are involved — this only flips a local flag.",
    });
  }

  function handleReset() {
    reset();
    toast("Demo mode off");
  }

  if (isActive) {
    return (
      <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={handleReset}>
        <span className="h-1.5 w-1.5 rounded-full bg-gain" />
        Demo mode
        <RotateCcw className="h-3 w-3 text-muted-foreground" />
      </Button>
    );
  }

  return (
    <>
      <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Sparkles className="h-4 w-4" />
        Try demo
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Turn on demo mode
            </DialogTitle>
            <DialogDescription className="text-left space-y-2">
              <span className="block">
                There is no wallet connection here — this build has no wallet adapter, holds no
                keys, and sends no on-chain transactions. Turning this on just remembers your
                preference in this browser (a single flag in local storage, nothing else).
              </span>
              <span className="block">
                Portfolio, Sniper, and Copy-trading already run on illustrative demo data whether
                or not this is on.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleActivate}>Turn on</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
