/*
  Warnings:

  - You are about to drop the column `metodePembayaran` on the `Pembayaran` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Pembayaran" DROP CONSTRAINT "Pembayaran_metodePembayaranManualId_fkey";

-- AlterTable
ALTER TABLE "Pembayaran" DROP COLUMN "metodePembayaran",
ADD COLUMN     "feeMetode" INTEGER,
ADD COLUMN     "metode" TEXT;
