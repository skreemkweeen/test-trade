import { NextRequest, NextResponse } from "next/server";
import { getTokenPairs } from "@/lib/api/dexscreener";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string }> },
) {
  const { chain, address } = await params;
  const pairs = await getTokenPairs(chain, address);
  const best = [...pairs].sort((a, b) => (b.liquidityUsd ?? 0) - (a.liquidityUsd ?? 0))[0] ?? null;
  return NextResponse.json({ token: best, pairs });
}
