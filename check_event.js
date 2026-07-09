const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const event = await prisma.event.findFirst({
    where: { title: { contains: "Impact" } } // Just grab the first event, or grab all to check
  });
  
  if (!event) {
    console.log("No events found");
    return;
  }
  
  const allEvents = await prisma.event.findMany({
    include: {
      _count: {
        select: { registrations: true }
      }
    }
  });

  allEvents.forEach(e => {
    console.log(`Event: ${e.title}`);
    console.log(`- Deadline: ${e.registrationDeadline}`);
    console.log(`- Capacity: ${e.capacity}`);
    console.log(`- Registrations: ${e._count.registrations}`);
    console.log(`- IsActive: ${e.isActive}`);
    
    const isPastDeadline = e.registrationDeadline 
      ? new Date() > new Date(new Date(e.registrationDeadline).setUTCHours(23, 59, 59, 999)) 
      : false;
    const isSoldOut = e.capacity ? e._count.registrations >= e.capacity : false;
    const isRegistrationClosed = isPastDeadline || isSoldOut || !e.isActive;
    
    console.log(`- isPastDeadline: ${isPastDeadline}`);
    console.log(`- isSoldOut: ${isSoldOut}`);
    console.log(`- isRegistrationClosed: ${isRegistrationClosed}\n`);
  });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
