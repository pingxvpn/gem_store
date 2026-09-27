"use client";

import React, { useState, useEffect } from "react";

type GameType = "mlbb" | "freefire" | "pubg";

interface PackItem {
  id: string;
  name: string;
  priceUSD: number;
  tag?: string;
  icon?: string;
}

const GAME_CATALOG: Record<GameType, { title: string; subtitle: string; requiresZone: boolean; idLabel: string; packs: PackItem[] }> = {
  mlbb: {
    title: "Mobile Legends: Bang Bang",
    subtitle: "A-Pay နှင့် Crypto ဖြင့် စိန်နှင့် Weekly Pass များကို စက္ကန့်ပိုင်းအတွင်း ဖြည့်ပါ",
    requiresZone: true,
    idLabel: "User ID",
    packs: [
      { id: "mlbb_wdp", name: "Weekly Diamond Pass", priceUSD: 2.0, tag: "🔥 အရောင်းရဆုံး", icon: "🎟️" },
      { id: "mlbb_86", name: "86 Diamonds", priceUSD: 1.5, icon: "💎" },
      { id: "mlbb_172", name: "172 Diamonds", priceUSD: 2.95, icon: "💎" },
      { id: "mlbb_257", name: "257 Diamonds", priceUSD: 4.4, icon: "💎" },
      { id: "mlbb_706", name: "706 Diamonds", priceUSD: 12.0, icon: "💎" },
    ],
  },
  freefire: {
    title: "Garena Free Fire",
    subtitle: "Player ID သာလိုအပ်ပြီး စိန်များကို ချက်ချင်း အလိုအလျောက် ဖြည့်ယူနိုင်ပါသည်",
    requiresZone: false,
    idLabel: "Player ID (UID)",
    packs: [
      { id: "ff_weekly", name: "Weekly Membership", priceUSD: 1.65, tag: "🔥 Best Value", icon: "🎟️" },
      { id: "ff_110", name: "110 Diamonds", priceUSD: 1.0, icon: "💎" },
      { id: "ff_231", name: "231 Diamonds", priceUSD: 2.0, icon: "💎" },
      { id: "ff_583", name: "583 Diamonds", priceUSD: 4.8, icon: "💎" },
      { id: "ff_1188", name: "1,188 Diamonds", priceUSD: 9.6, icon: "💎" },
    ],
  },
  pubg: {
    title: "PUBG Mobile (Global)",
    subtitle: "Character ID ဖြင့် PUBG Unknown Cash (UC) များကို လျင်မြန်စွာ ဝယ်ယူပါ",
    requiresZone: false,
    idLabel: "Character ID",
    packs: [
      { id: "pubg_60", name: "60 UC", priceUSD: 0.95, icon: "💵" },
      { id: "pubg_325", name: "300 + 25 UC", priceUSD: 4.7, tag: "🔥 Popular", icon: "💵" },
      { id: "pubg_660", name: "600 + 60 UC", priceUSD: 9.4, icon: "💵" },
      { id: "pubg_1800", name: "1,500 + 300 UC", priceUSD: 23.5, icon: "💵" },
    ],
  },
};

