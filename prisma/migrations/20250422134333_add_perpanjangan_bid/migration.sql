/*
  Warnings:

  - Added the required column `harga_beli` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kelipatan` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PerpanjanganBid" AS ENUM ('DUA_HARI', 'SATU_HARI');

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_userId_fkey";

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "deskripsi" TEXT,
ADD COLUMN     "harga_beli" INTEGER NOT NULL,
ADD COLUMN     "kelipatan" INTEGER NOT NULL,
ADD COLUMN     "perpanjangan_bid" "PerpanjanganBid",
ALTER COLUMN "seat" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
