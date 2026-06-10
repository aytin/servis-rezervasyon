import { getStops } from "@/actions/durakActions";
import ReservationForm from "@/components/ReservationForm";

export default async function HomePage() {
  // Durakları güvenli bir şekilde sunucuda çekiyoruz
  const stops = await getStops();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Servis Rezervasyon Sistemi</h2>
        <p className="mt-2 text-sm text-gray-600">Durağınızı seçin ve koltuğunuzu ayırtın.</p>

        {/* YENİ EKLENEN SORGULAMA LİNKİ */}
        <div className="mt-4">
          <a href="/sorgula" className="text-sm text-blue-600 hover:underline font-medium">
          Mevcut Rezervasyonumu Sorgula →
          </a>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Akıllı form bileşenimizi çağırıyoruz ve durakları prop olarak gönderiyoruz */}
        <ReservationForm stops={stops} />
      </div>
    </div>
  );
}