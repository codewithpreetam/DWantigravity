import { db } from "@/lib/db";

export function generateBaseSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace special characters with hyphens
    .replace(/(^-|-$)/g, "");     // Trim leading and trailing hyphens
}

export async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = generateBaseSlug(title);
  
  // Find all used slugs that start with this baseSlug
  const existingSlugs = await db.slugTracker.findMany({
    where: {
      slug: {
        startsWith: baseSlug
      }
    },
    select: { slug: true }
  });

  if (existingSlugs.length === 0) {
    // Unique slug, record it
    await db.slugTracker.create({ data: { slug: baseSlug } });
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
        if (suffixNum > maxSuffix) {
          maxSuffix = suffixNum;
        }
      }
    }
  }

  // If no exact match and maxSuffix is 0, baseSlug is actually safe (should have been caught by length === 0, but just in case)
  if (!exactMatchExists && maxSuffix === 0) {
    await db.slugTracker.create({ data: { slug: baseSlug } });
    return baseSlug;
  }

  const nextSuffix = Math.max(maxSuffix, exactMatchExists ? 1 : 0) + 1;
  const finalSlug = `${baseSlug}-${nextSuffix}`;
  
  await db.slugTracker.create({ data: { slug: finalSlug } });
  
  return finalSlug;
}
