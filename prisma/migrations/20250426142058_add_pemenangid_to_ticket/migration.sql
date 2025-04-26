/*
  Warnings:

  - You are about to drop the column `kotaId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `provinsiId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Kota` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Provinsi` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Kota" DROP CONSTRAINT "Kota_provinsiId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_kotaId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_provinsiId_fkey";

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "pemenangId" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "kotaId",
DROP COLUMN "provinsiId",
ADD COLUMN     "wilayahId" TEXT;

-- DropTable
DROP TABLE "Kota";

-- DropTable
DROP TABLE "Provinsi";

-- CreateTable
CREATE TABLE "wilayah" (
    "kode" VARCHAR(10) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,

    CONSTRAINT "wilayah_pkey" PRIMARY KEY ("kode")
);

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_pemenangId_fkey" FOREIGN KEY ("pemenangId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "wilayah"("kode") ON DELETE SET NULL ON UPDATE CASCADE;
