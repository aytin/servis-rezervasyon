'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/actions/reservationActions";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await registerUser(formData);

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      router.push('/musteri'); // Kayıt sonrası müşteri paneline yönlendir
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border shadow-sm space-y-6">
        
        <div>
          <h1 className="text-2xl font-bold text-center text-gray-900">Hesap Oluştur</h1>
          <p className="text-sm text-center text-gray-600 mt-1">Servis rezervasyonları için kayıt olun.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
            <input
              type="text"
              name="name"
              required
              disabled={loading}
              className="w-full p-3 border rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
              placeholder="Ahmet Yılmaz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
            <input
              type="tel"
              name="phone"
              required
              disabled={loading}
              className="w-full p-3 border rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
              placeholder="05551234567"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:bg-blue-400"
          >
            {loading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Giriş Yap
          </Link>
        </div>

      </div>
    </div>
  );
}