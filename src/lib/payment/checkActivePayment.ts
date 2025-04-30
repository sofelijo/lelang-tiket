import { prisma } from "@/lib/prisma";
import { StatusPembayaran } from "@prisma/client";

/**
 * Cek apakah ada transaksi pembayaran yang masih aktif untuk ticket tertentu dan buyer tertentu.
 */
export async function getActivePayment(ticketId: number, buyerId: number) {
  const now = new Date();

  const existingPayment = await prisma.pembayaran.findFirst({
    where: {
      ticketId,
      buyerId,
      statusPembayaran: StatusPembayaran.PENDING,
      qrisExpiredAt: {
        gt: now, // belum expired
      },
    },
    orderBy: {
      createdAt: "desc", // ambil yang terbaru
    },
  });

  return existingPayment;
}
