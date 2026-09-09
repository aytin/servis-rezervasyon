import { getAllReservations, updateReservationStatus, ReservationStatusType } from "@/actions/adminActions";
import { logoutUser } from "@/actions/authActions";

export default async function AdminPanel() {
  const reservations = await getAllReservations();

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
            <p className="text-sm text-gray-500">Müşteri servis taleplerini yönetin ve onaylayın.</p>
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
                    <th className="py-3 px-4">Tarih</th>
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
                        {res.status !== "CONFIRMED" && res.status !== "COMPLETED" && (
                          <form
                            action={async () => {
                              'use server'
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
                        {res.status !== "CANCELLED" && (
                          <form
                            action={async () => {
                              'use server'
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