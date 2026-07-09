"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { UserRole, OppStatus } from "@prisma/client";

// Ensure the user is admin
async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized");
  }
}

// Helper to get the correct db model based on type
function getModel(type: string) {
  switch (type) {
    case "jobs": return db.job;
    case "internships": return db.internship;
    case "fellowships": return db.fellowship;
    case "scholarships": return db.scholarship;
    case "grants": return db.grant;
    case "consultancies": return db.consultancy;
    case "volunteers": return db.volunteer;
    case "events": return db.event;
    default: return db.job;
  }
}

export async function getOpportunitiesAction(
  type: string = "jobs",
  page: number = 1,
  limit: number = 20,
  filters: any = {},
  sort: string = "newest"
) {
  await checkAdmin();

  const skip = (page - 1) * limit;
  const model = getModel(type) as any;

  // Build where clause
  const where: any = {};
  
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      type !== "events" ? { organization: { name: { contains: filters.search, mode: "insensitive" } } } : { organizer: { name: { contains: filters.search, mode: "insensitive" } } },
    ];
  }
  
  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  // Build order by
  let orderBy: any = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  else if (sort === "deadline") orderBy = type === "grants" ? { deadline: "asc" } : (type === "events" ? { date: "asc" } : { createdAt: "desc" });

  const includePayload: any = {
    _count: {
      select: {
        applications: type !== "events", // Events don't have applications relation
      }
    }
  };

  if (type === "events") {
    includePayload.organizer = { select: { name: true } };
  } else {
    includePayload.organization = { select: { name: true } };
    includePayload.postedBy = { select: { name: true, email: true } };
  }

  const [opps, total] = await Promise.all([
    model.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: includePayload,
    }),
    model.count({ where }),
  ]);

  const mappedOpps = opps.map((opp: any) => {
    return {
      id: opp.id,
      title: opp.title,
      type: type,
      organization: type === "events" ? opp.organizer?.name : opp.organization?.name,
      recruiter: type !== "events" ? opp.postedBy?.name : "N/A",
      createdAt: opp.createdAt,
      deadline: opp.deadline || opp.date || null,
      status: opp.status,
      totalApplications: type !== "events" ? (opp._count?.applications || 0) : 0,
      totalViews: 0, // Currently no views field in DB
      totalSaves: 0, // Currently not aggregating saves
    };
  });

  return { opps: mappedOpps, total };
}

export async function updateOpportunityStatusAction(type: string, oppIds: string[], status: OppStatus) {
  await checkAdmin();
  const model = getModel(type) as any;
  
  await model.updateMany({
    where: { id: { in: oppIds } },
    data: { status, isActive: status === "PUBLISHED" },
  });
  
  return { success: true };
}

export async function deleteOpportunitiesAction(type: string, oppIds: string[]) {
  await checkAdmin();
  const model = getModel(type) as any;
  
  await model.deleteMany({
    where: { id: { in: oppIds } },
  });
  
  return { success: true };
}
