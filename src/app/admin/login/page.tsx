'use client'

import { useState } from "react";
import { loginAdmin } from "@/actions/authActions";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await loginAdmin(formData);
    
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Yönetici Girişi</h2>
        <p className="mt-2 text-sm text-gray-600">Yönetim paneline erişmek için lütfen şifrenizi girin.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Yönetici Şifresi</label>
              <input
                type="password"
                name="password"
                required
                disabled={loading}
                className="mt-1 block w-full p-3 border rounded-lg text-black bg-white focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                placeholder="••••••••"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition disabled:bg-gray-400"
              >
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}