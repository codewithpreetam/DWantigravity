"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ApplicationStage } from "@prisma/client";

async function getRecruiterId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

function parseMatchingParams(formData: FormData) {
  const requiredSkills = (formData.getAll("requiredSkills") as string[]).map(s => s.trim()).filter(Boolean);
  const preferredSkills = (formData.getAll("preferredSkills") as string[]).map(s => s.trim()).filter(Boolean);
  const minExperienceYears = parseInt(formData.get("minExperienceYears") as string) || 0;
  const minEducation = formData.get("minEducation") as string || null;
  const requiredLanguages = (formData.getAll("requiredLanguages") as string[]).map(l => l.trim()).filter(Boolean);

  return {
    requiredSkills,
    preferredSkills,
    minExperienceYears,
    minEducation,
    requiredLanguages
  };
}

export async function createJobAction(formData: FormData): Promise<void> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const requirements = formData.get("requirements") as string;
  const location = formData.get("location") as string;
  const salaryMin = parseInt(formData.get("salaryMin") as string) || 0;
  const salaryMax = parseInt(formData.get("salaryMax") as string) || 0;
  const employmentType = (formData.get("employmentType") as string) || "FULL_TIME";
  const workMode = (formData.get("workMode") as string) || "ON_SITE";
  const isRemote = workMode === "REMOTE";
  const organizationId = formData.get("organizationId") as string;

  if (!title || !description || !location || !organizationId) {
    return;
  }

  try {
    const matching = parseMatchingParams(formData);
    await db.job.create({
      data: {
        title,
        description,
        requirements,
        location,
        salaryMin,
        salaryMax,
        employmentType,
        isRemote,
        workMode,
        postedById: await getRecruiterId(),
        organizationId,
        isActive: true,
        ...matching
      },
    });
    
    revalidatePath("/jobs");
    revalidatePath("/dashboard/employer");
  } catch (error: any) {
    console.error("Job creation error:", error);
  }
}

export async function createInternshipAction(formData: FormData): Promise<void> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const requirements = formData.get("requirements") as string;
  const location = formData.get("location") as string;
  const stipend = parseInt(formData.get("stipend") as string) || 0;
  const duration = formData.get("duration") as string;
  const organizationId = formData.get("organizationId") as string;

  if (!title || !description || !location || !organizationId) {
    return;
  }

  try {
    const matching = parseMatchingParams(formData);
    await db.internship.create({
      data: {
        title,
        description,
        requirements,
        location,
        stipend,
        duration,
        postedById: await getRecruiterId(),
        organizationId,
        isActive: true,
        ...matching
      },
    });
    revalidatePath("/internships");
    revalidatePath("/dashboard/employer");
  } catch (e) {
    console.error("Internship creation error:", e);
  }
}

export async function createFellowshipAction(formData: FormData): Promise<void> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const requirements = formData.get("requirements") as string;
  const location = formData.get("location") as string;
  const stipend = parseInt(formData.get("stipend") as string) || 0;
  const duration = formData.get("duration") as string;
  const organizationId = formData.get("organizationId") as string;

  if (!title || !description || !location || !organizationId) {
    return;
  }

  try {
    const matching = parseMatchingParams(formData);
    await db.fellowship.create({
      data: {
        title,
        description,
        requirements,
        location,
        stipend,
        duration,
        postedById: await getRecruiterId(),
        organizationId,
        isActive: true,
        ...matching
      },
    });
    revalidatePath("/fellowships");
    revalidatePath("/dashboard/employer");
  } catch (e) {
    console.error("Fellowship creation error:", e);
  }
}

export async function createScholarshipAction(formData: FormData): Promise<void> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const requirements = formData.get("requirements") as string;
  const amount = parseInt(formData.get("amount") as string) || 0;
  const deadlineStr = formData.get("deadline") as string;
  const organizationId = formData.get("organizationId") as string;

  if (!title || !description || !organizationId) {
    return;
  }

  try {
    const matching = parseMatchingParams(formData);
    await db.scholarship.create({
      data: {
        title,
        description,
        requirements,
        amount,
        deadline: deadlineStr ? new Date(deadlineStr) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        postedById: await getRecruiterId(),
        organizationId,
        isActive: true,
        ...matching
      },
    });
    revalidatePath("/scholarships");
    revalidatePath("/dashboard/employer");
  } catch (e) {
    console.error("Scholarship creation error:", e);
  }
}

