import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deliverViaShop2TopUp } from "@/lib/shop2topup";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("A-Pay Webhook Received:", JSON.stringify(body, null, 2));

    const transactions = body?.transactions;

    if (transactions && transactions.length > 0) {
      const tx = transactions[0];
      const orderCode = tx.custom_transaction_id;
      const paymentStatus = tx.status;

      if (paymentStatus === "Success" && orderCode) {
        const order = await prisma.order.findUnique({
          where: { orderCode: orderCode },
          include: { product: true },
        });

        if (order && order.paymentStatus !== "PAID") {
          // ငွေဝင်ကြောင်း PAID သတ်မှတ်ခြင်း
          await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: "PAID" },
          });

          // ၁။ TELEGRAM သို့ အချက်ပေးစာ ပို့ခြင်း 🔔
          await sendTelegramNotification(`
🎉 <b>A-Pay ငွေဝင်ပါပြီ! စိန် Auto ပို့နေပါသည်...</b>

🆔 <b>Order:</b> <code>${order.orderCode}</code>
👤 <b>Player ID:</b> <code>${order.playerId}</code> (Zone: <code>${order.zoneId || "-"}</code>)
💎 <b>Pack:</b> ${order.product?.name || "Diamonds"}
💰 <b>Amount:</b> ${order.amount.toLocaleString()} MMK
💳 <b>Payment:</b> A-Pay
⚡ <b>Status:</b> PAID
          `);

          // ၂။ SHOP2TOPUP မှတစ်ဆင့် စိန်ကို စက္ကန့်ပိုင်းအတွင်း AUTO ပို့ဆောင်ခြင်း 🚀
          const topupResult = await deliverViaShop2TopUp({
            playerId: order.playerId,
            zoneId: order.zoneId || undefined,
            packId: order.productId,
          });

          if (topupResult.success) {
            await prisma.order.update({
              where: { id: order.id },
              data: { fulfillmentStatus: "COMPLETED" },
            });
            console.log(`Order ${orderCode} diamonds delivered via Shop2TopUp!`);
          } else {
            console.warn(`Order ${orderCode} auto-delivery pending/failed:`, topupResult.error);
          }
        }
      }
    }

    return NextResponse.json({ status: "OK" }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook processing error:", error.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}