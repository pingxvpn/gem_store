import axios from "axios";

// Default Rate (အကယ်၍ လိုင်းခေတ္တကျပါက သုံးမည့် အရန်စျေး)
let cachedRate = 4500;
let lastFetchTime = 0;

export const BASE_PACKS = [
  { id: "wdp", name: "Weekly Diamond Pass", priceUSD: 2.0, count: 210, tag: "🔥 အရောင်းရဆုံး" },
  { id: "1", name: "86 Diamonds", priceUSD: 1.5, count: 86 },
  { id: "2", name: "172 Diamonds", priceUSD: 2.95, count: 172 },
  { id: "3", name: "257 Diamonds", priceUSD: 4.4, count: 257 },
  { id: "4", name: "706 Diamonds", priceUSD: 12.0, count: 706 },
];

export async function getLiveUsdtMmkRate(): Promise<number> {
  const now = Date.now();
  // မိနစ် ၂၀ အတွင်း တစ်ကြိမ်သာ API ခေါ်ပြီး Cache သိမ်းမည် (Server မလေးစေရန်)
  if (now - lastFetchTime < 20 * 60 * 1000 && cachedRate > 0) {
    return cachedRate;
  }

  try {
    // Binance P2P ဆီမှ တကယ့် Live ပေါက်စျေး လှမ်းဆွဲခြင်း
    const res = await axios.post(
      "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
      {
        asset: "USDT",
        fiat: "MMK",
        merchantCheck: false,
        page: 1,
        payTypes: ["KBZPay", "WavePay"],
        rows: 5,
        tradeType: "BUY",
      },
      { timeout: 6000 }
    );

    const advs = res.data?.data;
    if (advs && advs.length > 0) {
      const prices = advs.map((item: any) => parseFloat(item.adv.price)).filter((p: number) => !isNaN(p));
      if (prices.length > 0) {
        // ထိပ်ဆုံး စျေး ၃ ခု၏ ပျမ်းမျှကို ယူမည်
        const avg = prices.slice(0, 3).reduce((a: number, b: number) => a + b, 0) / Math.min(prices.length, 3);
        // ဒေါ်လာစျေး အတက်အကျဒဏ် ကာကွယ်ရန် 1% buffer ပေါင်းမည်
        const finalRate = Math.round(avg * 1.01);
        cachedRate = finalRate;
        lastFetchTime = now;
        return cachedRate;
      }
    }
  } catch (e: any) {
    console.warn("Binance P2P live rate fallback used:", e.message);
  }

  return Number(process.env.EXCHANGE_RATE) || cachedRate || 4500;
}

// မြန်မာငွေ ၁၀၀ အပြည့် အချောသတ် တွက်ချက်ပေးသည့် စနစ်
export function calculateMMK(priceUSD: number, rate: number): number {
  return Math.ceil((priceUSD * rate) / 100) * 100;
}