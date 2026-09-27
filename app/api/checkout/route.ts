import { NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { getLiveUsdtMmkRate, calculateMMK } from "@/lib/rates";
import { sendTelegramNotification } from "@/lib/telegram";

const ALL_PRODUCTS: Record<string, { name: string; priceUSD: number; gameName: string }> = {
  // Mobile Legends
  "mlbb_wdp": { name: "Weekly Diamond Pass", priceUSD: 2.0, gameName: "Mobile Legends" },
  "mlbb_86": { name: "86 Diamonds", priceUSD: 1.5, gameName: "Mobile Legends" },
  "mlbb_172": { name: "172 Diamonds", priceUSD: 2.95, gameName: "Mobile Legends" },
  "mlbb_257": { name: "257 Diamonds", priceUSD: 4.4, gameName: "Mobile Legends" },
  "mlbb_706": { name: "706 Diamonds", priceUSD: 12.0, gameName: "Mobile Legends" },

  // Free Fire
  "ff_weekly": { name: "Weekly Membership", priceUSD: 1.65, gameName: "Free Fire" },
  "ff_110": { name: "110 Diamonds", priceUSD: 1.0, gameName: "Free Fire" },
  "ff_231": { name: "231 Diamonds", priceUSD: 2.0, gameName: "Free Fire" },
  "ff_583": { name: "583 Diamonds", priceUSD: 4.8, gameName: "Free Fire" },
  "ff_1188": { name: "1,188 Diamonds", priceUSD: 9.6, gameName: "Free Fire" },

  // PUBG Mobile
  "pubg_60": { name: "60 UC", priceUSD: 0.95, gameName: "PUBG Mobile" },
  "pubg_325": { name: "300 + 25 UC", priceUSD: 4.7, gameName: "PUBG Mobile" },
  "pubg_660": { name: "600 + 60 UC", priceUSD: 9.4, gameName: "PUBG Mobile" },
  "pubg_1800": { name: "1,500 + 300 UC", priceUSD: 23.5, gameName: "PUBG Mobile" },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { playerId, zoneId, packId, paymentMethod, contact, promoCode } = body;

    const selectedProduct = ALL_PRODUCTS[packId];
    if (!selectedProduct) {
      return NextResponse.json({ error: "Invalid product selected" }, { status: 400 });
    }

    const liveRate = await getLiveUsdtMmkRate();
    let calculatedMMK = calculateMMK(selectedProduct.priceUSD, liveRate);
    let finalUSD = selectedProduct.priceUSD;

    // Promo Code စစ်ဆေးပြီး အလိုအလျောက် သက်တမ်းရေတွက်ခြင်း
    if (promoCode) {
      try {
        const result: any = await prisma.$queryRawUnsafe(
          `SELECT value FROM "StoreSetting" WHERE key = 'promos';`
        );
        const promos = result && result.length > 0 ? JSON.parse(result[0].value) : [];
        const foundIdx = promos.findIndex((p: any) => p.code.toUpperCase() === promoCode.toUpperCase());
        
        if (foundIdx !== -1) {
          const p = promos[foundIdx];
          const maxUses = Number(p.maxUses) || 999999;
          const usedCount = Number(p.usedCount) || 0;

          if (usedCount < maxUses) {
            calculatedMMK = Math.max(500, calculatedMMK - p.discountMMK);
            finalUSD = Math.max(0.1, finalUSD - p.discountUSD);

            // အသုံးပြုမှု အရေအတွက် ၁ ခု တိုးပြီး Save မှတ်ခြင်း
            promos[foundIdx].usedCount = usedCount + 1;
            await prisma.$executeRawUnsafe(
              `INSERT INTO "StoreSetting" (key, value) VALUES ('promos', $1) 
               ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`,
              JSON.stringify(promos)
            );
          }
        }
      } catch (err) {
        console.warn("Promo check error:", err);
      }
    }

    const orderCode = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const isUSD = paymentMethod === "BINANCE" || paymentMethod === "NOWPAYMENTS";
    const finalAmount = isUSD ? finalUSD : calculatedMMK;

    // Database ထဲ သိမ်းဆည်းခြင်း
    try {
      const game = await prisma.game.findFirst();
      const product = await prisma.product.findFirst();

      if (game && product) {
        await prisma.order.create({
          data: {
            orderCode: orderCode,
            gameId: game.id,
            productId: product.id,
            playerId: playerId,
            zoneId: zoneId || "",
            customerContact: contact || "",
            amount: finalAmount,
            paymentMethod: paymentMethod || "APAY",
            paymentStatus: "PENDING",
          },
        });
      }
    } catch (dbErr: any) {
      console.warn("DB Warning:", dbErr.message);
    }

    // ၁။ BINANCE PAY အော်ဒါ
    if (paymentMethod === "BINANCE") {
      await sendTelegramNotification(`
🔔 <b>Binance Pay အော်ဒါအသစ် ရောက်ရှိပါသည်!</b>

🆔 <b>Order:</b> <code>${orderCode}</code>
🎮 <b>Game:</b> ${selectedProduct.gameName}
👤 <b>Player ID:</b> <code>${playerId}</code> ${zoneId ? `(${zoneId})` : ""}
💎 <b>Pack:</b> ${selectedProduct.name}
💰 <b>Amount:</b> $${finalUSD.toFixed(2)} USDT ${promoCode ? `(🎟️ ${promoCode} သုံးထားသည်)` : ""}
💳 <b>Payment:</b> Binance Pay
⏳ <b>Status:</b> PENDING
      `);

      return NextResponse.json({
        paymentUrl: `/pay/binance?order_id=${orderCode}&amount=${finalUSD.toFixed(2)}&player=${playerId}&pack=${encodeURIComponent(selectedProduct.name)}`,
      });
    }

    // ၂။ NOWPAYMENTS
    if (paymentMethod === "NOWPAYMENTS") {
      const nowApiKey = process.env.NOWPAYMENTS_API_KEY;
      const host = req.headers.get("host") || "game-topup-store-sooty.vercel.app";
      const protocol = host.includes("localhost") ? "http" : "https";

      const invoicePayload = {
        price_amount: finalUSD,
        price_currency: "usd",
        order_id: orderCode,
        order_description: `${selectedProduct.gameName} - ${selectedProduct.name} for ${playerId}`,
        success_url: `${protocol}://${host}/order-success?order_id=${orderCode}&pack=${encodeURIComponent(selectedProduct.name)}&amount=${finalUSD.toFixed(2)}&player=${playerId}`,
        cancel_url: `${protocol}://${host}`,
      };

      const nowRes = await axios.post("https://api.nowpayments.io/v1/invoice", invoicePayload, {
        headers: { "x-api-key": nowApiKey, "Content-Type": "application/json" },
      });

      if (nowRes.data && nowRes.data.invoice_url) {
        return NextResponse.json({ paymentUrl: nowRes.data.invoice_url });
      } else {
        return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
      }
    }

    // ၃။ A-PAY (မြန်မာငွေ)
    const apikey = process.env.APAY_API_KEY || "9a364faa03333a71899a53306b7e7fd9";
    const projectId = process.env.APAY_PROJECT_ID || "0409923";
    const baseUrl = "https://pay-crm.com";

    const host = req.headers.get("host") || "game-topup-store-sooty.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const returnUrl = `${protocol}://${host}/order-success?order_id=${orderCode}&pack=${encodeURIComponent(selectedProduct.name)}&amount=${calculatedMMK}&player=${playerId}`;

    const aPayPayload = {
      amount: Number(calculatedMMK),
      currency: "MMK",
      custom_transaction_id: orderCode,
      custom_user_id: String(playerId),
      return_url: returnUrl,
      language: "EN",
    };

    const response = await axios.post(
      `${baseUrl}/Remotes/create-payment-page?project_id=${projectId}`,
      aPayPayload,
      {
        headers: { apikey: apikey, "Content-Type": "application/json" },
      }
    );

    if (response.data && response.data.url) {
      return NextResponse.json({ paymentUrl: response.data.url });
    } else {
      const errMsg = response.data?.message || response.data?.error || JSON.stringify(response.data);
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }
  } catch (error: any) {
    const exactError = error?.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error("Payment API Error:", exactError);
    return NextResponse.json({ error: exactError }, { status: 500 });
  }
}
