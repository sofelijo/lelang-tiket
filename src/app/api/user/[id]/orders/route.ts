import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const status = req.nextUrl.searchParams.get("status");

    if (!userId || !status) {
      return new Response(JSON.stringify({ message: "Invalid request" }), { status: 400 });
    }

    const pembayaran = await prisma.pembayaran.findMany({
      where: {
        buyerId: userId,
        statusPembayaran: status.toUpperCase() as any, // PENDING, DIPROSES, BERHASIL, GAGAL
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        ticket: {
          include: {
            konser: true,
            kategori: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(pembayaran), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
    });
  }
}
