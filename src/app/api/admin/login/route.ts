// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi!" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Akun tidak ditemukan atau bukan admin." }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password || "");

  if (!isMatch) {
    return NextResponse.json({ error: "Password salah." }, { status: 401 });
  }

  // Simpel: kita simpan token di cookie
  const token = sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  const res = NextResponse.json({ message: "Login berhasil" });
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60,
  });

  return res;
}
