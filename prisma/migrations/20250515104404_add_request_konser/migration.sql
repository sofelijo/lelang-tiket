-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'DITOLAK', 'DITERIMA');

-- CreateTable
CREATE TABLE "RequestKonser" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3),
    "venue" TEXT,
    "deskripsi" TEXT,
    "image" TEXT,
    "userId" INTEGER NOT NULL,
    "kategoriIds" INTEGER[],
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestKonser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestKonserLike" (
    "id" SERIAL NOT NULL,
    "requestKonserId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestKonserLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RequestKonserLike_requestKonserId_userId_key" ON "RequestKonserLike"("requestKonserId", "userId");

-- AddForeignKey
ALTER TABLE "RequestKonser" ADD CONSTRAINT "RequestKonser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestKonserLike" ADD CONSTRAINT "RequestKonserLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestKonserLike" ADD CONSTRAINT "RequestKonserLike_requestKonserId_fkey" FOREIGN KEY ("requestKonserId") REFERENCES "RequestKonser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
