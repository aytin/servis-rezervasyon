'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Günün Onaylanan ve Tamamlanan Yolcu Listesini Getir
export async function getTodayDriverReservations() {
  try {
    const today = new Date();
    
    // Bugünkü tarihin başlangıcı (00:00:00) ve bitişi (23:59:59)
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const reservations = await db.reservation.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["CONFIRMED", "COMPLETED"], // Sadece yöneticinin onayladığı veya tamamlananlar
        },
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        pickup: "asc",
      },
    });

    return reservations;
  } catch (error) {
    console.error("Şoför verileri çekme hatası:", error);
    return [];
  }
}

// Yolcuyu Tamamlandı (Bindi) Olarak İşaretle
export async function markAsCompleted(reservationId: string) {
  try {
    await db.reservation.update({
      where: { id: reservationId },
      data: { status: "COMPLETED" },
    });

    revalidatePath("/sofor");
    return { success: true };
  } catch (error) {
    console.error("Durum güncelleme hatası:", error);
    return { error: "İşlem sırasında bir hata oluştu." };
  }
}