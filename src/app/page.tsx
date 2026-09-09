'use client'

import { useState, useEffect } from "react";
import { getStops } from "@/actions/durakActions";
import { createReservation } from "@/actions/reservationActions"; 

export default function HomePage() {
  const [stops, setStops] = useState<any[]>([]);
  const [uniqueStopNames, setUniqueStopNames] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  // Form Değişkenleri (Telefon kaldırıldı)
  const [date, setDate] = useState("");
  const [selectedStopName, setSelectedStopName] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function fetchStops() {
      const data = await getStops();
      if (data) {
        setStops(data);
        const names = Array.from(new Set(data.map((stop: any) => stop.name)));
        setUniqueStopNames(names);
      }
    }
    fetchStops();
  }, []);

  useEffect(() => {
    if (selectedStopName) {
      const times = stops
        .filter((stop) => stop.name === selectedStopName)
        .map((stop) => stop.time);
      setAvailableTimes(times);
      setSelectedTime("");
    } else {
      setAvailableTimes([]);
    }
  }, [selectedStopName, stops]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const matchedStop = stops.find(
      (stop) => stop.name === selectedStopName && stop.time === selectedTime
    );

    if (!matchedStop) {
      setMessage({ type: "error", text: "Seçilen durak ve saat kombinasyonu bulunamadı." });
      setLoading(false);
      return;
    }

    // Server Action'a sadece tarih ve durak ID'sini gönderiyoruz
    const result = await createReservation({
      date: date,
      stopId: matchedStop.id,
    });

    setLoading(false);

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Rezervasyonunuz başarıyla oluşturuldu! 🎉" });
      setDate("");
      setSelectedStopName("");
      setSelectedTime("");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Servis Rezervasyon Sistemi</h2>
        <p className="mt-2 text-sm text-gray-600">Lütfen yolculuk bilgilerinizi seçin.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border">
          
          {message && (
            <div className={`mb-4 p-4 rounded-lg text-sm font-medium ${
              message.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* TARİH SEÇİMİ */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Yolculuk Tarihi</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full p-3 border rounded-lg text-black bg-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* DURAK SEÇİMİ */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Durak Seçin</label>
              <select
                required
                value={selectedStopName}
                onChange={(e) => setSelectedStopName(e.target.value)}
                className="mt-1 block w-full p-3 border rounded-lg text-black bg-white focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Durak Seçiniz --</option>
                {uniqueStopNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* SAAT SEÇİMİ */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Saat Seçin</label>
              <select
                required
                disabled={!selectedStopName}
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="mt-1 block w-full p-3 border rounded-lg text-black bg-white focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">
                  {selectedStopName ? "-- Saat Seçiniz --" : "Önce durak seçmelisiniz"}
                </option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition disabled:bg-gray-400"
              >
                {loading ? "Rezervasyon yapılıyor..." : "Rezervasyonu Tamamla"}
              </button>
            </div>
          </form>

          <div className="text-center mt-6 border-t pt-4">
            <a href="/sorgula" className="text-blue-600 hover:underline text-sm">Rezervasyonlarım →</a>
          </div>

        </div>
      </div>
    </div>
  );
}