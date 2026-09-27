import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { orderCode: orderId },
      include: { product: true },
    });

    if (order) {
      // Database တွင် PAID အဖြစ် ပြောင်းလဲခြင်း
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PAID" },
      });

      // TELEGRAM သို့ ချက်ချင်း NOTI ပို့ခြင်း 🔔
      await sendTelegramNotification(`
🎉 <b>[စမ်းသပ်မှု] ငွေပေးချေမှု အောင်မြင်ပါသည်!</b>

🆔 <b>Order:</b> <code>${order.orderCode}</code>
🎮 <b>Game:</b> Mobile Legends
👤 <b>Player ID:</b> <code>${order.playerId}</code> (${order.zoneId || "-"})
💎 <b>Pack:</b> ${order.product?.name || "Diamonds"}
💰 <b>Amount:</b> $${order.amount} USDT
💳 <b>Payment:</b> Binance Pay
⚡ <b>Status:</b> PAID (ငွေဝင်ပြီး)

👉 <i>စိန်ထည့်ပေးရန် အဆင်သင့်ဖြစ်ပါပြီ!</i>
      `);
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}