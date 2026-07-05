import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CompanyProfilePage(props: Props) {
  const params = await props.params;
  
  // Try finding by unique ID first
  let org = await db.organization.findUnique({
    where: { id: params.id },
  });

  // If not found by ID, try finding by slug matching
  if (!org) {
    const orgs = await db.organization.findMany();
    org = orgs.find((o: any) => slugify(o.name) === params.id) || null;
  }

  if (!org) {
    return notFound();
  }

  // Redirect permanently to the SEO-friendly slug url
  return redirect(`/${slugify(org.name)}`);
}
