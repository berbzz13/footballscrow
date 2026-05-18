import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123456", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@footballscrow.com" },
    update: {},
    create: {
      email: "admin@footballscrow.com",
      password: adminPassword,
      name: "FootballScrow Admin",
      role: "admin",
      verified: true,
    },
  });

  console.log("Admin user created:", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
