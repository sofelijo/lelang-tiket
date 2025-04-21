/*
  Warnings:

  - You are about to drop the column `artist` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `deadline` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `venue` on the `Ticket` table. All the data in the column will be lost.
  - Added the required column `batas_waktu` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `harga_awal` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kategoriId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `konserId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipeTempat` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "artist",
DROP COLUMN "date",
DROP COLUMN "deadline",
DROP COLUMN "price",
DROP COLUMN "venue",
ADD COLUMN     "batas_waktu" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "harga_awal" INTEGER NOT NULL,
ADD COLUMN     "kategoriId" INTEGER NOT NULL,
ADD COLUMN     "konserId" INTEGER NOT NULL,
ADD COLUMN     "seat" TEXT,
ADD COLUMN     "tipeTempat" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Konser" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "lokasi" TEXT NOT NULL,

    CONSTRAINT "Konser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kategori" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "konserId" INTEGER NOT NULL,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Kategori" ADD CONSTRAINT "Kategori_konserId_fkey" FOREIGN KEY ("konserId") REFERENCES "Konser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_konserId_fkey" FOREIGN KEY ("konserId") REFERENCES "Konser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
