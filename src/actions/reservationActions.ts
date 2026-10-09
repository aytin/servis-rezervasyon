'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const VALID_STOPS = ["Arı-su", "Kuş cenneti", "Okul", "Kapı"];

// Esnek Giriş Tipi Tanımı
type CreateReservationInput =
  | FormData
  | {
      date?: string | Date;
      pickup?: string;
      stopId?: string;
      passengers?: number;
      phone?: string;
    };

// 1. Yeni Rezervasyon Oluştur (Oturum VEYA Telefon İle Esnek Kayıt)
export async function createReservation(input: CreateReservationInput) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    let userId = "";
    let phone = "";
    let pickup = "";
    let dateStr = "";
    let passengers = 1;

    // A) FormData ile geldiyse
    if (input instanceof FormData) {
      pickup = (input.get("pickup") || input.get("stopId")) as string;
      dateStr = input.get("date") as string;
      phone = (input.get("phone") as string) || "";
      passengers = parseInt(input.get("passengers") as string) || 1;
    } 
    // B) Obje ile geldiyse
    else if (typeof input === "object" && input !== null) {
      pickup = input.pickup || input.stopId || "";
      dateStr = input.date instanceof Date ? input.date.toISOString() : (input.date || "");
      phone = input.phone || "";
      passengers = input.passengers || 1;
    }

    if (!pickup || !dateStr) {
      return { error: "Lütfen biniş noktası ve tarih seçin." };
    }

    // 1. Durum: Oturum açık ise oturumdaki kullanıcıyı al
    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie);
        userId = session.id;
      } catch (e) {
        console.error("Session parse hatası:", e);
      }
    }

    // 2. Durum: Oturum yoksa ama telefon girildiyse kullanıcıyı veritabanında bul/oluştur
    if (!userId && phone) {
      let user = await db.user.findUnique({ where: { phone: phone.trim() } });
      if (!user) {
        user = await db.user.create({
          data: {
            phone: phone.trim(),
            name: `Müşteri (${phone.slice(-4)})`,
            role: "USER",
          },
        });
      }
      userId = user.id;

      // Sorgula sayfasında otomatik hatırlamak için çereze telefon numarasını yaz
      cookieStore.set("user_phone", phone.trim(), { path: "/", httpOnly: true });
    }

    if (!userId) {
      return { error: "Rezervasyon yapmak için lütfen telefon numaranızı girin veya giriş yapın." };
    }

    // Rezervasyonu Veritabanına Ekle
    await db.reservation.create({
      data: {
        userId: userId,
        pickup,
        date: new Date(dateStr),
        passengers,
        status: "PENDING",
      },
    });

    revalidatePath("/musteri");
    revalidatePath("/sorgula");
    return { success: true };
  } catch (error) {
    console.error("Rezervasyon oluşturma hatası:", error);
    return { error: "Rezervasyon oluşturulurken bir hata oluştu." };
  }
}

// 2. Oturum Açan Müşterinin Rezervasyonlarını Getir
export async function getMyReservations() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) return [];

    const session = JSON.parse(sessionCookie);

    const reservations = await db.reservation.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });

    return reservations;
  } catch (error) {
    console.error("Rezervasyonları getirme hatası:", error);
    return [];
  }
}

// 3. Sorgula Sayfası İçin Rezervasyonları Getir (Parametre, Çerez veya Oturum Bazlı)
export async function getUserReservations(phoneInput?: string) {
  try {
    const cookieStore = await cookies();
    const savedPhone = cookieStore.get("user_phone")?.value;
    const phoneToSearch = phoneInput || savedPhone;

    let reservations: any[] = [];

    // A) Telefon numarası varsa (Arama kutusundan veya çerezden)
    if (phoneToSearch && phoneToSearch.trim() !== "") {
      const user = await db.user.findUnique({
        where: { phone: phoneToSearch.trim() },
        include: {
          reservations: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
      reservations = user?.reservations || [];
    } else {
      // B) Telefon yoksa oturum çerezine bak
      reservations = await getMyReservations();
    }

    // [KRİTİK DÜZELTME]: Client Component'e gönderilen Date objelerini metne dönüştürerek çökmesini engelliyoruz
    const safeReservations = JSON.parse(JSON.stringify(reservations));

    return { success: true, data: safeReservations, error: null };
  } catch (error) {
    console.error("getUserReservations hatası:", error);
    return { 
      success: false, 
      data: [], 
      error: "Rezervasyonlar yüklenirken bir sunucu hatası oluştu." 
    };
  }
}

// 4. Müşterinin Rezervasyonunu İptal Etmesi
export async function cancelReservation(reservationId: string) {
  try {
    await db.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/sorgula");
    revalidatePath("/musteri");
    return { success: true };
  } catch (error) {
    console.error("Rezervasyon iptal hatası:", error);
    return { error: "İptal işlemi gerçekleştirilemedi." };
  }
}

// Form etiketlerinin (action) doğrudan çağırabilmesi için void dönen wrapper
export async function createReservationFormAction(formData: FormData) {
  await createReservation(formData);
}