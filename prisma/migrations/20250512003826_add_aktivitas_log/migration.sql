-- CreateTable
CREATE TABLE "Aktivitas" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "aksi" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aktivitas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Aktivitas" ADD CONSTRAINT "Aktivitas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
