import { NextResponse } from "next/server";
import { getLiveUsdtMmkRate, BASE_PACKS, calculateMMK } from "@/lib/rates";

export const dynamic = "force-dynamic";

export async function GET() {
  const rate = await getLiveUsdtMmkRate();
  
  const packs = BASE_PACKS.map((pack) => ({
    ...pack,
    priceMMK: calculateMMK(pack.priceUSD, rate),
  }));

  return NextResponse.json({ rate, packs });
}