import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const userId = Number(context.params.id);
  const session = await getServerSession(authOptions);

  if (!session || Number(session.user.id) !== userId) {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wilayah: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error get user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const userId = Number(context.params.id);
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (Number(session.user.id) !== userId && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const wilayahKode = formData.get("kelurahanId") as string; // wilayahId = kode
    const imageFile = formData.get("image") as File | null;

    // Validasi kode wilayah
    const wilayah = await prisma.wilayah.findUnique({
      where: { kode: wilayahKode },
    });

    if (!wilayah) {
      return NextResponse.json({ error: "Wilayah tidak valid" }, { status: 400 });
    }

    let imageUrl: string | undefined;

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const filename = `${uuidv4()}-${imageFile.name}`;
      const uploadPath = path.join(process.cwd(), "public/uploads", filename);
      await writeFile(uploadPath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phoneNumber,
        wilayahId: wilayahKode,
        ...(imageUrl && { image: imageUrl }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PATCH /api/user/[id] error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
