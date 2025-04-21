/*
  Warnings:

  - You are about to drop the column `konserId` on the `Kategori` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Ticket` table. All the data in the column will be lost.
  - Made the column `seat` on table `Ticket` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Kategori" DROP CONSTRAINT "Kategori_konserId_fkey";

-- AlterTable
ALTER TABLE "Kategori" DROP COLUMN "konserId";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "createdAt",
ALTER COLUMN "seat" SET NOT NULL;

-- CreateTable
CREATE TABLE "KonserKategori" (
    "id" SERIAL NOT NULL,
    "konserId" INTEGER NOT NULL,
    "kategoriId" INTEGER NOT NULL,

    CONSTRAINT "KonserKategori_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KonserKategori_konserId_kategoriId_key" ON "KonserKategori"("konserId", "kategoriId");

-- AddForeignKey
ALTER TABLE "KonserKategori" ADD CONSTRAINT "KonserKategori_konserId_fkey" FOREIGN KEY ("konserId") REFERENCES "Konser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KonserKategori" ADD CONSTRAINT "KonserKategori_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
