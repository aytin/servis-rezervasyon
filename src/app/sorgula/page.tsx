'use client';

import { useState, useEffect } from "react";
import { getUserReservations, cancelReservation } from "@/actions/reservationActions";

export default function SorgulaPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const result = await getUserReservations();
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

  const handleCancel = async (id: string) => {
    if (!confirm("Rezervasyonu iptal etmek istediğinize emin misiniz?")) return;
    const res = await cancelReservation(id);
    if (res.success) {
      setMessage({ type: "success", text: "Rezervasyon iptal edildi." });
      fetchReservations();
    } else {
      setMessage({ type: "error", text: res.error || "İptal edilemedi." });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Rezervasyon Sorgulama & Taleplerim</h1>

      {message && (
        <div className={`p-4 mb-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <p>Yükleniyor...</p>
      ) : reservations.length === 0 ? (
        <p className="text-gray-500">Henüz oluşturulmuş bir rezervasyonunuz bulunmuyor.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <div key={res.id} className="p-4 border rounded-lg shadow-sm flex justify-between items-center bg-white">
              <div>
                <p className="font-semibold text-lg">Biniş Noktası: {res.pickup}</p>
                <p className="text-sm text-gray-600">
                  Tarih: {res.date ? new Date(res.date).toLocaleDateString("tr-TR") : "-"}
                </p>
                <p className="text-sm text-gray-600">Yolcu Sayısı: {res.passengers}</p>
                <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
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
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
                >
                  İptal Et
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}