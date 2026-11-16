'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type ReservationStatusType = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

// 1. Tüm Müşteri Taleplerini Müşteri Bilgileriyle Birlikte Getir
export async function getAllReservations() {
  try {
    const reservations = await db.reservation.findMany({
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return reservations;
  } catch (error) {
    console.error("Tüm rezervasyonları getirme hatası:", error);
    return [];
  }
}

// 2. Rezervasyon Durumunu Güncelle (Onayla / İptal / Tamamla)
export async function updateReservationStatus(reservationId: string, status: ReservationStatusType) {
  try {
    await db.reservation.update({
      where: { id: reservationId },
      data: { status },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Durum güncelleme hatası:", error);
    return { error: "Rezervasyon durumu güncellenirken bir hata oluştu." };
  }
}

// 3. Tüm Aktif Servis Saatlerini Getir (Hem Admin Hem Müşteri Kullanabilir)
export async function getServiceTimes() {
  try {
    const times = await db.serviceTime.findMany({
      where: { isActive: true },
      orderBy: { time: "asc" }, // Saatleri kronolojik sıraya dizer (08:00, 09:30 vb.)
    });
    return times;
  } catch (error) {
    console.error("Servis saatleri getirme hatası:", error);
    return [];
  }
}

// 4. Yeni Servis Saati Ekleme (Admin)
export async function addServiceTime(formData: FormData) {
  try {
    const time = formData.get("time") as string;

    if (!time || !time.trim()) {
      return { error: "Lütfen geçerli bir saat girin (Örn: 08:30)." };
    }

    const formattedTime = time.trim();

    // Aynı saatin daha önce eklenip eklenmediğini kontrol et
    const existing = await db.serviceTime.findFirst({
      where: { time: formattedTime },
    });

    if (existing) {
      return { error: "Bu saat zaten sistemde kayıtlı." };
    }

    await db.serviceTime.create({
      data: {
        time: formattedTime,
        isActive: true,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/musteri");
    return { success: true };
  } catch (error) {
    console.error("Saat ekleme hatası:", error);
    return { error: "Saat eklenirken bir sunucu hatası oluştu." };
  }
}

// 5. Servis Saatini Silme (Admin)
export async function deleteServiceTime(id: string) {
  try {
    await db.serviceTime.delete({
      where: { id },
    });

    revalidatePath("/admin");
    revalidatePath("/musteri");
    return { success: true };
  } catch (error) {
    console.error("Saat silme hatası:", error);
    return { error: "Saat silinirken bir hata oluştu." };
  }
}