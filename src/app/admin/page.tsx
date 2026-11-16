import {
  getAllReservations,
  updateReservationStatus,
  getServiceTimes,
  addServiceTime,
  deleteServiceTime,
} from "@/actions/adminActions";
import { logoutUser } from "@/actions/authActions";

export const dynamic = "force-dynamic";

export default async function AdminPanel() {
  // Rezervasyonları ve saatleri paralel olarak veritabanından çekelim
  const [reservations, serviceTimes] = await Promise.all([
    getAllReservations(),
    getServiceTimes(),
  ]);

  // İstatistikler
  const pendingCount = reservations.filter((r) => r.status === "PENDING").length;
  const confirmedCount = reservations.filter((r) => r.status === "CONFIRMED").length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ÜST BAŞLIK & ÇIKIŞ */}
        <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🔴 Yönetici (Admin) Paneli</h1>
            <p className="text-sm text-gray-500">Müşteri servis taleplerini ve sefer saatlerini yönetin.</p>
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

        {/* İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <span className="text-sm text-gray-500">Toplam Talep</span>
            <p className="text-2xl font-bold text-gray-800">{reservations.length}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm">
            <span className="text-sm text-amber-700 font-medium">Onay Bekleyenler</span>
            <p className="text-2xl font-bold text-amber-800">{pendingCount}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm">
            <span className="text-sm text-green-700 font-medium">Onaylananlar</span>
            <p className="text-2xl font-bold text-green-800">{confirmedCount}</p>
          </div>
        </div>

        {/* SERVİS SAATLERİ YÖNETİM KARTI */}
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">⏰ Aktif Servis Saatleri</h2>
              <p className="text-xs text-gray-500">
                Müşterilerin rezervasyon yaparken seçebileceği sefer saatlerini düzenleyin.
              </p>
            </div>

            {/* YENİ SAAT EKLEME FORMU */}
            <form
              action={async (formData: FormData) => {
                "use server";
                await addServiceTime(formData);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="time"
                name="time"
                required
                className="px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition whitespace-nowrap"
              >
                + Saat Ekle
              </button>
            </form>
          </div>

          {/* KAYITLI SAATLER LİSTESİ */}
          {serviceTimes.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">
              Henüz aktif bir servis saati eklenmemiş. Yukarıdan yeni saat ekleyebilirsiniz.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2.5 pt-1">
              {serviceTimes.map((st) => (
                <div
                  key={st.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-800"
                >
                  <span>🕒 {st.time}</span>
                  <form
                    action={async () => {
                      "use server";
                      await deleteServiceTime(st.id);
                    }}
                  >
                    <button
                      type="submit"
                      title="Bu saati kaldır"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded px-1.5 py-0.5 text-xs font-bold transition"
                    >
                      ✕
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* REZERVASYON TABLOSU */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Gelen Servis Talepleri</h2>
          </div>

          {reservations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">Henüz yapılmış bir servis talebi yok.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                    <th className="py-3 px-4">Müşteri</th>
                    <th className="py-3 px-4">Biniş Durağı</th>
                    <th className="py-3 px-4">Tarih & Saat</th>
                    <th className="py-3 px-4">Yolcu</th>
                    <th className="py-3 px-4">Durum</th>
                    <th className="py-3 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm text-gray-700">
                  {reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        <div>{res.user.name || "İsimsiz"}</div>
                        <div className="text-xs text-gray-500">{res.user.phone}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-blue-600">🚏 {res.pickup}</td>
                      <td className="py-3 px-4">{new Date(res.date).toLocaleDateString("tr-TR")}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-800">
                          {new Date(res.date).toLocaleDateString("tr-TR")}
                          </div>
                          {res.time ? (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-semibold">
                              🕒 {res.time}
                              </span>
                              ) : (
                              <span className="text-xs text-gray-400">Saat belirtilmemiş</span>
                          )}
                      </td>
                      <td className="py-3 px-4">👥 {res.passengers} Kişi</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                            res.status === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : res.status === "CONFIRMED"
                              ? "bg-green-100 text-green-800"
                              : res.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {res.status === "PENDING"
                            ? "Beklemede"
                            : res.status === "CONFIRMED"
                            ? "Onaylandı"
                            : res.status === "COMPLETED"
                            ? "Tamamlandı"
                            : "İptal Edildi"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {/* ONAYLA BUTTON */}
                        {res.status === "PENDING" && (
                          <form
                            action={async () => {
                              "use server";
                              await updateReservationStatus(res.id, "CONFIRMED");
                            }}
                            className="inline-block"
                          >
                            <button
                              type="submit"
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition"
                            >
                              Onayla
                            </button>
                          </form>
                        )}

                        {/* İPTAL ET BUTTON */}
                        {(res.status === "PENDING" || res.status === "CONFIRMED") && (
                          <form
                            action={async () => {
                              "use server";
                              await updateReservationStatus(res.id, "CANCELLED");
                            }}
                            className="inline-block"
                          >
                            <button
                              type="submit"
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition"
                            >
                              İptal Et
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}