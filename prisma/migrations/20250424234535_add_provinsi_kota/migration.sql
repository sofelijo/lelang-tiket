-- AlterTable
ALTER TABLE "User" ADD COLUMN     "provinsiId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_provinsiId_fkey" FOREIGN KEY ("provinsiId") REFERENCES "Provinsi"("id") ON DELETE SET NULL ON UPDATE CASCADE;
