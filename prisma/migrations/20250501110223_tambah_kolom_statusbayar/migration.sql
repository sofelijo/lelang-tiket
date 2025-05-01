/*
  Warnings:

  - You are about to drop the column `externalId` on the `Pembayaran` table. All the data in the column will be lost.
  - You are about to drop the column `rder_id` on the `Pembayaran` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pembayaran" DROP COLUMN "externalId",
DROP COLUMN "rder_id",
ADD COLUMN     "order_id" TEXT;
