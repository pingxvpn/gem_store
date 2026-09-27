"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function BinancePayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const orderId = searchParams.get("order_id") || "ORD-000000";
  const amount = searchParams.get("amount") || "2.0";
  const pack = searchParams.get("pack") || "Weekly Diamond Pass";
  const player = searchParams.get("player") || "12345678";

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await fetch("/api/pay/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      router.push(`/order-success?order_id=${orderId}&pack=${encodeURIComponent(pack)}&amount=${amount}&player=${player}`);
    } catch (err) {
      alert("အမှားဖြစ်နေပါသည်");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          Binance Pay (စမ်းသပ်မှုစနစ်)
        </div>
        <h1 className="text-2xl font-black text-white">USDT ဖြင့် ပေးချေပါ</h1>
        <p className="text-xs text-slate-400">
          စမ်းသပ်ရန် အောက်ပါခလုတ်ကို နှိပ်လိုက်ရုံဖြင့် အခမဲ့ စမ်းသပ်နိုင်ပါသည်
        </p>
      </div>

      {/* Amount Box */}
      <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 space-y-1">
        <div className="text-xs text-slate-400 uppercase font-semibold">ကျသင့်ငွေ ပမာဏ</div>
        <div className="text-3xl font-black text-amber-400 tracking-tight">
          ${Number(amount).toFixed(2)} <span className="text-base text-slate-300">USDT</span>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-left text-xs space-y-3">
        <div className="flex justify-between border-b border-slate-800/80 pb-2">
          <span className="text-slate-400">Order ID:</span>
          <span className="font-mono font-bold text-blue-400">{orderId}</span>
        </div>
        <div className="flex justify-between border-b border-slate-800/80 pb-2">
          <span className="text-slate-400">Player ID:</span>
          <span className="font-bold text-white">{player}</span>
        </div>
        <div className="flex justify-between border-b border-slate-800/80 pb-2">
          <span className="text-slate-400">ပစ္စည်း:</span>
          <span className="font-bold text-white">{pack}</span>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-amber-500/25 text-sm cursor-pointer"
      >
        {loading ? "ဆောင်ရွက်နေပါသည်..." : "ငွေလွှဲပြီးပါပြီ (Confirm Payment)"}
      </button>
    </div>
  );
}

// Next.js Prerender Error မတက်စေရန် Suspense ဖြင့် အကာအကွယ် ခံထားခြင်း
export default function BinancePayPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white text-sm">အချက်အလက်များ ဖွင့်နေပါသည်...</div>}>
        <BinancePayContent />
      </Suspense>
    </main>
  );
}