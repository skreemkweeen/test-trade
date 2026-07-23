import { NextRequest, NextResponse } from "next/server";
import { searchMarket } from "@/lib/market/aggregate";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const chain = req.nextUrl.searchParams.get("chain") ?? "solana";
  const data = await searchMarket(q, chain);
  return NextResponse.json({ data });
}
