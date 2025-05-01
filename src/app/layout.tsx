import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/lainnya/NavbarServer";
import SessionProviderClient from "@/app/components/lainnya/SessionProviderClient"; // 👈 tambahkan ini
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lelang",
  description: "Website Lelang Pertama",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-gray-900 text-white min-h-screen`}
      >
        <SessionProviderClient>
          <Navbar />
          <main className="p-4 max-w-5xl mx-auto">{children}</main>
        </SessionProviderClient>
        <Toaster />
      </body>
    </html>
  );
}
