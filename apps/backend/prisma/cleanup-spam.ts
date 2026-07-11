import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up scanner/attacker spam accounts registered on July 5, 2026...');

  const result = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { endsWith: '@attacker.com' } },
        { email: { endsWith: '@exploit.com' } },
        { email: { endsWith: '@attack.com' } },
        { email: { endsWith: '@exploit.org' } },
        { email: { contains: 'attacker' } },
        { email: { contains: 'exploit' } },
      ],
    },
  });

  console.log(`Successfully deleted ${result.count} spam accounts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
