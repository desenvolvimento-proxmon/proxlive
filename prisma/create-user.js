/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("12345678", 10);

  const user = await prisma.user.upsert({
    where: {
      email: "unocadu@gmail.com"
    },
    update: {
      passwordHash
    },
    create: {
      name: "Cadu",
      email: "unocadu@gmail.com",
      passwordHash
    }
  });

  console.log("Usuario criado/atualizado:", user.email);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
