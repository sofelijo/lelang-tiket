import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface UserWithWilayah {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  isVerified: boolean;
  role: string;
  username: string;
  bio: string | null;
  image: string | null;
  wilayahId: string;
  provinsi: string | null;
  kota: string | null;
  kecamatan: string | null;
  kelurahan: string | null;
}


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
  
    if (!session || Number(session.user.id) !== Number(params.id)) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    }
  
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(params.id) },
        include: {
          // relasi-relasi, kalau mau tambahkan
          wilayah: true, // kalau user ada relasi wilayah
        },
      });
  
      if (!user) {
        const response = NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
        response.headers.set("Access-Control-Allow-Origin", "*");
        return response;
      }
  
      const response = NextResponse.json(user);
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    } catch (error) {
      console.error("Error get user:", error);
      const response = NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    }
  }

  export async function PATCH(
    req: NextRequest,
    context: { params: { id: string } }
  ) {
    const userId = Number(context.params.id); // ✅ pakai context.params
  
    const session = await getServerSession(authOptions);

  if (
    !session ||
    (Number(session.user.id) !== userId && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const data = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        username: data.username,
        bio: data.bio,
        image: data.image,
        wilayahId: data.wilayahId,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof Error) {
      console.error("PATCH /api/user/[id] error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
