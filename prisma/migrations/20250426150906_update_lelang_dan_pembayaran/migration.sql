-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('PENDING', 'DIPROSES', 'BERHASIL', 'GAGAL', 'REFUND');

-- CreateEnum
CREATE TYPE "MetodePembayaran" AS ENUM ('TRANSFER', 'QRIS');

-- AlterEnum
ALTER TYPE "PerpanjanganBid" ADD VALUE 'TANPA';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rekeningBank" TEXT;

-- CreateTable
CREATE TABLE "Pembayaran" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "metodePembayaran" "MetodePembayaran" NOT NULL,
    "jumlahTotal" INTEGER NOT NULL,
    "kodeUnik" INTEGER NOT NULL,
    "feePlatform" INTEGER NOT NULL,
    "buktiPembayaran" TEXT,
    "statusPembayaran" "StatusPembayaran" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pembayaran_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
