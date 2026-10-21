'use client';

import { useState, useEffect } from "react";
import { getUserReservations, cancelReservation } from "@/actions/reservationActions";

export default function SorgulaPage() {
  const [phoneInput, setPhoneInput] = useState("");
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const fetchReservations = async (phone?: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const result = await getUserReservations(phone);
      if (result.success && Array.isArray(result.data)) {
        setReservations(result.data);
      } else if (result.error) {
        setMessage({ type: "error", text: result.error });
      }
    } catch (err) {
      console.error("Yükleme hatası:", err);
      setMessage({ type: "error", text: "Veriler yüklenirken bir sorun oluştu." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;
    fetchReservations(phoneInput);
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Rezervasyonu iptal etmek istediğinize emin misiniz?")) return;
    const res = await cancelReservation(id);
    if (res.success) {
      setMessage({ type: "success", text: "Rezervasyon iptal edildi." });
      fetchReservations(phoneInput);
    } else {
      setMessage({ type: "error", text: res.error || "İptal edilemedi." });
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Rezervasyon Sorgulama & Taleplerim</h1>

        {/* TELEFON İLE SORGULAMA FORMU */}
        <form onSubmit={handleSearch} className="mb-8 flex gap-2">
          <input
            type="tel"
            placeholder="Telefon Numaranız (Örn: 05551234567)"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            className="flex-1 p-3 border rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Sorgula
          </button>
        </form>

        {message && (
          <div className={`p-4 mb-4 rounded-lg text-sm font-medium ${
            message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
        ) : reservations.length === 0 ? (
          <div className="bg-white p-6 rounded-lg border text-center text-gray-500 shadow-sm">
            Henüz oluşturulmuş bir rezervasyon bulunamadı. Lütfen telefon numaranızı girerek sorgulayın.
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((res) => (
              <div key={res.id} className="p-4 border rounded-lg shadow-sm flex justify-between items-center bg-white text-gray-900">
                <div>
                  <p className="font-semibold text-lg text-gray-900">Biniş Durağı: {res.pickup}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Tarih: {res.date ? new Date(res.date).toLocaleDateString("tr-TR") : "-"}
                  </p>
                  <span className={`inline-block mt-3 px-3 py-1 text-xs font-semibold rounded-full ${
                    res.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                    res.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    res.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {res.status === 'PENDING' ? 'Beklemede' :
                     res.status === 'CONFIRMED' ? 'Onaylandı' :
                     res.status === 'COMPLETED' ? 'Tamamlandı' : 'İptal Edildi'}
                  </span>
                </div>

                {res.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancel(res.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition font-medium"
                  >
                    İptal Et
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}