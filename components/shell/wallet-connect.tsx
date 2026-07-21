"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Wallet, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

/**
 * MVP wallet flow: intentionally simulated. SatoVanta does not custody keys and does not
 * broadcast transactions in this build — connecting only unlocks the demo portfolio/copy-trading
 * state so the product can be evaluated end-to-end before real execution is wired up.
 */
export function WalletConnect() {
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);

  function handleConnect() {
    setConnected(true);
    setOpen(false);
    toast.success("Demo wallet connected", {
      description: "Simulation mode — no real wallet, keys, or transactions are involved.",
    });
  }

  if (connected) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-2 font-mono text-xs"
        onClick={() => setConnected(false)}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gain" />
        7xKX…f9Qm
      </Button>
    );
  }

  return (
    <>
      <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Wallet className="h-4 w-4" />
        Connect
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Connect a demo wallet
            </DialogTitle>
            <DialogDescription className="text-left">
              This MVP runs in simulation mode: no real wallet adapter, no private keys, and no
              on-chain transactions are sent. Connecting unlocks a sample portfolio and
              copy-trading demo state.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnect}>Use demo wallet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
