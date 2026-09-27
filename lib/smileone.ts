import axios from "axios";
import CryptoJS from "crypto-js";

interface TopUpParams {
  userId: string;
  zoneId: string;
  productId: string; // Smile.one ရဲ့ စိန် Product ID
}

export async function topUpViaSmileOne({ userId, zoneId, productId }: TopUpParams) {
  try {
    const email = process.env.SMILEONE_EMAIL;
    const uid = process.env.SMILEONE_UID;
    const secretKey = process.env.SMILEONE_KEY;

    // အကယ်၍ Key မထည့်ရသေးပါက Simulation (စမ်းသပ်မှု) အနေဖြင့် ပြီးစီးကြောင်း ပြမည်
    if (!email || !uid || !secretKey) {
      console.log(`[TEST MODE] Smile.one top-up simulated for Player: ${userId} (${zoneId}), Pack: ${productId}`);
      return { success: true, simulated: true };
    }

    const time = Math.floor(Date.now() / 1000).toString();

    // Smile.one API အတွက် MD5 Signature တွက်ချက်ခြင်း
    const signString = `email=${email}&product=mobilelegends&productid=${productId}&time=${time}&uid=${uid}&userid=${userId}&zoneid=${zoneId}&key=${secretKey}`;
    const sign = CryptoJS.MD5(signString).toString();

    const payload = {
      email,
      uid,
      userid: userId,
      zoneid: zoneId,
      product: "mobilelegends",
      productid: productId,
      time,
      sign,
    };

    // Smile.one API ဆီ စိန်အလိုအလျောက် ထည့်ပေးရန် လှမ်းခေါ်ခြင်း
    const response = await axios.post("https://www.smile.one/smilecoin/api/purchase", payload, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.data && response.data.status === 200) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: response.data?.message || "Smile.one Purchase Failed" };
    }
  } catch (error: any) {
    console.error("Smile.one API Error:", error.message);
    return { success: false, error: error.message };
  }
}