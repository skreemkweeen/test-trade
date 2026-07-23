import { NextRequest, NextResponse } from "next/server";
import { getOhlc } from "@/lib/api/coingecko";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ coinId: string }> },
) {
  const { coinId } = await params;
  const days = Number(req.nextUrl.searchParams.get("days") ?? "1") as 1 | 7 | 30;
  const candles = await getOhlc(coinId, days);
  return NextResponse.json({ candles });
}
