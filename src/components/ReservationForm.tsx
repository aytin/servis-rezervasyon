'use client' // Bu sayede state (durum) yönetimi ve animasyonlar kullanabiliriz

import { useState } from "react";
import { createReservation } from "@/actions/rezervasyonActions";

// Durak tipini TypeScript için tanımlıyoruz
interface Stop {
  id: string;
  name: string;
  time: string;
  capacity: number;
}

export default function ReservationForm({ stops }: { stops: Stop[] }) {
  // Geri bildirim mesajlarını tutacak state'ler
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Form gönderildiğinde çalışacak fonksiyon
  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setStatus(null);

    // Server Action'ı çağırıyoruz ve dönen cevabı bekliyoruz
    const result = await createReservation(formData);

    setLoading(false);

    if (result?.error) {
      setStatus({ type: 'error', message: result.error });
    } else if (result?.success) {
      setStatus({ type: 'success', message: result.success });
      
      // Başarılı ise formu temizlemek için (isteğe bağlı)
      const form = document.getElementById("rezervasyon-formu") as HTMLFormElement;
      form?.reset();
    }
  }

  // Bugünün tarihini ayarlama (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border">
      
      {/* UYARI MESAJ KUTULARI */}
      {status && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
          status.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {status.message}
        </div>
      )}

      {/* REZERVASYON FORMU */}
      <form id="rezervasyon-formu" action={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Telefon Numaranız</label>
          <input
            type="tel"
            name="phone"
            required
            disabled={loading}
            className="mt-1 block w-full p-3 border rounded-lg text-black bg-white focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            placeholder="05551234567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Kalkış Durağı</label>
          <select
            name="stopId"
            required
            disabled={loading}
            className="mt-1 block w-full p-3 border rounded-lg text-black bg-white focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">Bir durak seçiniz...</option>
            {stops.map((stop) => (
              <option key={stop.id} value={stop.id}>
                {stop.name} (Kalkış: {stop.time})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Yolculuk Tarihi</label>
          <input
            type="date"
            name="date"
            defaultValue={today}
            min={today}
            required
            disabled={loading}
            className="mt-1 block w-full p-3 border rounded-lg text-black bg-white focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:bg-blue-400"
          >
            {loading ? "İşlem yapılıyor..." : "Rezervasyon Yap"}
          </button>
        </div>
      </form>
    </div>
  );
}