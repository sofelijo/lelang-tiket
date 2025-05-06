/*
  Warnings:

  - You are about to drop the column `metode` on the `Pembayaran` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pembayaran" DROP COLUMN "metode",
ADD COLUMN     "snapMethod" TEXT;
