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
      { currentOrganization: { contains: filters.search, mode: "insensitive" } },
      { organization: { name: { contains: filters.search, mode: "insensitive" } } },
    ];
  }
  
  if (filters.role && filters.role !== "ALL") where.role = filters.role;
  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  
  // Advanced Seeker Filters
  if (filters.domain) where.domain = filters.domain;
  if (filters.secondaryDomain) where.secondaryDomain = filters.secondaryDomain;
  if (filters.workModePreference) where.workModePreference = filters.workModePreference;
  if (filters.employmentTypePreference) where.employmentTypePreference = filters.employmentTypePreference;
  if (filters.educationDegree) where.educationDegree = filters.educationDegree;
  if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };
  
  if (filters.experienceYearsMin !== undefined || filters.experienceYearsMax !== undefined) {
    where.experienceYears = {};
    if (filters.experienceYearsMin !== undefined) where.experienceYears.gte = Number(filters.experienceYearsMin);
    if (filters.experienceYearsMax !== undefined) where.experienceYears.lte = Number(filters.experienceYearsMax);
  }
  
  if (filters.noticePeriod) where.noticePeriod = filters.noticePeriod;
  if (filters.employmentStatus) where.employmentStatus = filters.employmentStatus;
  if (filters.availability) where.availability = filters.availability;
  
  if (filters.hasResume === "yes") {
    where.resumeUrl = { not: null };
  } else if (filters.hasResume === "no") {
    where.resumeUrl = null;
  }
  
  if (filters.skills && filters.skills.length > 0) {
    // Requires exact match of ALL selected skills
    where.skills = { hasEvery: filters.skills };
  }

  if (filters.languages && filters.languages.length > 0) {
    // Requires exact match of ALL selected languages
    where.languages = { hasEvery: filters.languages };
  }

  // Build order by
  let orderBy: any = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  else if (sort === "name-asc") orderBy = { name: "asc" };
  else if (sort === "name-desc") orderBy = { name: "desc" };
  else if (sort === "experience-desc") orderBy = { experienceYears: "desc" };
  else if (sort === "experience-asc") orderBy = { experienceYears: "asc" };
  else if (sort === "lastActive-desc") orderBy = { lastActiveAt: "desc" };
  else if (sort === "domain-asc") orderBy = { domain: "asc" };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        organization: true, // Fetch all org data
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

  // Compute total opportunities for employers and format the response for the client
  const mappedUsers = users.map((user: any) => {
    const oppsCount = 
      (user._count?.postedJobs || 0) + 
      (user._count?.postedInternships || 0) + 
      (user._count?.postedFellowships || 0) + 
      (user._count?.postedGrants || 0) + 
      (user._count?.postedScholarships || 0) + 
      (user._count?.postedConsultancies || 0) + 
      (user._count?.postedVolunteers || 0) + 
      (user._count?.postedEvents || 0);

    return {
      ...user,
      id: user.id,
      name: user.name || "Unknown",
      email: user.email,
      role: user.role,
      status: user.status,
      // Pass raw string so client can parse Date reliably
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      lastActiveAt: user.lastActiveAt ? user.lastActiveAt.toISOString() : null,
      
      // Expanded profile details (safe fallbacks)
      jobTitle: user.jobTitle,
      currentOrganization: user.currentOrganization,
      domain: user.domain,
      secondaryDomain: user.secondaryDomain,
      workModePreference: user.workModePreference,
      employmentTypePreference: user.employmentTypePreference,
      department: user.department,
      phone: user.phone,
      linkedin: user.linkedin,
      website: user.website,
      officeLocation: user.officeLocation,
      team: user.team,
      bio: user.bio,
      shortBio: user.shortBio,
      skills: user.skills || [],
      experienceYears: user.experienceYears || 0,
      educationDegree: user.educationDegree,
      languages: user.languages || [],
      location: user.location,
      roleInOrg: user.roleInOrg,
      resumeUrl: user.resumeUrl,
      noticePeriod: user.noticePeriod,
      employmentStatus: user.employmentStatus,
      currentSalary: user.currentSalary,
      expectedSalary: user.expectedSalary,
      availability: user.availability,

      // Export Org Details natively
      organizationData: user.organization || null,
      organization: user.organization?.name || "N/A",
      
      totalOpportunities: oppsCount,
      totalApplications: user._count?.applications || 0,
      _count: undefined, // cleanup raw counts
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
