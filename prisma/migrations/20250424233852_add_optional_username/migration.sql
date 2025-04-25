/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "kotaId" INTEGER,
ADD COLUMN     "username" TEXT;

-- CreateTable
CREATE TABLE "Provinsi" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "Provinsi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kota" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "provinsiId" INTEGER NOT NULL,

    CONSTRAINT "Kota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Kota" ADD CONSTRAINT "Kota_provinsiId_fkey" FOREIGN KEY ("provinsiId") REFERENCES "Provinsi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_kotaId_fkey" FOREIGN KEY ("kotaId") REFERENCES "Kota"("id") ON DELETE SET NULL ON UPDATE CASCADE;
