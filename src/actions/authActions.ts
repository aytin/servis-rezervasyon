'use server'

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface AdminLoginInput {
  myPhone: string;
  myPassword: string;
}

export async function loginUser(payload: { phone: string; password: string }) {
  const phone = payload.phone?.trim();
  const password = payload.password;

  if (!phone || !password) {
    return { error: "Lütfen tüm alanları doldurun." };
  }

  let targetRedirect = "";

  try {
    // 1. Telefon numarasına göre kullanıcıyı sorgula
    const user = await db.user.findUnique({ where: { phone } });

    if (!user || user.password !== password) {
      return { error: "Telefon numarası veya şifre hatalı." };
    }

    const cookieStore = await cookies();

    // 2. Genel oturum çerezini yaz
    cookieStore.set("session", JSON.stringify({
      id: user.id,
      role: user.role,
      phone: user.phone,
      name: user.name || ""
    }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 Gün
    });

    // 3. Middleware'in kolay okuması için rol çerezi
    cookieStore.set("user_role", user.role, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // 4. Role göre dinamik yönlendirme hedefini belirle
    switch (user.role) {
      case "ADMIN":
        targetRedirect = "/admin";
        break;

      case "DRIVER": // Veritabanındaki 'SOFOR' veya 'DRIVER' karşılığı
        targetRedirect = "/sofor";
        break;

      case "USER": // Normal müşteri/kullanıcı
      default:
        targetRedirect = "/musteri";
        break;
    }

  } catch (error) {
    console.error("Giriş hatası:", error);
    return { error: "Sisteme giriş yapılırken bir hata oluştu." };
  }

  // 🚨 try-catch dışında yönlendirmeyi tetikliyoruz
  if (targetRedirect) {
    redirect(targetRedirect);
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete("user_role");
  redirect("/login");
}

// Admin Giriş Action'ı
export async function loginAdmin({ myPhone, myPassword }: AdminLoginInput) {
  try {
    if (!myPhone || !myPassword) {
      return { error: "Lütfen telefon numarası ve şifrenizi girin." };
    }

    // Telefon numarasına göre kullanıcıyı bul
    const user = await db.user.findUnique({
      where: { phone: myPhone },
    });

    // Kullanıcı yoksa veya rolü ADMIN değilse
    if (!user || user.role !== "ADMIN") {
      return { error: "Yetkisiz erişim veya hatalı telefon numarası." };
    }

    // Şifre kontrolü (eğer veritabanında password alanı varsa)
    if (user.password && user.password !== myPassword) {
      return { error: "Hatalı şifre girdiniz." };
    }

    // Oturum Cookie'sini ayarla
    const cookieStore = await cookies();
    cookieStore.set(
      "session",
      JSON.stringify({ id: user.id, name: user.name, role: user.role }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Admin giriş hatası:", error);
    return { error: "Giriş yapılırken bir sunucu hatası oluştu." };
  }
}