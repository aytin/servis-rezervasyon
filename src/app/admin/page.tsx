export const dynamic = "force-dynamic";

import { getReservations } from "@/actions/rezervasyonActions";
import { logoutAdmin } from "@/actions/authActions";

export default async function AdminDashboardPage() {
  const reservations = await getReservations();

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yönetici Paneli</h1>
          <p className="text-gray-500 mt-1">Gelen rezervasyonları ve yolcu listesini buradan takip edebilirsiniz.</p>
        </div>
        <a 
          href="/admin/duraklar" 
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
        >
          Durak Yönetimi →
        </a>
        <form action={logoutAdmin} className="inline">
          <button 
          type="submit" 
          className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition ml-2"
          >
            Çıkış Yap
          </button>
        </form>
      </div>

      {/* REZERVASYON ÖZET KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h3 className="text-sm font-medium text-blue-800 uppercase tracking-wider">Toplam Rezervasyon</h3>
          <p className="text-3xl font-bold text-blue-900 mt-2">{reservations.length}</p>
        </div>
      </div>

      {/* YOLCU LİSTESİ TABLOSU */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Güncel Yolcu Listesi</h2>
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        {reservations.length === 0 ? (
          <p className="p-8 text-gray-500 text-center">Henüz yapılmış bir rezervasyon bulunmuyor.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-semibold">
                  <th className="p-4">Yolcu Telefon</th>
                  <th className="p-4">Seçtiği Durak</th>
                  <th className="p-4">Servis Saati</th>
                  <th className="p-4">Yolculuk Tarihi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-black">{res.user.phone}</td>
                    <td className="p-4">{res.stop.name}</td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                        {res.stop.time}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{res.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}