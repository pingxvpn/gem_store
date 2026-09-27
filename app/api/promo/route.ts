import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const codeToCheck = searchParams.get("code");

    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "StoreSetting" (key TEXT PRIMARY KEY, value TEXT);`
    );

    const result: any = await prisma.$queryRawUnsafe(
      `SELECT value FROM "StoreSetting" WHERE key = 'promos';`
    );

    const promos = result && result.length > 0 ? JSON.parse(result[0].value) : [];

    // Customer က Code စစ်ဆေးခြင်း
    if (codeToCheck) {
      const found = promos.find((p: any) => p.code.toUpperCase() === codeToCheck.trim().toUpperCase());
      if (!found) {
        return NextResponse.json({ valid: false, message: "ကူပွန်ကုဒ် မမှန်ကန်ပါ" });
      }

      const maxUses = Number(found.maxUses) || 999999;
      const usedCount = Number(found.usedCount) || 0;

      // သတ်မှတ်ဦးရေ ပြည့်/မပြည့် စစ်ဆေးခြင်း
      if (usedCount >= maxUses) {
        return NextResponse.json({ valid: false, message: "ဤကူပွန်ကုဒ်သည် သတ်မှတ်ဦးရေ ပြည့်သွားပါပြီ (Expired)" });
      }

      return NextResponse.json({
        valid: true,
        discountMMK: found.discountMMK,
        discountUSD: found.discountUSD,
        code: found.code,
        remaining: maxUses - usedCount,
      });
    }

    return NextResponse.json({ promos });
  } catch (error: any) {
    return NextResponse.json({ promos: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { promos } = await req.json();

    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "StoreSetting" (key TEXT PRIMARY KEY, value TEXT);`
    );

    await prisma.$executeRawUnsafe(
      `INSERT INTO "StoreSetting" (key, value) VALUES ('promos', $1) 
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`,
      JSON.stringify(promos || [])
    );

    return NextResponse.json({ success: true, promos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}