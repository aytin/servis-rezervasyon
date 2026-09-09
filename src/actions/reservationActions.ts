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
    };

// 1. Yeni Rezervasyon Oluştur (Hem FormData hem Object Destekli)
export async function createReservation(input: CreateReservationInput) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return { error: "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın." };
    }

    const session = JSON.parse(sessionCookie);

    let pickup = "";
    let dateStr = "";
    let passengers = 1;

    // Eğer FormData geldiyse
    if (input instanceof FormData) {
      pickup = (input.get("pickup") || input.get("stopId")) as string;
      dateStr = input.get("date") as string;
      passengers = parseInt(input.get("passengers") as string) || 1;
    } 
    // Eğer Obje ({ date, stopId, pickup }) geldiyse
    else if (typeof input === "object" && input !== null) {
      pickup = input.pickup || input.stopId || "";
      dateStr = input.date instanceof Date ? input.date.toISOString() : (input.date || "");
      passengers = input.passengers || 1;
    }

    if (!pickup || !dateStr) {
      return { error: "Lütfen biniş noktası ve tarih seçin." };
    }

    await db.reservation.create({
      data: {
        userId: session.id,
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

// 3. Sorgula Sayfası İçin Kullanıcı Rezervasyonlarını Getir (Telefon Numarası veya Oturum Bazlı)
export async function getUserReservations(phone?: string) {
  try {
    let reservations = [];

    // Eğer telefon numarası ile sorgulanıyorsa
    if (phone) {
      const user = await db.user.findUnique({
        where: { phone },
        include: {
          reservations: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
      reservations = user?.reservations || [];
    } else {
      // Telefon gönderilmediyse mevcut oturumun rezervasyonlarını getir
      reservations = await getMyReservations();
    }

    return { success: true, data: reservations, error: null };
  } catch (error) {
    console.error("Rezervasyon sorgulama hatası:", error);
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