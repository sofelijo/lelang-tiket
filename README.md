This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



kalo begitu sekalian update keseluruhan data tiket menyesuaikan flow atau fitur lelang yang akan di update kedepannya, tolong analisa flow yang saya berikan:
1. setelah user membeli tiket, harga akan di generate ulang ke harga baru yang telah disesuaikan dengan fee platform (contoh fee 3%) dan beserta 3 digit kode unik, contohnya dia bayar 1.000.000 dengan kode unik 456, maka jadi 1.000.456
2. lalu user memilih opsi pembayaran antara lain transfer bank (rekening admin) atau qris (akun admin)
3. kirim bukti pembayaran berupa screenshoot
4. admin melakukan verifikasi pembayaran berhasil masuk atau tidak
5. jika berhasil masuk, maka penjual menghubungi pembeli via wa atau email untuk memberikan soft file tiket yang dijual (contoh: coldplay.pdf)
6. uang yang ditransfer oleh pembeli akan ditahan di rekening admin sampai berlangsung, setelah 1 x 24 jam apabila tidak ada complain dari pembeli, maka uang ditransfer ke penjual
7. setelah itu, dana ditransfer oleh admin kepada penjual akkan tetapi jika tiket terbukti tidak valid, dana pembeli akan di refund

catatan: data rekening pembeli atau penjual disimpan pada tabel user, nomor wa penjual diberikan setelah buyer membeli

✅ LANGKAH LENGKAP TAMBAH KOLOM / UBAH schema.prisma DENGAN BENAR
💡 CONTOH: Kita mau tambah kolom statusBayar: Boolean di model Pembayaran.
✅ LANGKAH 1 — Ubah file schema.prisma
Edit prisma/schema.prisma, misalnya:

prisma
Salin
Edit
model Pembayaran {
  id             Int      @id @default(autoincrement())
  // ...
  statusBayar    Boolean? @default(false)  // ← kolom baru
  // ...
}
✅ LANGKAH 2 — Buat migration dari perubahan tadi
bash
Salin
Edit
npx prisma migrate dev --name tambah-kolom-statusbayar
Ini akan:

Mendeteksi perubahan schema

Membuat folder migrations/

Menulis SQL-nya

Update database kamu

Update Prisma Client otomatis

✅ LANGKAH 3 — Generate ulang Prisma Client (opsional)
Kalau kamu pakai --skip-generate sebelumnya, jalankan ini:

bash
Salin
Edit
npx prisma generate
✅ LANGKAH 4 — Commit perubahan kamu ke Git (optional tapi disarankan)
bash
Salin
Edit
git add prisma/schema.prisma prisma/migrations/
git commit -m "Tambah kolom statusBayar di model Pembayaran"
🔐 TIPS ANTI-DRIFT / ANTI-RUSAK:
Hal yang Harus Dilakukan ✅	                Hal yang Harus Dihindari ❌
Selalu pakai migrate dev	             |   Jangan ubah DB langsung (misal via pgAdmin)
Simpan folder prisma/migrations/ di Git	|    Jangan hapus migration lama sembarangan
Gunakan db pull hanya jika kamu edit DB langsung (darurat)	|Jangan jalankan db pull terus-menerus
Buat migration untuk tiap schema change    |	Jangan langsung ubah schema lalu db push tiap saat di tim

Kalau kamu kerja tim:

Pastikan semua orang pull migration terbaru

Jangan ada yang ubah database langsung dari luar Prisma

