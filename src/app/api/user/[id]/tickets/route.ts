import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    const status = req.nextUrl.searchParams.get("status");

    if (!userId || !status) {
      return new Response(JSON.stringify({ message: "Invalid request" }), {
        status: 400,
      });
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        userId: userId,
        statusLelang: status.toUpperCase() as any, // BOOKED | PENDING | BERLANGSUNG | SELESAI
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        konser: true,
        kategori: true,
      },
    });

    return new Response(JSON.stringify(tickets), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
    });
  }
}
