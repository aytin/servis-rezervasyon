'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. Veritabanına yeni durak ekleyen fonksiyon
export async function addStop(formData: FormData) {
  const name = formData.get("name") as string;
  const time = formData.get("time") as string;
  const capacity = parseInt(formData.get("capacity") as string, 10);

  if (!name || !time || !capacity) return;

  // Prisma ile MongoDB'ye kaydet
  await db.stop.create({
    data: { name, time, capacity },
  });

  // Sayfadaki verilerin anında güncellenmesi için Next.js'e sayfayı yeniletiyoruz
  revalidatePath("/admin/duraklar");
}

// 2. Veritabanındaki tüm durakları getiren fonksiyon
export async function getStops() {
  return await db.stop.findMany();
}