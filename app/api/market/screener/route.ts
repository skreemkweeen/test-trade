import { NextRequest, NextResponse } from "next/server";
import { getScreenerPool } from "@/lib/market/aggregate";

export async function GET(req: NextRequest) {
  const chain = req.nextUrl.searchParams.get("chain") ?? "solana";
  const data = await getScreenerPool(chain);
  return NextResponse.json({ data });
}
