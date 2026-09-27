"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Order {
  id: string;
  orderCode: string;
  playerId: string;
  zoneId: string | null;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
  product?: { name: string } | null;
}

interface Promo {
  code: string;
  discountMMK: number;
  discountUSD: number;
  maxUses: number;
  usedCount: number;
}

export default function AdminOrdersPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Banner State
  const [bannerText, setBannerText] = useState("");
  const [savingBanner, setSavingBanner] = useState(false);

  // Promo Codes State
  const [promos, setPromos] = useState<Promo[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newDiscountMMK, setNewDiscountMMK] = useState(500);
  const [newDiscountUSD, setNewDiscountUSD] = useState(0.15);
  const [newMaxUses, setNewMaxUses] = useState(50); // Default အယောက် ၅၀

  const ADMIN_PASSWORD = "admin12345"; 

  useEffect(() => {
    const savedAuth = sessionStorage.getItem("admin_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      fetchOrders();
      fetchBanner();
      fetchPromos();
    }
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanner = async () => {
    try {
      const res = await fetch("/api/banner");
      const data = await res.json();
      if (data.banner) setBannerText(data.banner);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPromos = async () => {
    try {
      const res = await fetch("/api/promo");
      const data = await res.json();
      if (data.promos) setPromos(data.promos);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, fulfillmentStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, fulfillmentStatus: newStatus } : o))
        );
      }
    } catch (err) {
      alert("Status ပြောင်းလဲရာတွင် အမှားဖြစ်နေပါသည်");
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBanner(true);
    try {
      const res = await fetch("/api/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banner: bannerText }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Banner ကို အောင်မြင်စွာ တင်လိုက်ပါပြီ!");
      }
    } catch (err) {
      alert("Banner တင်ရာတွင် အမှားဖြစ်နေပါသည်");
    } finally {
      setSavingBanner(false);
    }
  };

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;

    const updatedPromos = [
      ...promos.filter((p) => p.code.toUpperCase() !== newCode.toUpperCase()),
      { 
        code: newCode.toUpperCase().trim(), 
        discountMMK: Number(newDiscountMMK), 
        discountUSD: Number(newDiscountUSD),
        maxUses: Number(newMaxUses) || 50,
        usedCount: 0
      },
    ];

    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promos: updatedPromos }),
      });
      const data = await res.json();
      if (data.success) {
        setPromos(updatedPromos);
        setNewCode("");
        alert(`Promo Code: ${newCode.toUpperCase()} (အသုံးပြုခွင့် ${newMaxUses} ဦး) အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ!`);
      }
    } catch (err) {
      alert("Promo ထည့်ရာတွင် အမှားဖြစ်နေပါသည်");
    }
  };

  const handleDeletePromo = async (codeToDelete: string) => {
    const updatedPromos = promos.filter((p) => p.code !== codeToDelete);
    try {
      await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promos: updatedPromos }),
      });
      setPromos(updatedPromos);
    } catch (err) {
      alert("ဖျက်ရာတွင် အမှားဖြစ်နေပါသည်");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      fetchOrders();
      fetchBanner();
      fetchPromos();
    } else {
      alert("Password မှားယွင်းနေပါသည်!");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    setPasswordInput("");
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-blue-600/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto text-3xl border border-blue-500/20">
            🔒
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">အော်ဒါများ စီမံရန် Password ရိုက်ထည့်ပါ</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Admin Password..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-center focus:outline-none focus:border-blue-500 tracking-widest text-sm"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition text-sm cursor-pointer shadow-lg shadow-blue-600/25"
            >
              ဝင်ရောက်မည် (Unlock)
            </button>
          </form>

          <Link href="/" className="block text-xs text-slate-500 hover:text-slate-400">
            ← ဆိုင်ရှေ့သို့ ပြန်သွားမည်
          </Link>
        </div>
      </main>
    );
  }

  // Analytics Calculation
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.fulfillmentStatus !== "COMPLETED" && o.fulfillmentStatus !== "SUCCESS").length;
  const paidOrders = orders.filter((o) => o.paymentStatus === "PAID");
  const totalRevenueMMK = paidOrders
    .filter((o) => o.paymentMethod === "APAY")
    .reduce((sum, o) => sum + o.amount, 0);
  const totalRevenueUSD = paidOrders
    .filter((o) => o.paymentMethod === "BINANCE" || o.paymentMethod === "NOWPAYMENTS")
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <span>Admin Dashboard</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                Live
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">အရောင်းစာရင်းနှင့် ပရိုမိုးရှင်း စီမံခန့်ခွဲခန်း</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl transition"
            >
              ← ဆိုင်ရှေ့သို့
            </Link>
            <button
              onClick={fetchOrders}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl transition cursor-pointer"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleLogout}
              className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-2 rounded-xl transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow">
            <span className="text-xs text-slate-400 font-semibold uppercase">စုစုပေါင်း အော်ဒါ</span>
            <div className="text-2xl font-black text-white mt-1">{totalOrders} ခု</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow">
            <span className="text-xs text-amber-400 font-semibold uppercase">စိန်ထည့်ရန် ကျန်</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{pendingOrders} ခု</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow">
            <span className="text-xs text-emerald-400 font-semibold uppercase">ရရှိငွေ (MMK)</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{totalRevenueMMK.toLocaleString()} K</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow">
            <span className="text-xs text-blue-400 font-semibold uppercase">ရရှိငွေ (USD)</span>
            <div className="text-2xl font-black text-blue-400 mt-1">${totalRevenueUSD.toFixed(2)}</div>
          </div>
        </div>

        {/* FEATURE: Promo Code Manager with Auto-Expire Limit */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>🎟️ Promo Code (Auto-Expire ဦးရေ ကန့်သတ်ချက်ပါဝင်သည်)</span>
            </h2>
            <span className="text-xs text-slate-400">ဦးရေပြည့်ပါက အလိုအလျောက် သက်တမ်းကုန်မည်</span>
          </div>

          <form onSubmit={handleAddPromo} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Code (ဥပမာ - FLASH50)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 uppercase font-mono font-bold"
              required
            />
            <input
              type="number"
              placeholder="လျှော့ငွေ MMK (500)"
              value={newDiscountMMK}
              onChange={(e) => setNewDiscountMMK(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="လျှော့ငွေ USD (0.15)"
              value={newDiscountUSD}
              onChange={(e) => setNewDiscountUSD(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="number"
              placeholder="ကန့်သတ်ဦးရေ (50)"
              value={newMaxUses}
              onChange={(e) => setNewMaxUses(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-amber-400 font-bold text-sm focus:outline-none focus:border-blue-500"
              title="အသုံးပြုနိုင်သည့် အကြိမ်ရေ"
              required
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl transition text-sm cursor-pointer shadow"
            >
              + Code ထည့်မည်
            </button>
          </form>

          {/* Active Promo Codes List with Progress */}
          <div className="flex flex-wrap gap-2 pt-2">
            {promos.length === 0 ? (
              <span className="text-xs text-slate-500">ကူပွန်ကုဒ် မရှိသေးပါခင်ဗျာ။</span>
            ) : (
              promos.map((p) => {
                const isExpired = (p.usedCount || 0) >= (p.maxUses || 50);
                return (
                  <div
                    key={p.code}
                    className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border ${
                      isExpired
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        : "bg-slate-950 border-slate-700 text-slate-300"
                    }`}
                  >
                    <span className="font-mono font-bold text-emerald-400">{p.code}</span>
                    <span className="text-slate-400">(-{p.discountMMK.toLocaleString()} K)</span>
                    
                    {/* Progress Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isExpired ? "bg-rose-500 text-white" : "bg-blue-600/30 text-blue-300"
                    }`}>
                      {isExpired ? "Expired (ကုန်ပါပြီ)" : `${p.usedCount || 0}/${p.maxUses || 50} ဦး`}
                    </span>

                    <button
                      onClick={() => handleDeletePromo(p.code)}
                      className="text-rose-400 hover:text-rose-300 font-bold ml-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Banner Controller */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>📢 ဆိုင်ရှေ့ ကြေညာချက် Banner ထိန်းချုပ်ရန်</span>
            </h2>
            <span className="text-xs text-slate-400">Website ထိပ်ဆုံးတွင် ပေါ်မည်</span>
          </div>
          <form onSubmit={handleSaveBanner} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="ဥပမာ - 🔥 MLBB Recharge Phase 1 စတင်ပါပြီ! Code: FLASH50 သုံးပြီး စိန်ဖြည့်ပါ!"
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={savingBanner}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition text-sm cursor-pointer whitespace-nowrap"
            >
              {savingBanner ? "သိမ်းနေသည်..." : "Banner တင်မည်"}
            </button>
          </form>
        </div>

        {/* Orders Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800/80 font-bold text-white flex justify-between items-center">
            <span>အော်ဒါစာရင်းများ ({orders.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">အော်ဒါနံပါတ်</th>
                  <th className="py-4 px-6">Player ID (Server)</th>
                  <th className="py-4 px-6">ပစ္စည်း</th>
                  <th className="py-4 px-6">ကျသင့်ငွေ</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6">စိန်ပို့ဆောင်မှု (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      အော်ဒါများကို ဆွဲထုတ်နေပါသည်...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      အော်ဒါမှတ်တမ်း မရှိသေးပါခင်ဗျာ။
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-4 px-6 font-mono font-bold text-blue-400">
                        {order.orderCode}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-white">ID: {order.playerId}</div>
                        <div className="text-xs text-slate-400">Zone: ({order.zoneId || "-"})</div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-200">
                        {order.product ? order.product.name : "Diamonds"}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-100">
                        {order.amount.toLocaleString()} {order.paymentMethod === "BINANCE" || order.paymentMethod === "NOWPAYMENTS" ? "USD" : "MMK"}
                      </td>
                      <td className="py-4 px-6">
                        {order.paymentStatus === "PAID" ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            ✓ PAID (ငွေဝင်ပြီး)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            ⏳ PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {order.fulfillmentStatus === "COMPLETED" || order.fulfillmentStatus === "SUCCESS" ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-max">
                            ✓ စိန်ပို့ပြီး
                          </span>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow cursor-pointer whitespace-nowrap"
                          >
                            ✓ စိန်ပို့ပြီးပါပြီ
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}