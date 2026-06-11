export const dynamic = "force-dynamic";

'use client'

import { useState } from "react";
import { getReservationsByPhone, cancelReservation } from "@/actions/rezervasyonActions";

export default function SorgulaPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelLoadingId, setCancelLoadingId] = useState<string | null>(null); // Hangi rezervasyonun iptal edildiğini tutar
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  // Rezervasyon Arama Fonksiyonu
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setSearched(true);

    const result = await getReservationsByPhone(phone);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      setReservations([]);
    } else if (result.reservations) {
      setReservations(result.reservations);
    }
  }

  // Rezervasyon İptal Etme Fonksiyonu
  async function handleCancel(reservationId: string) {
    if (!confirm("Bu rezervasyonu iptal etmek istediğinize emin misiniz?")) return;

    setCancelLoadingId(reservationId);
    setError(null);
    setSuccessMessage(null);

    const result = await cancelReservation(reservationId);
    setCancelLoadingId(null);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccessMessage(result.success);
      // İptal edilen rezervasyonu ekrandaki listeden anlık olarak çıkartıyoruz
      setReservations(reservations.filter((res) => res.id !== reservationId));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Rezervasyon Sorgulama & İptal</h2>
        <p className="mt-2 text-sm text-gray-600">Seyahat bilgilerinizi görmek veya iptal etmek için telefon numaranızı girin.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full p-3 border rounded-lg text-black bg-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="05551234567"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:bg-gray-400"
            >
              {loading ? "Aranıyor..." : "Sorgula"}
            </button>
          </form>

          {/* HATA MESAJI */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* BAŞARI MESAJI (İPTAL İŞLEMİ İÇİN) */}
          {successMessage && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm font-medium">
              {successMessage}
            </div>
          )}
        </div>

        {/* REZERVASYON SONUÇLARI */}
        {searched && reservations.length > 0 && (
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Bulunan Rezervasyonlarınız</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {reservations.map((res) => (
                <div key={res.id} className="p-4 flex justify-between items-center text-gray-700 hover:bg-gray-50 transition">
                  <div>
                    <p className="font-semibold text-black text-lg">{res.stop.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">Tarih: {res.date} | Saat: {res.stop.time}</p>
                  </div>
                  
                  {/* İPTAL ET BUTONU */}
                  <div>
                    <button
                      onClick={() => handleCancel(res.id)}
                      disabled={cancelLoadingId !== null}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium border border-red-200 transition disabled:opacity-50"
                    >
                      {cancelLoadingId === res.id ? "İptal ediliyor..." : "İptal Et"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ANASAYFAYA DÖN */}
      <div className="text-center mt-6">
        <a href="/" className="text-blue-600 hover:underline text-sm">← Rezervasyon Sayfasına Dön</a>
      </div>
    </div>
  );
}