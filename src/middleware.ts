import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  console.log("🛡️ Middleware dijalankan:", pathname);

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log("🔐 Token ditemukan:", !!token);

  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  const protectedRoutes = [
    "/profil",
    "/tambah-tiket",
    "/pembayaran",
    "/bayar",
    "/admin",
  ];

  const isProtected = protectedRoutes.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtected && !token) {
    console.log("🚫 Belum login, redirect ke /login");
    return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  }

  if (isAdminRoute && token?.role !== "ADMIN") {
    console.log("⛔ Bukan admin, redirect ke /unauthorized");
    return NextResponse.redirect(new URL("/unauthorized", req.url), {
      status: 303,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/.*\\.ts).*)",
  ],
};
