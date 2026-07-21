import { NextRequest, NextResponse } from "next/server";
import { getTrending } from "@/lib/market/aggregate";

export async function GET(req: NextRequest) {
  const chain = req.nextUrl.searchParams.get("chain") ?? "solana";
  const data = await getTrending(chain);
  return NextResponse.json(data);
}
