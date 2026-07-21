import { NextRequest, NextResponse } from "next/server";
import { getMovers, getTrending } from "@/lib/market/aggregate";

export async function GET(req: NextRequest) {
  const kind = req.nextUrl.searchParams.get("kind") ?? "movers";
  const chain = req.nextUrl.searchParams.get("chain") ?? "solana";

  if (kind === "trending") {
    const { onchain } = await getTrending(chain);
    return NextResponse.json({ data: onchain });
  }

  const data = await getMovers(kind as "gainers" | "losers" | "movers", chain);
  return NextResponse.json({ data });
}
