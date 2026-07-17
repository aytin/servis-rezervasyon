'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface ReservationInput {
  stopId: string;
  date: string;
}

export async function createReservation(data: ReservationInput) {
  const { stopId, date } = data;

  if (!stopId || !date) {
    return { error: "Lütfen tüm alanları doldurun." };
  }

  try {
    // Test için sabit bir kullanıcı ID'si (Bunu kendi veritabanınızdan bir ID ile değiştirin)
    const currentUserId = "6a187d2344db5bc7f2e36caa"; 

    // 1. Mükerrer kayıt kontrolü
    const existing = await db.reservation.findFirst({
      where: { 
        userId: currentUserId, 
        date: date, 
        stopId: stopId 
      }
    });

    if (existing) {
      return { error: "Bu tarih ve durak için zaten bir rezervasyonunuz bulunuyor." };
    }

    // 2. Rezervasyonu Oluşturma (Kırmızı vurguyu bitiren connect yapısı)
    const newReservation = await db.reservation.create({
      data: {
        date: date, // Şemanızda adı farklıysa (örn: travelDate) burayı ona göre değiştirin
        user: {
          connect: { id: currentUserId } // userId'yi doğrudan yazmak yerine User'a bağlıyoruz
        },
        stop: {
          connect: { id: stopId } // stopId'yi doğrudan yazmak yerine Stop'a bağlıyoruz
        }
      },
    });

    revalidatePath("/");
    return { success: true, reservation: newReservation };
    
  } catch (error) {
    console.error("Rezervasyon detaylı hata çıktısı:", error);
    return { error: "Veritabanına kaydedilirken bir hata oluştu." };
  }
}

// 1. Giriş yapan kullanıcının tüm rezervasyonlarını durak bilgileriyle birlikte getirir
export async function getUserReservations() {
  // Test için kullandığımız sabit kullanıcı ID'si (Login sistemi bağlanınca session'dan alınacak)
  const currentUserId = "6a187d2344db5bc7f2e36caa"; 

  try {
    const reservations = await db.reservation.findMany({
      where: { userId: currentUserId },
      include: {
        stop: true // Rezervasyonun hangi durağa ait olduğunu (isim, saat) görebilmek için ilişkili tabloyu çekiyoruz
      },
      orderBy: {
        date: "asc" // Tarihe göre yakından uzağa sırala
      }
    });
    return { success: true, data: reservations };
  } catch (error) {
    console.error("Rezervasyon getirme hatası:", error);
    return { error: "Rezervasyonlarınız yüklenirken bir hata oluştu." };
  }
}

// 2. Rezervasyonu iptal eder (siler)
export async function cancelReservation(reservationId: string) {
  try {
    await db.reservation.delete({
      where: { id: reservationId }
    });
    
    // Sayfanın anlık olarak güncellenmesi ve silinen kaydın listeden düşmesi için
    revalidatePath("/sorgula");
    return { success: true };
  } catch (error) {
    console.error("Rezervasyon iptal hatası:", error);
    return { error: "Rezervasyon iptal edilirken bir hata oluştu." };
  }
}