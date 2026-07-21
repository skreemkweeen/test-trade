import { NextRequest, NextResponse } from "next/server";
import { getPairByAddress } from "@/lib/api/dexscreener";

/** Polled by the client-side live chart every few seconds — always fresh, no caching. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ chain: string; pairAddress: string }> },
) {
  const { chain, pairAddress } = await params;
  const token = await getPairByAddress(chain, pairAddress);
  return NextResponse.json({ token, ts: Date.now() }, { headers: { "Cache-Control": "no-store" } });
}
