import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Banner စာတန်းကို ဆွဲထုတ်ရန်
export async function GET() {
  try {
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "StoreSetting" (key TEXT PRIMARY KEY, value TEXT);`
    );
    const result: any = await prisma.$queryRawUnsafe(
      `SELECT value FROM "StoreSetting" WHERE key = 'banner';`
    );

    const bannerText = result && result.length > 0 ? result[0].value : "";
    return NextResponse.json({ banner: bannerText });
  } catch (error: any) {
    return NextResponse.json({ banner: "" });
  }
}

// Banner စာတန်းကို အသစ်ပြင်ဆင်သိမ်းဆည်းရန်
export async function POST(req: Request) {
  try {
    const { banner } = await req.json();

    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "StoreSetting" (key TEXT PRIMARY KEY, value TEXT);`
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO "StoreSetting" (key, value) VALUES ('banner', $1) 
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`,
      banner || ""
    );

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}