export async function createGrantAction(formData: FormData): Promise<void> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const requirements = formData.get("requirements") as string;
  const fundingMin = parseInt(formData.get("fundingMin") as string) || 0;
  const fundingMax = parseInt(formData.get("fundingMax") as string) || 0;
  const deadlineStr = formData.get("deadline") as string;
  const organizationId = formData.get("organizationId") as string;

  if (!title || !description || !organizationId) {
    return;
  }

  try {
    const matching = parseMatchingParams(formData);
    await db.grant.create({
      data: {
        title,
        description,
        requirements,
        fundingMin,
        fundingMax,
        deadline: deadlineStr ? new Date(deadlineStr) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        externalApplyLink: (formData.get("externalApplyLink") as string) || undefined,
        postedById: await getRecruiterId(),
        organizationId,
        isActive: true,
        ...matching
      },
    });
    revalidatePath("/grants");
    revalidatePath("/dashboard/employer");
  } catch (e) {
    console.error("Grant creation error:", e);
  }
}

export async function createConsultancyAction(formData: FormData): Promise<void> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const requirements = formData.get("requirements") as string;
  const location = formData.get("location") as string;
  const budget = parseInt(formData.get("budget") as string) || 0;
  const organizationId = formData.get("organizationId") as string;

  if (!title || !description || !location || !organizationId) {
    return;
  }

  try {
    const matching = parseMatchingParams(formData);
    await db.consultancy.create({
      data: {
        title,
        description,
        requirements,
        location,
        budget,
        postedById: await getRecruiterId(),
        organizationId,
        isActive: true,
        ...matching
      },
    });
    revalidatePath("/consultancies");
    revalidatePath("/dashboard/employer");
  } catch (e) {
    console.error("Consultancy creation error:", e);
  }
}

export async function createVolunteerAction(formData: FormData): Promise<void> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const requirements = formData.get("requirements") as string;
  const location = formData.get("location") as string;
  const duration = formData.get("duration") as string;
  const organizationId = formData.get("organizationId") as string;

  if (!title || !description || !location || !organizationId) {
    return;
  }

  try {
    const matching = parseMatchingParams(formData);
    await db.volunteer.create({
      data: {
        title,
        description,
        requirements,
        location,
        duration,
        postedById: await getRecruiterId(),
        organizationId,
        isActive: true,
        ...matching
      },
    });
    revalidatePath("/volunteer");
    revalidatePath("/dashboard/employer");
  } catch (e) {
    console.error("Volunteer creation error:", e);
  }
}

export async function createEventAction(formData: FormData): Promise<void> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dateStr = formData.get("date") as string;
  const time = formData.get("time") as string;
  const location = formData.get("location") as string;
  const capacity = parseInt(formData.get("capacity") as string) || 100;
  const price = parseInt(formData.get("price") as string) || 0;
  const organizerId = formData.get("organizationId") as string;
  const coverImage = formData.get("coverImage") as string | null;
  const registrationDeadlineStr = formData.get("registrationDeadline") as string | null;
  const format = formData.get("format") as any || "IN_PERSON";
  const website = formData.get("website") as string | null;
  const categoryId = formData.get("categoryId") as string | null;
  const eligibility = formData.get("eligibility") as string | null;
  const contactEmail = formData.get("contactEmail") as string | null;
  const contactPhone = formData.get("contactPhone") as string | null;
  const agenda = formData.get("agenda") as string | null;
  const timeZone = formData.get("timeZone") as string | null;
  const duration = formData.get("duration") as string | null;
  const venue = formData.get("venue") as string | null;
  const city = formData.get("city") as string | null;
  const state = formData.get("state") as string | null;
  const country = formData.get("country") as string | null;
  const meetingPlatform = formData.get("meetingPlatform") as string | null;
  
  const certificateAvailable = formData.get("certificateAvailable") === "true";
  const recordingAvailable = formData.get("recordingAvailable") === "true";

  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  
  const audienceRaw = formData.get("audience") as string;
  const audience = audienceRaw ? audienceRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

  if (!title || !description || !dateStr || !organizerId) {
    return;
  }

  // Generate a unique slug: slugify title + random string
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;

  try {
    const matching = parseMatchingParams(formData);
    await db.event.create({
      data: {
        slug,
        title,
        description,
        coverImage,
        date: new Date(dateStr),
        registrationDeadline: registrationDeadlineStr ? new Date(registrationDeadlineStr) : null,
        time,
        location,
        capacity,
        price,
        format,
        website,
        categoryId,
        tags,
        audience,
        eligibility,
        contactEmail,
        contactPhone,
        agenda,
        timeZone,
        duration,
        venue,
        city,
        state,
        country,
        meetingPlatform,
        certificateAvailable,
        recordingAvailable,
        postedById: await getRecruiterId(),
        organizerId,
        ...matching
      },
    });
    revalidatePath("/events");
    revalidatePath("/dashboard/employer");
  } catch (e) {
    console.error("Event creation error:", e);
  }
}

