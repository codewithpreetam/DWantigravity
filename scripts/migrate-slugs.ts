import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function generateBaseSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = generateBaseSlug(title);
  
  const existingSlugs = await (db as any).slugTracker.findMany({
    where: { slug: { startsWith: baseSlug } },
    select: { slug: true }
  });

  if (existingSlugs.length === 0) {
    await (db as any).slugTracker.create({ data: { slug: baseSlug } });
    return baseSlug;
  }

  let exactMatchExists = false;
  let maxSuffix = 0;

  for (const record of existingSlugs) {
    if (record.slug === baseSlug) {
      exactMatchExists = true;
      continue;
    }
    const prefix = `${baseSlug}-`;
    if (record.slug.startsWith(prefix)) {
      const suffixStr = record.slug.substring(prefix.length);
      const suffixNum = parseInt(suffixStr, 10);
      if (!isNaN(suffixNum) && suffixNum.toString() === suffixStr) {
        if (suffixNum > maxSuffix) maxSuffix = suffixNum;
      }
    }
  }

  if (!exactMatchExists && maxSuffix === 0) {
    await (db as any).slugTracker.create({ data: { slug: baseSlug } });
    return baseSlug;
  }

  const nextSuffix = Math.max(maxSuffix, exactMatchExists ? 1 : 0) + 1;
  const finalSlug = `${baseSlug}-${nextSuffix}`;
  await (db as any).slugTracker.create({ data: { slug: finalSlug } });
  
  return finalSlug;
}

async function main() {
  console.log("Starting slug migration...");

  const models = [
    db.job, db.internship, db.fellowship, db.scholarship, 
    db.grant, db.consultancy, db.volunteer, db.event
  ];

  for (const model of models) {
    // We get items that either have no slug or have a CUID-like slug
    const items = await (model as any).findMany();
    for (const item of items) {
      if (item.slug && item.slug.length >= 25 && item.slug.startsWith("c")) {
        const newSlug = await generateUniqueSlug(item.title);
        await (model as any).update({
          where: { id: item.id },
          data: { slug: newSlug }
        });
        console.log(`Updated ID ${item.id} -> ${newSlug}`);
      }
    }
  }

  console.log("Migration complete!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
