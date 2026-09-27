"use client";

import React, { useState } from "react";

interface Product {
  id: string;
  name: string;
  diamondCount: number;
  price: number;
}

interface Game {
  id: string;
  name: string;
  products: Product[];
}

export default function TopUpClient({ game }: { game: Game }) {
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId || !zoneId || !selectedProduct) {
      alert("ကျေးဇူးပြု၍ Player ID၊ Zone ID နှင့် စိန်ပက်ကေ့ခ်ျကို အပြည့်အစုံ ရွေးချယ်ပေးပါ");
      return;
    }

    setLoading(true);
    alert(`အော်ဒါတင်ရန် အဆင်သင့်ဖြစ်ပါပြီ!\nPlayer ID: ${playerId} (${zoneId})\nရွေးချယ်ထားသော စိန်: ${game.products.find(p => p.id === selectedProduct)?.name}\nငွေပေးချေစနစ်: A-Pay`);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-500">
            GAME TOP-UP STORE
          </h1>
          <p className="text-slate-400">Mobile Legends စိန်များကို A-Pay ဖြင့် လျင်မြန်စွာ ဝယ်ယူနိုင်ပါသည်</p>
        </div>

        <form onSubmit={handleCheckout} className="space-y-6">
          
          {/* အဆင့် ၁: Player ID ထည့်သွင်းရန် */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-xs px-2.5 py-1 rounded-full font-bold">1</span>
              ဂိမ်းအချက်အလက် ထည့်ပါ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">User ID</label>
                <input
                  type="text"
                  placeholder="ဥပမာ - 12345678"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Zone ID</label>
                <input
                  type="text"
                  placeholder="ဥပမာ - 1234"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* အဆင့် ၂: စိန်ပက်ကေ့ခ်ျ ရွေးချယ်ရန် */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-xs px-2.5 py-1 rounded-full font-bold">2</span>
              စိန်ပက်ကေ့ခ်ျ ရွေးချယ်ပါ
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              {game.products.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setSelectedProduct(p.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedProduct === p.id
                      ? "border-blue-500 bg-blue-600/20 shadow-md ring-1 ring-blue-500"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <p className="font-bold text-slate-100">{p.name}</p>
                  <p className="text-sm text-blue-400 font-semibold mt-1">
                    {p.price.toLocaleString()} MMK
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* အဆင့် ၃: ငွေပေးချေစနစ် ရွေးချယ်ရန် */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-xs px-2.5 py-1 rounded-full font-bold">3</span>
              ငွေပေးချေစနစ်
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-blue-500 bg-blue-600/10 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">A-Pay</p>
                  <p className="text-xs text-slate-400">မြန်မာငွေဖြင့် ချက်ချင်းရှင်းမည်</p>
                </div>
                <span className="text-blue-400 font-bold text-sm">✓ Selected</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 opacity-50 flex items-center justify-between cursor-not-allowed">
                <div>
                  <p className="font-bold text-slate-300">Binance Pay (Crypto)</p>
                  <p className="text-xs text-slate-500">မကြာမီ လာမည်</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                ပြေစာ လက်ခံမည့် ဖုန်း သို့မဟုတ် Email (Optional)
              </label>
              <input
                type="text"
                placeholder="09xxxxxxxxx သို့မဟုတ် email@example.com"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* ဝယ်ယူမည့် Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition duration-200 shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            {loading ? "ဆောင်ရွက်နေပါသည်..." : "ယခု ဝယ်ယူမည် (Buy Now)"}
          </button>
        </form>

      </div>
    </div>
  );
}