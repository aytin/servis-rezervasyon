'use server'

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Giriş kontrolü yapan fonksiyon
export async function loginAdmin(formData: FormData) {
  const password = formData.get("password") as string;
  const correctPassword = process.env.ADMIN_PASSWORD;

  if (password === correctPassword) {
    // Şifre doğruysa tarayıcıya güvenli, dışarıdan JavaScript ile çalınamaz bir cookie bırakıyoruz
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "true", {
      httpOnly: true, // Tarayıcıdaki zararlı JS kodları bu çereze erişemez
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2, // 2 Saat boyunca girişli kalır
      path: "/",
    });

    // Giriş başarılı olunca admin paneline yönlendir
    redirect("/admin");
  } else {
    return { error: "Hatalı yönetici şifresi girdiniz!" };
  }
}

// Çıkış yapma fonksiyonu
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}