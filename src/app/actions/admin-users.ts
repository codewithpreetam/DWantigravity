"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { UserRole, UserStatus } from "@prisma/client";

// Ensure the user is admin
async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized");
  }
}

export async function getUsersAction(
  page: number = 1,
  limit: number = 20,
  filters: any = {},
  sort: string = "newest"
) {
  await checkAdmin();

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};
  
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { organization: { name: { contains: filters.search, mode: "insensitive" } } },
    ];
  }
  
  if (filters.role && filters.role !== "ALL") {
    where.role = filters.role;
  }
  
  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  // Build order by
  let orderBy: any = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  else if (sort === "name-asc") orderBy = { name: "asc" };
  else if (sort === "name-desc") orderBy = { name: "desc" };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        organization: { select: { name: true } },
        _count: {
          select: {
            applications: true,
            postedJobs: true,
            postedInternships: true,
            postedFellowships: true,
            postedGrants: true,
            postedScholarships: true,
            postedConsultancies: true,
            postedVolunteers: true,
            postedEvents: true,
          }
        }
      },
    }),
    db.user.count({ where }),
  ]);

  // Compute total opportunities for employers
  const mappedUsers = users.map((user: any) => {
    const oppsCount = 
      user._count.postedJobs + 
      user._count.postedInternships + 
      user._count.postedFellowships + 
      user._count.postedGrants + 
      user._count.postedScholarships + 
      user._count.postedConsultancies + 
      user._count.postedVolunteers + 
      user._count.postedEvents;

    return {
      id: user.id,
      name: user.name || "Unknown",
      email: user.email,
      role: user.role,
      status: user.status,
      organization: user.organization?.name || "N/A",
      createdAt: user.createdAt,
      totalOpportunities: oppsCount,
      totalApplications: user._count.applications,
    };
  });

  return { users: mappedUsers, total };
}

export async function updateUserStatusAction(userIds: string[], status: UserStatus) {
  await checkAdmin();
  
  await db.user.updateMany({
    where: { id: { in: userIds } },
    data: { status },
  });
  
  return { success: true };
}

export async function deleteUsersAction(userIds: string[]) {
  await checkAdmin();
  
  // Soft delete
  await db.user.updateMany({
    where: { id: { in: userIds } },
    data: { status: UserStatus.DELETED },
  });
  
  return { success: true };
}
