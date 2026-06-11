export const dynamic = "force-dynamic";

import { addStop, getStops } from "@/actions/durakActions";

export default async function AdminDuraklarPage() {
  // Veritabanındaki mevcut durakları çekiyoruz (Sunucu tarafında direkt çalışır)
  const stops = await getStops();

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Yönetici Paneli - Durak Yönetimi</h1>

      {/* DURAK EKLEME FORMU */}
      <form action={addStop} className="bg-gray-100 p-6 rounded-xl mb-8 space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-700">Yeni Durak Ekle</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            type="text" 
            name="name" 
            placeholder="Durak Adı (Örn: Kadıköy)" 
            className="p-3 border rounded-lg text-black bg-white" 
            required 
          />
          <input 
            type="text" 
            name="time" 
            placeholder="Kalkış Saati (Örn: 08:30)" 
            className="p-3 border rounded-lg text-black bg-white" 
            required 
          />
          <input 
            type="number" 
            name="capacity" 
            placeholder="Koltuk Kapasitesi (Örn: 16)" 
            className="p-3 border rounded-lg text-black bg-white" 
            required 
          />
        </div>
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Durak Oluştur
        </button>
      </form>

      {/* MEVCUT DURAKLARIN LİSTESİ */}
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Mevcut Duraklar</h2>
      <div className="bg-white border rounded-xl divide-y overflow-hidden shadow-sm">
        {stops.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">Henüz sisteme bir durak eklenmemiş.</p>
        ) : (
          stops.map((stop) => (
            <div key={stop.id} className="p-4 flex justify-between items-center text-gray-800 hover:bg-gray-50">
              <div>
                <span className="font-semibold text-lg text-black">{stop.name}</span>
                <span className="text-sm text-gray-500 ml-3 bg-gray-100 px-2 py-1 rounded">
                  Saat: {stop.time}
                </span>
              </div>
              <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                Kontenjan: {stop.capacity} Kişi
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}