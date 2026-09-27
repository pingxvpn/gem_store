import axios from "axios";

let cachedRate = 4500;
let lastFetchTime = 0;

export const BASE_PACKS = [
  { id: "mlbb_wdp", name: "Weekly Diamond Pass", priceUSD: 2.0, tag: "🔥 အရောင်းရဆုံး" },
  { id: "mlbb_86", name: "86 Diamonds", priceUSD: 1.5 },
  { id: "mlbb_172", name: "172 Diamonds", priceUSD: 2.95 },
  { id: "mlbb_257", name: "257 Diamonds", priceUSD: 4.4 },
  { id: "mlbb_706", name: "706 Diamonds", priceUSD: 12.0 },
];

export async function getLiveUsdtMmkRate(): Promise<number> {
  const now = Date.now();
  if (now - lastFetchTime < 30 * 60 * 1000 && cachedRate > 0) {
    return cachedRate;
  }

  try {
    const res = await axios.post(
      "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
      {
        asset: "USDT",
        fiat: "MMK",
        merchantCheck: false,
        page: 1,
        payTypes: ["KBZPay", "WavePay"],
        rows: 3,
        tradeType: "BUY",
      },
      { timeout: 2500 } // ဖုန်းလိုင်းနှေးရင်တောင် ၂.၅ စက္ကန့်အတွင်း အမြန်ဆုံး ဖြတ်ပေးမည်
    );

    const advs = res.data?.data;
    if (advs && advs.length > 0) {
      const price = parseFloat(advs[0].adv.price);
      if (!isNaN(price)) {
        cachedRate = Math.round(price * 1.01);
        lastFetchTime = now;
        return cachedRate;
      }
    }
  } catch (e: any) {
    // လိုင်းကျနေပါက Cached Rate ဖြင့် အမြန်ဆုံး ပြန်ထုတ်ပေးမည်
  }

  return Number(process.env.EXCHANGE_RATE) || cachedRate || 4500;
}

export function calculateMMK(priceUSD: number, rate: number): number {
  return Math.ceil((priceUSD * rate) / 100) * 100;
}
