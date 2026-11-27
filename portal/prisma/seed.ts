require("dotenv").config({ path: ".env" });

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@pss.edu.mh";
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_SEED_PASSWORD is required");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "PSS PDF Admin",
      email,
      password: hashedPassword,
      role: "ADMIN",
      mustChangePassword: true,
      isActive: true,
    },
  });

  const existing = await prisma.systemSetting.findFirst();
  if (!existing) {
    await prisma.systemSetting.create({ data: {} });
  }

  console.log(`Seeded ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