export async function updateOrgProfileAction(formData: FormData): Promise<void> {
  const orgId = formData.get("orgId") as string;
  const name = formData.get("name") as string;
  const logo = formData.get("logo") as string;
  const website = formData.get("website") as string;
  const description = formData.get("description") as string;

  if (!orgId || !name) {
    return;
  }

  try {
    await db.organization.update({
      where: { id: orgId },
      data: { name, logo, website, description },
    });
    
    revalidatePath("/organizations");
    revalidatePath("/dashboard/employer");
  } catch (error: any) {
    console.error("Org update error:", error);
  }
}

export async function getOrganizationsAction() {
  try {
    return await db.organization.findMany({
      select: { id: true, name: true, logo: true }
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return [];
  }
}

export async function updateRecruiterProfileAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const profilePhoto = formData.get("profilePhoto") as string;
  const jobTitle = formData.get("jobTitle") as string;
  const department = formData.get("department") as string;
  const shortBio = formData.get("shortBio") as string;
  const aboutMe = formData.get("aboutMe") as string;
  const phone = formData.get("phone") as string;
  const linkedin = formData.get("linkedin") as string;
  const website = formData.get("website") as string;
  const twitter = formData.get("twitter") as string;
  const officeLocation = formData.get("officeLocation") as string;
  const team = formData.get("team") as string;

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        profilePhoto,
        image: profilePhoto || undefined, // sync default avatar
        jobTitle,
        department,
        shortBio,
        aboutMe,
        phone,
        linkedin,
        website,
        twitter,
        officeLocation,
        team,
      }
    });

    revalidatePath("/dashboard/employer");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating recruiter profile:", err);
    return { error: err.message };
  }
}

export async function updateOrgProfileRichAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const orgId = formData.get("orgId") as string;
  const name = formData.get("name") as string;
  const logo = formData.get("logo") as string;
  const coverBanner = formData.get("coverBanner") as string;
  const website = formData.get("website") as string;
  const description = formData.get("description") as string;
  const mission = formData.get("mission") as string;
  const vision = formData.get("vision") as string;
  const orgType = formData.get("orgType") as string;
  const registrationNumber = formData.get("registrationNumber") as string;
  const yearFounded = parseInt(formData.get("yearFounded") as string) || undefined;
  const headquarters = formData.get("headquarters") as string;
  const orgSize = formData.get("orgSize") as string;
  const employeesCount = parseInt(formData.get("employeesCount") as string) || undefined;
  const volunteersCount = parseInt(formData.get("volunteersCount") as string) || undefined;
  const annualBudget = formData.get("annualBudget") as string;
  const careersPage = formData.get("careersPage") as string;
  const linkedin = formData.get("linkedin") as string;
  const facebook = formData.get("facebook") as string;
  const instagram = formData.get("instagram") as string;
  const twitter = formData.get("twitter") as string;
  const youtube = formData.get("youtube") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;

  const areasOfWorkRaw = formData.get("areasOfWork") as string;
  const sdgsRaw = formData.get("sdgs") as string;
  const causeAreasRaw = formData.get("causeAreas") as string;

  const areasOfWork = areasOfWorkRaw ? areasOfWorkRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  const sdgs = sdgsRaw ? sdgsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  const causeAreas = causeAreasRaw ? causeAreasRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

  try {
    await db.organization.update({
      where: { id: orgId },
      data: {
        name,
        logo,
        coverBanner,
        website,
        description,
        mission,
        vision,
        orgType,
        registrationNumber,
        yearFounded,
        headquarters,
        orgSize,
        employeesCount,
        volunteersCount,
        annualBudget,
        careersPage,
        linkedin,
        facebook,
        instagram,
        twitter,
        youtube,
        email,
        phone,
        areasOfWork,
        sdgs,
        causeAreas,
      }
    });

    revalidatePath("/organizations");
    revalidatePath(`/company/${orgId}`);
    revalidatePath("/dashboard/employer");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating organization rich profile:", err);
    return { error: err.message };
  }
}

