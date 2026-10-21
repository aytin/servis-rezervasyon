import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
        
        {/* Başlık ve Açıklama */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Servis Rezervasyon Sistemi</h1>
          <p className="text-sm text-gray-600 mt-2">
            Devam etmek için lütfen giriş yapın veya yeni bir hesap oluşturun.
          </p>
        </div>

        {/* Yönlendirme Butonları */}
        <div className="space-y-4 pt-2">
          <Link
            href="/login"
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            Giriş Yap
          </Link>
          
          <Link
            href="/register"
            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            Kayıt Ol
          </Link>
        </div>

      </div>
    </main>
  );
}