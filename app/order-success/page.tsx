import Link from "next/link";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const orderId = params.order_id || "ORD-UNKNOWN";
  const pack = params.pack || "Diamonds Pack";
  const amount = params.amount || "0";
  const player = params.player || "N/A";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg border border-emerald-500/30">
          ✓
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">ဝယ်ယူမှု အောင်မြင်ပါသည်!</h1>
          <p className="text-slate-400 text-sm">
            သင့်ဂိမ်းအကောင့်ထဲသို့ စိန်များ မကြာမီ ထည့်သွင်းပေးပါမည်
          </p>
        </div>

        {/* Receipt Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-left text-sm space-y-3">
          <div className="flex justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">အော်ဒါနံပါတ်:</span>
            <span className="font-mono font-bold text-blue-400">{orderId}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">Player ID:</span>
            <span className="font-bold text-white">{player}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">ပစ္စည်းအမျိုးအစား:</span>
            <span className="font-bold text-white">{pack}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">ကျသင့်ငွေ:</span>
            <span className="font-bold text-emerald-400">{Number(amount).toLocaleString()} MMK</span>
          </div>

          <div className="flex justify-between pt-1">
            <span className="text-slate-400">အခြေအနေ:</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Processing (စိန်ပို့ဆောင်နေသည်)
            </span>
          </div>
        </div>

        {/* Back Button */}
        <Link
          href="/"
          className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-blue-600/30 text-sm"
        >
          မူလစာမျက်နှာသို့ ပြန်သွားမည်
        </Link>
      </div>
    </main>
  );
}