export default function HomePage() {
  const [selectedGame, setSelectedGame] = useState<GameType>("mlbb");
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [nickname, setNickname] = useState("");
  const [checkingNick, setCheckingNick] = useState(false);
  const [nickError, setNickError] = useState("");

  const [selectedPack, setSelectedPack] = useState("mlbb_wdp");
  const [paymentMethod, setPaymentMethod] = useState<"APAY" | "BINANCE" | "NOWPAYMENTS">("APAY");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(4500);
  const [banner, setBanner] = useState<string>("");

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountMMK: number; discountUSD: number } | null>(null);
  const [promoError, setPromoError] = useState("");

  const currentGame = GAME_CATALOG[selectedGame];

  useEffect(() => {
    fetch("/api/rates")
      .then((res) => res.json())
      .then((data) => {
        if (data.rate) setExchangeRate(data.rate);
      })
      .catch((err) => console.error("Rate error:", err));

    fetch("/api/banner")
      .then((res) => res.json())
      .then((data) => {
        if (data.banner) setBanner(data.banner);
      })
      .catch((err) => console.error("Banner error:", err));
  }, []);

  const handleSelectGame = (game: GameType) => {
    setSelectedGame(game);
    setSelectedPack(GAME_CATALOG[game].packs[0].id);
    setPlayerId("");
    setZoneId("");
    setNickname("");
    setNickError("");
  };

  const handleCheckNickname = async () => {
    if (!playerId || (currentGame.requiresZone && !zoneId)) {
      alert("ကျေးဇူးပြု၍ ID အချက်အလက်များကို အရင်ဖြည့်ပေးပါခင်ဗျာ");
      return;
    }

    setCheckingNick(true);
    setNickError("");
    setNickname("");

    try {
      const res = await fetch("/api/check-nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: playerId, zone: zoneId }),
      });
      const data = await res.json();

      if (data.success && data.name) {
        setNickname(data.name);
      } else {
        setNickError(data.message || "အကောင့် ရှာမတွေ့ပါ");
      }
    } catch (err) {
      setNickError("စစ်ဆေး၍ မရပါခင်ဗျာ");
    } finally {
      setCheckingNick(false);
    }
  };

  // Promo Code စစ်ဆေးခြင်း
  const handleApplyPromo = async () => {
    if (!promoInput) return;
    setPromoError("");
    try {
      const res = await fetch(`/api/promo?code=${encodeURIComponent(promoInput)}`);
      const data = await res.json();
      if (data.valid) {
        setAppliedPromo({ code: data.code, discountMMK: data.discountMMK, discountUSD: data.discountUSD });
      } else {
        setPromoError(data.message || "ကူပွန်ကုဒ် မမှန်ပါ");
        setAppliedPromo(null);
      }
    } catch (err) {
      setPromoError("စစ်ဆေး၍ မရပါ");
    }
  };

  const isUSD = paymentMethod === "BINANCE" || paymentMethod === "NOWPAYMENTS";

  const getPrice = (packUsd: number) => {
    if (isUSD) {
      const discounted = appliedPromo ? Math.max(0.1, packUsd - appliedPromo.discountUSD) : packUsd;
      return `$${discounted.toFixed(2)} USD`;
    } else {
      const baseMMK = Math.ceil((packUsd * exchangeRate) / 100) * 100;
      const discounted = appliedPromo ? Math.max(500, baseMMK - appliedPromo.discountMMK) : baseMMK;
      return `${discounted.toLocaleString()} MMK`;
    }
  };

  const handleBuyNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId || (currentGame.requiresZone && !zoneId)) {
      alert("ကျေးဇူးပြု၍ Game ID အချက်အလက် အပြည့်အစုံ ထည့်ပေးပါခင်ဗျာ");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          zoneId: currentGame.requiresZone ? zoneId : undefined,
          packId: selectedPack,
          paymentMethod,
          contact,
          promoCode: appliedPromo ? appliedPromo.code : undefined,
        }),
      });

      const data = await res.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert("ငွေပေးချေမှု ချိတ်ဆက်ရာတွင် အမှားဖြစ်နေပါသည်: " + (data.error || "Unknown Error"));
      }
    } catch (err: any) {
      alert("ချိတ်ဆက်မှု မအောင်မြင်ပါ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Live Announcement Banner */}
        {banner && (
          <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-500/40 rounded-2xl p-3.5 text-center text-sm font-bold text-amber-300 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2">
            <span>📢</span>
            <span>{banner}</span>
          </div>
        )}

        {/* Live Rate Pill */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Rate: 1 USDT = {exchangeRate.toLocaleString()} MMK
          </div>
        </div>

        {/* Game Switcher Tabs */}
        <div className="bg-slate-900/80 border border-slate-800 p-1.5 rounded-2xl flex gap-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => handleSelectGame("mlbb")}
            className={`flex-1 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedGame === "mlbb"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <span>🛡️</span>
            <span>Mobile Legends</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectGame("freefire")}
            className={`flex-1 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedGame === "freefire"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <span>🔥</span>
            <span>Free Fire</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectGame("pubg")}
            className={`flex-1 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedGame === "pubg"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <span>🪖</span>
            <span>PUBG Mobile</span>
          </button>
        </div>

        {/* Game Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {currentGame.title}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">{currentGame.subtitle}</p>
        </div>

        <form onSubmit={handleBuyNow} className="space-y-6">
          
          {/* အဆင့် ၁: Game ID & Check Nickname */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </span>
                <h2 className="text-lg font-bold">ဂိမ်းအချက်အလက် ထည့်ပါ</h2>
              </div>

              {selectedGame === "mlbb" && (
                <button
                  type="button"
                  onClick={handleCheckNickname}
                  disabled={checkingNick}
                  className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 text-xs font-bold px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  {checkingNick ? "စစ်နေသည်..." : "🔍 အကောင့်စစ်မည်"}
                </button>
              )}
            </div>

            <div className={`grid gap-4 ${currentGame.requiresZone ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">{currentGame.idLabel}</label>
                <input
                  type="text"
                  placeholder={selectedGame === "mlbb" ? "ဥပမာ - 12345678" : "ဥပမာ - 987654321"}
                  value={playerId}
                  onChange={(e) => {
                    setPlayerId(e.target.value);
                    setNickname("");
                    setNickError("");
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              {currentGame.requiresZone && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Zone ID</label>
                  <input
                    type="text"
                    placeholder="ဥပမာ - 1234"
                    value={zoneId}
                    onChange={(e) => {
                      setZoneId(e.target.value);
                      setNickname("");
                      setNickError("");
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                    required
                  />
                </div>
              )}
            </div>

            {nickname && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2 text-sm text-emerald-400 font-bold">
                <span>✓</span>
                <span>ဂိမ်းအကောင့်အမည်: <span className="text-white underline">{nickname}</span></span>
              </div>
            )}
            {nickError && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-400 font-semibold">
                ⚠️ {nickError}
              </div>
            )}
          </div>

          {/* အဆင့် ၂: ပက်ကေ့ခ်ျ ရွေးချယ်ရန် */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                2
              </span>
              <h2 className="text-lg font-bold">ပက်ကေ့ခ်ျ ရွေးချယ်ပါ</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentGame.packs.map((pack) => (
                <button
                  type="button"
                  key={pack.id}
                  onClick={() => setSelectedPack(pack.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    selectedPack === pack.id
                      ? "border-blue-500 bg-blue-600/15 ring-2 ring-blue-500"
                      : "border-slate-800 bg-slate-950 hover:border-slate-700"
                  }`}
                >
                  {pack.tag && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shadow">
                      {pack.tag}
                    </span>
                  )}
                  <div className="font-bold text-white text-base">
                    <span>{pack.icon || "💎"} </span>
                    {pack.name}
                  </div>
                  <div className="text-blue-400 font-semibold text-sm mt-1">
                    {getPrice(pack.priceUSD)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* အဆင့် ၃: Promo Code (လျှော့စျေးကူပွန် ထည့်သွင်းရန်) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <span>🎟️ Promo Code ရှိပါသလား?</span>
              </span>
              {appliedPromo && (
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  ✓ {appliedPromo.code} (-{appliedPromo.discountMMK.toLocaleString()} MMK)
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ကူပွန်ကုဒ် ရိုက်ထည့်ပါ (ဥပမာ - FLASH500)"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 uppercase font-mono font-bold"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Apply
              </button>
            </div>
            {promoError && <p className="text-xs text-rose-400">{promoError}</p>}
          </div>

          {/* အဆင့် ၄: ငွေပေးချေစနစ် */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                4
              </span>
              <h2 className="text-lg font-bold">ငွေပေးချေစနစ် ရွေးချယ်ပါ</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("APAY")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentMethod === "APAY"
                    ? "border-blue-500 bg-blue-600/15 ring-2 ring-blue-500"
                    : "border-slate-800 bg-slate-950 hover:border-slate-700"
                }`}
              >
                <div className="font-bold text-white flex items-center justify-between">
                  <span>A-Pay</span>
                  {paymentMethod === "APAY" && <span className="text-xs text-blue-400">✓</span>}
                </div>
                <div className="text-xs text-slate-400 mt-1">မြန်မာငွေ (KPay/Wave)</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("NOWPAYMENTS")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentMethod === "NOWPAYMENTS"
                    ? "border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500"
                    : "border-slate-800 bg-slate-950 hover:border-slate-700"
                }`}
              >
                <div className="font-bold text-white flex items-center justify-between">
                  <span className="text-emerald-400">Crypto မျိုးစုံ</span>
                  {paymentMethod === "NOWPAYMENTS" && <span className="text-xs text-emerald-400">✓</span>}
                </div>
                <div className="text-xs text-slate-400 mt-1">BTC, USDT မျိုးစုံ</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("BINANCE")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentMethod === "BINANCE"
                    ? "border-amber-500 bg-amber-500/15 ring-2 ring-amber-500"
                    : "border-slate-800 bg-slate-950 hover:border-slate-700"
                }`}
              >
                <div className="font-bold text-white flex items-center justify-between">
                  <span className="text-amber-400">Binance Pay</span>
                  {paymentMethod === "BINANCE" && <span className="text-xs text-amber-400">✓</span>}
                </div>
                <div className="text-xs text-slate-400 mt-1">Binance App USDT</div>
              </button>
            </div>

            <div className="mt-5">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                ပြေစာ လက်ခံမည့် ဖုန်းနံပါတ် သို့မဟုတ် Email (စိတ်ကြိုက်)
              </label>
              <input
                type="text"
                placeholder="09xxxxxxxxx သို့မဟုတ် email@example.com"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-4 rounded-2xl transition duration-200 shadow-lg text-lg cursor-pointer ${
              paymentMethod === "APAY"
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25"
                : paymentMethod === "NOWPAYMENTS"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25"
            }`}
          >
            {loading
              ? "ဆောင်ရွက်နေပါသည်..."
              : paymentMethod === "APAY"
              ? "A-Pay ဖြင့် ယခု ဝယ်ယူမည်"
              : paymentMethod === "NOWPAYMENTS"
              ? "Crypto ဖြင့် ယခု ဝယ်ယူမည်"
              : "Binance Pay ဖြင့် ယခု ဝယ်ယူမည်"}
          </button>
        </form>
      </div>
    </main>
  );
}