export async function inviteRecruiterAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const orgId = formData.get("orgId") as string;
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const roleInOrg = formData.get("roleInOrg") as string; // Owner, Admin, Recruiter, Viewer

  if (!orgId || !email || !name) {
    return { error: "Organization, name, and email are required." };
  }

  try {
    // Check if user exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.organizationId) {
        return { error: "User is already registered with an organization." };
      }
      // Associate existing user
      await db.user.update({
        where: { id: existing.id },
        data: { organizationId: orgId, roleInOrg }
      });
    } else {
      // Mock create a pending recruiter user
      await db.user.create({
        data: {
          name,
          email,
          role: "EMPLOYER",
          organizationId: orgId,
          roleInOrg,
        }
      });
    }

    revalidatePath("/dashboard/employer");
    return { success: true };
  } catch (err: any) {
    console.error("Invite error:", err);
    return { error: err.message };
  }
}

export async function removeRecruiterMemberAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const memberId = formData.get("memberId") as string;

  if (!memberId) {
    return { error: "Member ID is required" };
  }

  try {
    await db.user.update({
      where: { id: memberId },
      data: { 
        organizationId: null,
        roleInOrg: null
      }
    });

    revalidatePath("/dashboard/employer");
    return { success: true };
  } catch (err: any) {
    console.error("Error removing member:", err);
    return { error: err.message };
  }
}

export async function scheduleInterviewAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const appId = formData.get("appId") as string;
  const dateStr = formData.get("interviewDate") as string;
  const time = formData.get("interviewTime") as string;
  const timezone = formData.get("interviewTimezone") as string;
  const type = formData.get("interviewType") as string;
  const link = formData.get("interviewLink") as string;
  const interviewer = formData.get("interviewInterviewer") as string;

  if (!appId || !dateStr || !time || !interviewer) {
    return { error: "Application, date, time, and interviewer are required." };
  }

  try {
    await db.application.update({
      where: { id: appId },
      data: {
        stage: "INTERVIEW_SCHEDULED",
        interviewDate: new Date(dateStr),
        interviewTime: time,
        interviewTimezone: timezone,
        interviewType: type,
        interviewLink: link,
        interviewInterviewer: interviewer,
        interviewStatus: "SCHEDULED"
      }
    });

    revalidatePath("/dashboard/employer");
    return { success: true };
  } catch (err: any) {
    console.error("Error scheduling interview:", err);
    return { error: err.message };
  }
}

export async function updateOpportunityStatusAction(
  oppId: string, 
  oppType: string, 
  action: "publish" | "pause" | "close" | "archive" | "delete"
): Promise<{ success?: boolean; error?: string }> {
  const tableMap: Record<string, any> = {
    JOB: db.job,
    INTERNSHIP: db.internship,
    FELLOWSHIP: db.fellowship,
    SCHOLARSHIP: db.scholarship,
    GRANT: db.grant,
    CONSULTANCY: db.consultancy,
    VOLUNTEER: db.volunteer,
    EVENT: db.event
  };

  const model = tableMap[oppType];
  if (!model) {
    return { error: `Invalid opportunity type ${oppType}` };
  }

  try {
    if (action === "delete") {
      await model.delete({ where: { id: oppId } });
    } else {
      const isActive = action === "publish";
      await model.update({
        where: { id: oppId },
        data: { isActive }
      });
    }

    revalidatePath("/jobs");
    revalidatePath("/dashboard/employer");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating opportunity status:", err);
    return { error: err.message };
  }
}

