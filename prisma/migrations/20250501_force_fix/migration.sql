-- CreateEnum
CREATE TYPE "StatusLelang" AS ENUM ('PENDING', 'BERLANGSUNG', 'SELESAI');

-- CreateEnum
CREATE TYPE "PerpanjanganBid" AS ENUM ('TANPA', 'DUA_HARI', 'SATU_HARI');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('PENDING', 'DIPROSES', 'BERHASIL', 'GAGAL', 'REFUND');

-- CreateEnum
CREATE TYPE "MetodePembayaran" AS ENUM ('TRANSFER', 'QRIS_DINAMIS');

-- CreateTable
CREATE TABLE "wilayah" (
    "kode" VARCHAR(13) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,

    CONSTRAINT "wilayah_pkey" PRIMARY KEY ("kode")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "phoneNumber" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "username" TEXT NOT NULL,
    "image" TEXT,
    "bio" TEXT,
    "namaBank" TEXT,
    "rekeningBank" TEXT,
    "wilayahId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Konser" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,

    CONSTRAINT "Konser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kategori" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "seat" TEXT,
    "tipeTempat" TEXT NOT NULL,
    "harga_awal" INTEGER NOT NULL,
    "harga_beli" INTEGER,
    "kelipatan" INTEGER,
    "batas_waktu" TIMESTAMP(3) NOT NULL,
    "deskripsi" TEXT,
    "perpanjangan_bid" "PerpanjanganBid",
    "userId" INTEGER,
    "konserId" INTEGER NOT NULL,
    "kategoriId" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL DEFAULT 1,
    "statusLelang" "StatusLelang" NOT NULL DEFAULT 'BERLANGSUNG',
    "sebelahan" BOOLEAN,
    "pemenangId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pembayaran" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "metodePembayaran" "MetodePembayaran" NOT NULL,
    "jumlahTotal" INTEGER NOT NULL,
    "kodeUnik" INTEGER,
    "feePlatform" INTEGER NOT NULL,
    "statusPembayaran" "StatusPembayaran" NOT NULL DEFAULT 'PENDING',
    "tanggalTransferKePenjual" TIMESTAMP(3),
    "metodePembayaranManualId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "buktiPembayaran" TEXT,
    "externalId" TEXT,
    "qrisExpiredAt" TIMESTAMP(3),
    "qrisInvoiceId" TEXT,

    CONSTRAINT "Pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KonserKategori" (
    "id" SERIAL NOT NULL,
    "konserId" INTEGER NOT NULL,
    "kategoriId" INTEGER NOT NULL,

    CONSTRAINT "KonserKategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "konserId" INTEGER,
    "ticketId" INTEGER,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetodePembayaranManual" (
    "id" SERIAL NOT NULL,
    "rekening" TEXT,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "image" TEXT,
    "nama" TEXT NOT NULL,

    CONSTRAINT "MetodePembayaranManual_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Pembayaran_ticketId_buyerId_idx" ON "Pembayaran"("ticketId", "buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "KonserKategori_konserId_kategoriId_key" ON "KonserKategori"("konserId", "kategoriId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "wilayah"("kode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_konserId_fkey" FOREIGN KEY ("konserId") REFERENCES "Konser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_pemenangId_fkey" FOREIGN KEY ("pemenangId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_metodePembayaranManualId_fkey" FOREIGN KEY ("metodePembayaranManualId") REFERENCES "MetodePembayaranManual"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KonserKategori" ADD CONSTRAINT "KonserKategori_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KonserKategori" ADD CONSTRAINT "KonserKategori_konserId_fkey" FOREIGN KEY ("konserId") REFERENCES "Konser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_konserId_fkey" FOREIGN KEY ("konserId") REFERENCES "Konser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

