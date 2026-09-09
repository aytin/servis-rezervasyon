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