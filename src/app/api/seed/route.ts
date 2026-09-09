import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Önce ilişkili rezervasyonları temizle
    await db.reservation.deleteMany();

    // 2. Sonra kullanıcıları temizle
    await db.user.deleteMany();

    // 3. Test kullanıcılarını yeniden oluştur
    await db.user.createMany({
      data: [
        { phone: "05551111111", password: "123", role: "USER", name: "Ahmet Müşteri" },
        { phone: "05552222222", password: "123", role: "DRIVER", name: "Mehmet Şoför" },
        { phone: "05553333333", password: "123", role: "ADMIN", name: "Ali Yönetici" },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Veritabanı sıfırlandı ve 3 test kullanıcısı başarıyla oluşturuldu!",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}