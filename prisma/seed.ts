import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Mobile Legends Game ကို အရင်တည်ဆောက်မည်
  const mlbb = await prisma.game.upsert({
    where: { slug: "mobile-legends" },
    update: {},
    create: {
      name: "Mobile Legends: Bang Bang",
      slug: "mobile-legends",
      requiresZoneId: true,
      products: {
        create: [
          { name: "86 Diamonds", diamondCount: 86, price: 4500 },
          { name: "172 Diamonds", diamondCount: 172, price: 9000 },
          { name: "257 Diamonds", diamondCount: 257, price: 13500 },
          { name: "706 Diamonds", diamondCount: 706, price: 36000 },
        ],
      },
    },
  });

  console.log("Seed data created successfully for:", mlbb.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });