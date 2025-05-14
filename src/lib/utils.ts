import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function parseAngkaRibuan(input: string) {
  const clean = input.replace(/\D/g, ""); // hapus non-digit
  const angka = parseInt(clean || "0", 10);
  const ribuan = Math.round(angka / 1000) * 1000; // dibulatkan ke ribuan
  return ribuan;
}
