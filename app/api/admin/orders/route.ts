import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// အော်ဒါစာရင်းအားလုံး ဆွဲထုတ်ရန်
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: true, game: true },
    });
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// စိန်ပို့ပြီးကြောင်း Status ပြောင်းလဲရန်
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, fulfillmentStatus } = body;

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { fulfillmentStatus },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}