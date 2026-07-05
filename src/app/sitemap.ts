import { MetadataRoute } from "next";
import { db } from "@/lib/db";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://developmentwala.org";
  
  const staticRoutes = [
    "",
    "/jobs",
    "/fellowships",
    "/internships",
    "/grants",
    "/consultancies",
    "/volunteer",
    "/scholarships",
    "/events",
    "/organizations",
    "/blog",
    "/about",
    "/contact",
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    // Fetch active jobs
    const activeJobs = await db.job.findMany({ where: { isActive: true } });
    activeJobs.forEach((job: any) => {
      const orgSlug = slugify(job.organization?.name || "ngo");
      const jobSlug = slugify(`${job.title}-${job.workMode === "REMOTE" ? "remote" : job.location}`);
      sitemapEntries.push({
        url: `${baseUrl}/jobs/${orgSlug}/${jobSlug}`,
        lastModified: job.updatedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });

    // Fetch active internships
    const activeInternships = await db.internship.findMany({ where: { isActive: true } });
    activeInternships.forEach((internship: any) => {
      sitemapEntries.push({
        url: `${baseUrl}/internships/${internship.id}`,
        lastModified: internship.updatedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });

    // Fetch active fellowships
    const activeFellowships = await db.fellowship.findMany({ where: { isActive: true } });
    activeFellowships.forEach((fellowship: any) => {
      sitemapEntries.push({
        url: `${baseUrl}/fellowships/${fellowship.id}`,
        lastModified: fellowship.updatedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });

    // Fetch active consultancies
    const activeConsultancies = await db.consultancy.findMany({ where: { isActive: true } });
    activeConsultancies.forEach((consultancy: any) => {
      sitemapEntries.push({
        url: `${baseUrl}/consultancies/${consultancy.id}`,
        lastModified: consultancy.updatedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });

    // Fetch active volunteers
    const activeVolunteers = await db.volunteer.findMany({ where: { isActive: true } });
    activeVolunteers.forEach((volunteer: any) => {
      sitemapEntries.push({
        url: `${baseUrl}/volunteer/${volunteer.id}`,
        lastModified: volunteer.updatedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });

    // Fetch active scholarships
    const activeScholarships = await db.scholarship.findMany({ where: { isActive: true } });
    activeScholarships.forEach((scholarship: any) => {
      sitemapEntries.push({
        url: `${baseUrl}/scholarships/${scholarship.id}`,
        lastModified: scholarship.updatedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });

    // Fetch active grants
    const activeGrants = await db.grant.findMany({ where: { isActive: true } });
    activeGrants.forEach((grant: any) => {
      sitemapEntries.push({
        url: `${baseUrl}/grants/${grant.id}`,
        lastModified: grant.updatedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });

    // Fetch events
    const events = await db.event.findMany();
    events.forEach((event: any) => {
      sitemapEntries.push({
        url: `${baseUrl}/events/${event.id}`,
        lastModified: event.updatedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    });

    // Fetch organizations
    const orgs = await db.organization.findMany();
    orgs.forEach((org: any) => {
      sitemapEntries.push({
        url: `${baseUrl}/company/${org.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    });
  } catch (error) {
    console.error("Error generating dynamic sitemap entries:", error);
  }

  return sitemapEntries;
}
