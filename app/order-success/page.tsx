import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { checkAPayDepositStatus } from "@/lib/apay";
import { deliverViaShop2TopUp } from "@/lib/shop2topup";
import { sendTelegramNotification } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const orderId = params.order_id || "";

  let order = orderId
    ? await prisma.order.findUnique({
        where: { orderCode: orderId },
        include: { product: true },
      })
    : null;

  // AUTO-RECONCILIATION: အကယ်၍ အော်ဒါက PENDING ဖြစ်နေဆဲပါက A-Pay ဆီ တိုက်ရိုက် လှမ်းစစ်ဆေးမည်
  if (order && order.paymentStatus === "PENDING" && order.paymentMethod === "APAY") {
    const aPayCheck = await checkAPayDepositStatus(order.orderCode);

    if (aPayCheck.isPaid) {
      // ၁။ Database တွင် PAID အဖြစ် အလိုအလျောက် ပြောင်းလဲခြင်း
      order = await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PAID" },
        include: { product: true },
      });

      // ၂။ Telegram သို့ Noti ချက်ချင်း ပို့ခြင်း
      await sendTelegramNotification(`
🎉 <b>A-Pay ငွေဝင်ကြောင်း အတည်ပြုပြီးပါပြီ!</b>

🆔 <b>Order:</b> <code>${order.orderCode}</code>
👤 <b>Player ID:</b> <code>${order.playerId}</code> (${order.zoneId || "-"})
💎 <b>Pack:</b> ${order.product?.name || "Diamonds"}
💰 <b>Amount:</b> ${order.amount.toLocaleString()} MMK
💳 <b>Payment:</b> A-Pay
⚡ <b>Status:</b> PAID (စိန် Auto ပို့နေပါသည်)
      `);

      // ၃။ Shop2TopUp မှတစ်ဆင့် စိန်ကို စက္ကန့်ပိုင်းအတွင်း AUTO ပို့ဆောင်ခြင်း
      const topup = await deliverViaShop2TopUp({
        playerId: order.playerId,
        zoneId: order.zoneId || undefined,
        packId: "Weekly",
      });

      if (topup.success) {
        order = await prisma.order.update({
          where: { id: order.id },
          data: { fulfillmentStatus: "COMPLETED" },
          include: { product: true },
        });
      }
    }
  }

  const isPaid = order?.paymentStatus === "PAID";
  const isPending = !order || order?.paymentStatus === "PENDING";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        
        {/* Status Icon & Title */}
        {isPaid ? (
          <>
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg border border-emerald-500/30">
              ✓
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-white">ငွေပေးချေမှု အောင်မြင်ပါသည်!</h1>
              <p className="text-emerald-400 text-xs font-semibold">ငွေလက်ခံရရှိပြီး စိန်ပို့ဆောင်ပေးနေပါသည်</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg border border-amber-500/30">
              ⏳
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-white">ငွေပေးချေမှုကို စောင့်ဆိုင်းနေပါသည်</h1>
              <p className="text-amber-400 text-xs font-semibold">ငွေလွှဲပြီးပါက အောက်ပါ Refresh ခလုတ်ကို နှိပ်ပါ</p>
            </div>
          </>
        )}

        {/* Receipt Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-left text-xs space-y-3">
          <div className="flex justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">အော်ဒါနံပါတ်:</span>
            <span className="font-mono font-bold text-blue-400">{order?.orderCode || orderId || "N/A"}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">Player ID:</span>
            <span className="font-bold text-white">
              {order?.playerId || params.player || "N/A"} {order?.zoneId ? `(${order.zoneId})` : ""}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">ပစ္စည်းအမျိုးအစား:</span>
            <span className="font-bold text-white">{order?.product?.name || params.pack || "Diamonds"}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">ကျသင့်ငွေ:</span>
            <span className="font-bold text-slate-100">
              {order ? `${order.amount.toLocaleString()} ${order.paymentMethod === "BINANCE" || order.paymentMethod === "NOWPAYMENTS" ? "USD" : "MMK"}` : "N/A"}
            </span>
          </div>

          <div className="flex justify-between pt-1 items-center">
            <span className="text-slate-400">ငွေပေးချေမှု အခြေအနေ:</span>
            {isPaid ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ✓ PAID (ငွေဝင်ပြီး)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                ⏳ PENDING (မပေးရသေးပါ)
              </span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          {isPending && (
            <Link
              href={`/order-success?order_id=${orderId}&pack=${encodeURIComponent(params.pack || "")}&amount=${params.amount || ""}&player=${params.player || ""}`}
              className="block w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition text-xs shadow"
            >
              🔄 အခြေအနေ ပြန်လည်စစ်ဆေးမည် (Refresh)
            </Link>
          )}

          <Link
            href="/"
            className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition text-xs"
          >
            မူလစာမျက်နှာသို့ ပြန်သွားမည်
          </Link>
        </div>

      </div>
    </main>
  );
}
