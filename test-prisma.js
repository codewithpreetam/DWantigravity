const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const orgs = await prisma.organization.findMany({
    where: { status: "VERIFIED" },
    select: {
      name: true,
      _count: {
        select: {
          jobs: { where: { isActive: true } },
          internships: { where: { isActive: true } },
          events: { where: { date: { gte: new Date() } } },
        }
      }
    }
  });
  console.log(JSON.stringify(orgs, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
