import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { id, zone } = await req.json();

    if (!id || !zone) {
      return NextResponse.json(
        { success: false, message: "User ID နှင့် Zone ID ထည့်ပေးပါခင်ဗျာ" },
        { status: 400 }
      );
    }

    // MLBB ဂိမ်းဆာဗာမှ Nickname အစစ်အမှန်ကို အလိုအလျောက် လှမ်းဆွဲခြင်း
    const response = await axios.get(
      `https://api.isan.eu.org/nickname/ml?id=${encodeURIComponent(id)}&server=${encodeURIComponent(zone)}`,
      { timeout: 8000 }
    );

    if (response.data && response.data.success && response.data.name) {
      return NextResponse.json({
        success: true,
        name: decodeURIComponent(response.data.name),
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "ဂိမ်းအကောင့် ရှာမတွေ့ပါ (User ID သို့မဟုတ် Zone ID မှားယွင်းနိုင်ပါသည်)",
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "လတ်တလော စစ်ဆေး၍ မရပါ (ID မှန်ကန်ပါက ဆက်လက်ဝယ်ယူနိုင်ပါသည်)",
    });
  }
}