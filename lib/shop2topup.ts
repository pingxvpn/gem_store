import axios from "axios";
import { randomUUID } from "crypto";

interface TopupParams {
  playerId: string;
  zoneId?: string;
  packId: string;
}

export async function deliverViaShop2TopUp({ playerId, zoneId, packId }: TopupParams) {
  try {
    const apiKey = process.env.SHOP2TOPUP_API_KEY;

    // အကယ်၍ API Key မရှိသေးပါက Simulation စမ်းသပ်မှုအဖြစ် သတ်မှတ်မည်
    if (!apiKey) {
      console.log(`[SIMULATION] Shop2TopUp topup for Player: ${playerId}, Pack: ${packId}`);
      return { success: true, simulated: true };
    }

    const clientOrderId = randomUUID(); // Shop2TopUp အတွက် တိကျသော UUID Key

    const payload = {
      order_id: clientOrderId,
      product_code: packId, // စိန်ပက်ကေ့ခ်ျ ကုဒ်
      player_id: playerId,
      zone_id: zoneId || undefined,
    };

    console.log("Calling Shop2TopUp API with payload:", payload);

    const response = await axios.post(
      "https://shop2topup.com/api/endpoints/v1/orders/create",
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data.success) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: response.data?.error?.message || "Order creation failed" };
    }
  } catch (error: any) {
    console.error("Shop2TopUp API Error:", error?.response?.data || error.message);
    return {
      success: false,
      error: error?.response?.data?.error?.message || error.message,
    };
  }
}