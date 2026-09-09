import { createReservation, getMyReservations } from "@/actions/reservationActions";
import { logoutUser } from "@/actions/authActions";
import { createReservationFormAction } from "@/actions/reservationActions";

const STOPS = ["Arı-su", "Kuş cenneti", "Okul", "Kapı"];

export default async function MusteriPanel() {
  const reservations = await getMyReservations();
  
  // Bugünkü tarihi YYYY-MM-DD formatında alıyoruz
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* ÜST BAŞLIK & ÇIKIŞ */}
        <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">🔵 Müşteri Rezervasyon Paneli</h1>
            <p className="text-sm text-gray-500">Biniş durağınızı seçerek servis talebinde bulunabilirsiniz.</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* REZERVASYON FORMU */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Yeni Talep Oluştur</h2>
            
            <form action={createReservationFormAction} className="space-y-4">
              
              {/* BİNİŞ NOKTASI */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Biniş Noktası</label>
                <select
                  name="pickup"
                  required
                  defaultValue=""
                  className="mt-1 block w-full p-2.5 border rounded-lg text-sm text-black bg-white focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>Durak seçiniz...</option>
                  {STOPS.map((stop) => (
                    <option key={stop} value={stop}>{stop}</option>
                  ))}
                </select>
              </div>

              {/* TARİH VE YOLCU SAYISI */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tarih</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={today}
                    required
                    className="mt-1 block w-full p-2.5 border rounded-lg text-sm text-black bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Yolcu Sayısı</label>
                  <input
                    type="number"
                    name="passengers"
                    min="1"
                    defaultValue="1"
                    required
                    className="mt-1 block w-full p-2.5 border rounded-lg text-sm text-black bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                Rezervasyon Oluştur
              </button>
            </form>
          </div>

          {/* REZERVASYONLARIM LİSTESİ */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Rezervasyonlarım</h2>

            {reservations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Henüz oluşturulmuş bir rezervasyonunuz yok.</p>
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto">
                {reservations.map((res) => (
                  <div key={res.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-sm text-gray-900">
                        🚏 Biniş Durağı: {res.pickup}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          res.status === "PENDING"
                            ? "bg-amber-100 text-amber-700"
                            : res.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {res.status === "PENDING" ? "Beklemede" : res.status === "CONFIRMED" ? "Onaylandı" : "Tamamlandı"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      📅 Tarih: {new Date(res.date).toLocaleDateString("tr-TR")} | 👥 {res.passengers} Yolcu
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}