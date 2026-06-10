'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createReservation(formData: FormData) {
  const phone = formData.get("phone") as string; // email -> phone oldu
  const stopId = formData.get("stopId") as string;
  const date = formData.get("date") as string;

  if (!phone || !stopId || !date) {
    return { error: "Lütfen tüm alanları doldurun." };
  }

  try {
    // 1. Kullanıcıyı telefon numarasına göre bul veya yoksa yeni oluştur
    let user = await db.user.findUnique({ where: { phone } });
    if (!user) {
      user = await db.user.create({
        data: { 
          phone, 
          name: `Yolcu-${phone.slice(-4)}` // İsim yerine geçici olarak telefonun son 4 hanesini yazıyoruz
        }
      });
    }

    // 2. Seçilen durağın bilgilerini ve kapasitesini çek
    const stop = await db.stop.findUnique({ where: { id: stopId } });
    if (!stop) return { error: "Seçilen durak bulunamadı." };

    // 3. O gün ve o durak için toplam kaç rezervasyon yapılmış say
    const currentReservationsCount = await db.reservation.count({
      where: { stopId: stopId, date: date }
    });

    // 4. Kontenjan kontrolü yap
    if (currentReservationsCount >= stop.capacity) {
      return { error: "Maalesef bu durak için kontenjan dolmuştur!" };
    }

    // 5. Her şey yolundaysa rezervasyonu kaydet
    await db.reservation.create({
      data: {
        userId: user.id,
        stopId: stop.id,
        date: date
      }
    });

    revalidatePath("/");
    return { success: "Rezervasyonunuz başarıyla oluşturuldu!" };

  } catch (error) {
    console.error(error);
    return { error: "Sistemde bir hata oluştu, lütfen tekrar deneyin." };
  }
}

// Veritabanındaki tüm rezervasyonları detaylarıyla getiren fonksiyon
export async function getReservations() {
  return await db.reservation.findMany({
    include: {
      user: true, // Kullanıcı bilgilerini (telefon vb.) dahil et
      stop: true, // Durak bilgilerini (isim, saat vb.) dahil et
    },
    orderBy: {
      createdAt: "desc", // En yeni rezervasyon en üstte görünsün
    },
  });
}

// Telefon numarasına göre kullanıcının rezervasyonlarını getiren fonksiyon
export async function getReservationsByPhone(phone: string) {
  if (!phone) return { error: "Lütfen bir telefon numarası girin." };

  try {
    // Telefon numarasına ait kullanıcıyı ve onun rezervasyonlarını (durak bilgileriyle) bul
    const userWithReservations = await db.user.findUnique({
      where: { phone },
      include: {
        reservations: {
          include: {
            stop: true,
          },
          orderBy: {
            date: "desc", // En yakın/en yeni tarihli rezervasyon üstte görünsün
          },
        },
      },
    });

    if (!userWithReservations || userWithReservations.reservations.length === 0) {
      return { error: "Bu telefon numarasına ait aktif bir rezervasyon bulunamadı." };
    }

    // Rezervasyon listesini başarıyla döndür
    return { success: true, reservations: userWithReservations.reservations };

  } catch (error) {
    console.error(error);
    return { error: "Sorgulama yapılırken bir hata oluştu." };
  }
}

// Rezervasyonu ID'sine göre silen fonksiyon
export async function cancelReservation(reservationId: string) {
  if (!reservationId) return { error: "Geçersiz işlem." };

  try {
    await db.reservation.delete({
      where: { id: reservationId },
    });

    return { success: "Rezervasyonunuz başarıyla iptal edildi." };
  } catch (error) {
    console.error(error);
    return { error: "İptal işlemi gerçekleştirilirken bir hata oluştu." };
  }
}