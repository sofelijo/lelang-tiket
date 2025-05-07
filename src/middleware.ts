// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  console.log("🛡️ Middleware aktif untuk:", pathname);
  console.log("🔐 Token ditemukan:", !!token);

  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // Jika mengakses route yang butuh login
  const protectedPaths = ["/profil", "/tambah-tiket", "/pembayaran", "/admin", "/bayar"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !token) {
    console.log("🚫 Tidak login. Arahkan ke /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Jika route admin, pastikan role adalah ADMIN
  if (isAdminRoute) {
    if (!token || token.role !== "ADMIN") {
      console.log("🚷 Akses admin ditolak. Role:", token?.role);
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Perhatikan: harus eksplisit menyertakan api/admin
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
