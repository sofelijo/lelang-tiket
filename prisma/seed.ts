// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "jasatitipdhea@gmail.com";
  const password = "tes";
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Admin Dhea",
      email,
      password: hashedPassword,
      phoneNumber: "6281234567890",
      username: "admin-dhea",
      role: "ADMIN",
      isVerified: true,
    },
  });

  console.log("✅ Admin user seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