export async function updateApplicationEvaluationAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const appId = formData.get("appId") as string;
  const notes = formData.get("notes") as string;
  const rating = parseInt(formData.get("rating") as string) || undefined;
  const tagsRaw = formData.get("tags") as string;
  const assignedToId = formData.get("assignedToId") as string;

  const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

  try {
    await db.application.update({
      where: { id: appId },
      data: {
        notes,
        rating,
        tags,
        assignedToId: assignedToId || null
      }
    });

    revalidatePath("/dashboard/employer");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating evaluation:", err);
    return { error: err.message };
  }
}

export async function updateOpportunityAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const oppId = formData.get("oppId") as string;
  const oppType = formData.get("oppType") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const requirements = formData.get("requirements") as string;

  const tableMap: Record<string, any> = {
    JOB: db.job,
    INTERNSHIP: db.internship,
    FELLOWSHIP: db.fellowship,
    SCHOLARSHIP: db.scholarship,
    GRANT: db.grant,
    CONSULTANCY: db.consultancy,
    VOLUNTEER: db.volunteer,
    EVENT: db.event
  };

  const model = tableMap[oppType];
  if (!model) {
    return { error: `Invalid opportunity type ${oppType}` };
  }

  try {
    const matching = parseMatchingParams(formData);
    const data: any = { title, description, requirements, ...matching };

    if (oppType === "JOB") {
      data.location = formData.get("location") as string;
      data.salaryMin = parseInt(formData.get("salaryMin") as string) || undefined;
      data.salaryMax = parseInt(formData.get("salaryMax") as string) || undefined;
      data.employmentType = formData.get("employmentType") as string;
      data.workMode = formData.get("workMode") as string;
      data.isRemote = data.workMode === "REMOTE";
    } else if (oppType === "INTERNSHIP" || oppType === "FELLOWSHIP") {
      data.location = formData.get("location") as string;
      data.stipend = parseInt(formData.get("stipend") as string) || undefined;
      data.duration = formData.get("duration") as string;
    } else if (oppType === "SCHOLARSHIP") {
      data.amount = parseInt(formData.get("amount") as string) || undefined;
      const deadline = formData.get("deadline") as string;
      data.deadline = deadline ? new Date(deadline) : undefined;
    } else if (oppType === "GRANT") {
      data.fundingMin = parseInt(formData.get("fundingMin") as string) || undefined;
      data.fundingMax = parseInt(formData.get("fundingMax") as string) || undefined;
      const deadline = formData.get("deadline") as string;
      data.deadline = deadline ? new Date(deadline) : undefined;
      data.externalApplyLink = (formData.get("externalApplyLink") as string) || null;
    } else if (oppType === "CONSULTANCY") {
      data.location = formData.get("location") as string;
      data.budget = parseInt(formData.get("budget") as string) || undefined;
    } else if (oppType === "VOLUNTEER") {
      data.location = formData.get("location") as string;
      data.duration = formData.get("duration") as string;
    } else if (oppType === "EVENT") {
      data.location = formData.get("location") as string;
      const dateStr = formData.get("date") as string;
      data.date = dateStr ? new Date(dateStr) : undefined;
      data.time = formData.get("time") as string;
      data.capacity = parseInt(formData.get("capacity") as string) || undefined;
      data.price = parseInt(formData.get("price") as string) || undefined;
    }

    await model.update({
      where: { id: oppId },
      data
    });

    revalidatePath("/jobs");
    revalidatePath("/dashboard/employer");
    return { success: true };
  } catch (err: any) {
    console.error("Update error:", err);
    return { error: err.message };
  }
}
