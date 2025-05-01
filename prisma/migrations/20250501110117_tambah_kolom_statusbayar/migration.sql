/*
  Warnings:

  - You are about to drop the column `order_id` on the `Pembayaran` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pembayaran" DROP COLUMN "order_id",
ADD COLUMN     "rder_id" TEXT;
