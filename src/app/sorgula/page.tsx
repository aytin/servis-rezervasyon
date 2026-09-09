'use client'

export const dynamic = "force-dynamic"; // Railway build koruması

import { useState, useEffect } from "react";
import { getUserReservations, cancelReservation } from "@/actions/reservationActions";

export default function SorgulaPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sayfa açıldığında kullanıcının rezervasyonlarını otomatik yükle
  async function loadReservations() {
    setLoading(true);
    const result = await getUserReservations();
    if (result.success && result.data) {
      setReservations(result.data);
    } else if (result.error) {
      setMessage({ type: "error", text: result.error });
    }
    setLoading(false);
  }

  useEffect(() => {
    loadReservations();
  }, []);

  // İptal Et butonuna basıldığında çalışır
  async function handleCancel(id: string) {
    const confirmCancel = confirm("Bu rezervasyonu iptal etmek istediğinize emin misiniz?");
    if (!confirmCancel) return;

    const result = await cancelReservation(id);

    if (result.success) {
      setMessage({ type: "success", text: "Rezervasyonunuz başarıyla iptal edildi." });
      // Listeyi yerelde de güncelle (silineni listeden çıkar)
      setReservations(reservations.filter(res => res.id !== id));
    } else if (result.error) {
      setMessage({ type: "error", text: result.error });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Rezervasyonlarım</h2>
        <p className="mt-2 text-sm text-gray-600">Aktif seyahat listeleriniz ve yönetim ekranı.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border">
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
              message.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="text-center py-6 text-gray-500">Rezervasyonlarınız yükleniyor...</div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Henüz aktif bir rezervasyonunuz bulunmuyor.</p>
              <a href="/" className="inline-block px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition">
                Hemen Rezervasyon Yap
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((res) => (
                <div key={res.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-xl bg-gray-50 hover:border-gray-300 transition">
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {res.stop?.name || "Bilinmeyen Durak"}
                    </div>
                    <div className="text-sm text-gray-600 mt-1 flex gap-4">
                      <span>📅 {res.date}</span>
                      <span>⏰ Saat: {res.stop?.time || "--:--"}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 text-right">
                    <button
                      onClick={() => handleCancel(res.id)}
                      className="w-full sm:w-auto px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                    >
                      İptal Et
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8 border-t pt-4">
            <a href="/" className="text-blue-600 hover:underline text-sm">← Yeni Rezervasyon Oluştur</a>
          </div>

        </div>
      </div>
    </div>
  );
}