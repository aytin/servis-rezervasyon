import { getTodayDriverReservations, markAsCompleted } from "@/actions/driverActions";
import { logoutUser } from "@/actions/authActions";

const STOPS = ["Arı-su", "Kuş cenneti", "Okul", "Kapı"];

export default async function SoforPanel() {
  const reservations = await getTodayDriverReservations();

  // Toplam Onaylı Yolcu Sayısı
  const totalPassengers = reservations.reduce((acc, r) => acc + r.passengers, 0);

  // Duraklara Göre Toplam Yolcu Sayıları Hesabı
  const stopCounts = STOPS.map((stop) => {
    const count = reservations
      .filter((r) => r.pickup === stop)
      .reduce((acc, r) => acc + r.passengers, 0);
    return { stop, count };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* ÜST BAŞLIK & ÇIKIŞ */}
        <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-amber-600">🟡 Şoför Sürüş Paneli</h1>
            <p className="text-sm text-gray-500">
              📅 Bugünün Tarihi: <strong>{new Date().toLocaleDateString("tr-TR")}</strong>
            </p>
          </div>
          <form action={logoutUser}>
            <button
              type="submit"
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition"
            >
              Çıkış Yap
            </button>
          </form>
        </div>

        {/* TOPLAM YOLCU ÖZET KARTI */}
        <div className="bg-amber-500 text-white p-6 rounded-xl shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium opacity-90">Günün Toplam Yolcu Sayısı</h2>
            <p className="text-4xl font-extrabold mt-1">{totalPassengers} Yolcu</p>
          </div>
          <span className="text-4xl">🚌</span>
        </div>

        {/* DURAK BAZLI TOPLAM KARTLARI */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Durak Bazlı Yolcu Dağılımı</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stopCounts.map(({ stop, count }) => (
              <div key={stop} className="bg-white p-4 rounded-xl border shadow-sm text-center">
                <span className="text-xs text-gray-500 font-medium block">🚏 {stop}</span>
                <span className="text-2xl font-bold text-gray-900 mt-1 block">{count} Kişi</span>
              </div>
            ))}
          </div>
        </div>

        {/* YOLCU LİSTESİ */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Bugünkü Yolcu Listesi</h2>
          </div>

          {reservations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Bugün için onaylanmış herhangi bir servis kaydı bulunmamaktadır.
            </div>
          ) : (
            <div className="divide-y">
              {reservations.map((res) => (
                <div
                  key={res.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                    res.status === "COMPLETED" ? "bg-green-50/60 opacity-75" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{res.user.name || "İsimsiz Yolcu"}</span>
                      <a
                        href={`tel:${res.user.phone}`}
                        className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-200 hover:bg-blue-100 transition"
                      >
                        📞 {res.user.phone}
                      </a>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-4">
                      <span>🚏 Biniş Durağı: <strong className="text-amber-700">{res.pickup}</strong></span>
                      <span>👥 Yolcu: <strong>{res.passengers} Kişi</strong></span>
                    </div>
                  </div>

                  <div>
                    {res.status === "COMPLETED" ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                        ✓ Bindi / Tamamlandı
                      </span>
                    ) : (
                      <form
                        action={async () => {
                          'use server'
                          await markAsCompleted(res.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                        >
                          Servise Alındı (Tamamla)
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}