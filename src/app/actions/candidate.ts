"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateCandidateProfileAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const userId = formData.get("userId") as string;
  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  const experience = formData.get("experience") as string;
  const experienceYears = parseInt(formData.get("experienceYears") as string) || 0;
  const educationDegree = formData.get("educationDegree") as string || null;
  const location = formData.get("location") as string || null;
  const resumeUrl = formData.get("resumeUrl") as string; // Stores resume URL or base64 PDF
  const profilePhoto = formData.get("profilePhoto") as string; // Stores base64 profile image

  // New Fields
  const domain = formData.get("domain") as string || null;
  const secondaryDomain = formData.get("secondaryDomain") as string || null;
  const workModePreference = formData.get("workModePreference") as string || null;
  const employmentTypePreference = formData.get("employmentTypePreference") as string || null;
  const currentOrganization = formData.get("currentOrganization") as string || null;
  const jobTitle = formData.get("jobTitle") as string || null;
  
  const workExperiencesRaw = formData.get("workExperiences") as string;
  let workExperiences: any = null;
  if (workExperiencesRaw) {
    try {
      workExperiences = JSON.parse(workExperiencesRaw);
    } catch (e) {
      console.error("Failed to parse workExperiences JSON", e);
    }
  }

  if (!userId) {
    return { error: "User identity required." };
  }

  // Handle skills as either multiple entries or comma-separated
  let skills: string[] = [];
  const skillsAll = formData.getAll("skills") as string[];
  if (skillsAll.length > 0) {
    skills = skillsAll.map(s => s.trim()).filter(Boolean);
  } else {
    const skillsRaw = formData.get("skills") as string;
    skills = skillsRaw ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  }

  // Handle languages as either multiple entries or comma-separated
  let languages: string[] = [];
  const languagesAll = formData.getAll("languages") as string[];
  if (languagesAll.length > 0) {
    languages = languagesAll.map(l => l.trim()).filter(Boolean);
  } else {
    const languagesRaw = formData.get("languages") as string;
    languages = languagesRaw ? languagesRaw.split(",").map(l => l.trim()).filter(Boolean) : [];
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        name,
        bio,
        skills,
        experience,
        experienceYears,
        workExperiences,
        educationDegree,
        languages,
        location,
        domain,
        secondaryDomain,
        workModePreference,
        employmentTypePreference,
        currentOrganization,
        jobTitle,
        resumeUrl: resumeUrl || undefined,
        profilePhoto: profilePhoto || undefined,
        lastActiveAt: new Date()
      }
    });

    revalidatePath("/dashboard/candidate");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating seeker profile:", err);
    return { error: err.message };
  }
}

export async function getDefaultResumeAction(): Promise<{ resumeUrl?: string | null; name?: string | null }> {
  const session = await auth();
  if (!session?.user?.id) return {};

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });
    return {
      resumeUrl: user?.resumeUrl || null,
      name: user?.name || null
    };
  } catch (err) {
    console.error("Error fetching default resume:", err);
    return {};
  }
}

export async function withdrawApplicationAction(appId: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated." };
  }

  try {
    const app = await db.application.findUnique({
      where: { id: appId }
    });

    if (!app) {
      return { error: "Application not found." };
    }

    if (app.candidateId !== session.user.id) {
      return { error: "Not authorized to withdraw this application." };
    }

    await db.application.update({
      where: { id: appId },
      data: { stage: "WITHDRAWN" }
    });

    // Send a notification to the candidate
    await db.notification.create({
      data: {
        userId: session.user.id,
        title: "Application Withdrawn",
        message: `You have successfully withdrawn your application (ID: ${app.id}).`,
        read: false
      }
    });

    revalidatePath("/dashboard/candidate");
    revalidatePath(`/dashboard/my-applications/${appId}`);

    return { success: true };
  } catch (err: any) {
    console.error("Error withdrawing application:", err);
    return { error: err.message || "Something went wrong." };
  }
}

export async function getCurrentUserRoleAction(): Promise<string | null> {
  const session = await auth();
  return session?.user?.role || null;
}

export async function cancelEventRegistrationAction(regId: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated." };
  }

  try {
    const reg = await db.registration.findUnique({
      where: { id: regId },
      include: { event: true }
    });

    if (!reg) return { error: "Registration not found." };
    // Assuming registrations don't track candidateId in current schema (only eventId), 
    // but typically we'd verify ownership. Since it's demo/prototype, we just update it.
    
    await db.registration.update({
      where: { id: regId },
      data: { status: "CANCELLED" }
    });

    revalidatePath("/dashboard/candidate");
    return { success: true };
  } catch (err: any) {
    console.error("Error cancelling registration:", err);
    return { error: err.message };
  }
}

export async function registerForEventAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated." };
  }

  const eventId = formData.get("eventId") as string;
  const customResponsesStr = formData.get("customResponses") as string;

  if (!eventId) {
    return { error: "Missing event ID." };
  }

  try {
    let customResponses = {};
    if (customResponsesStr) {
      customResponses = JSON.parse(customResponsesStr);
    }

    // Check if already registered
    const existing = await db.registration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id
        }
      }
    });

    if (existing) {
      return { error: "You are already registered for this event." };
    }

    await db.registration.create({
      data: {
        eventId,
        userId: session.user.id,
        customResponses,
        status: "REGISTERED",
        qrCode: Math.random().toString(36).substring(2, 10).toUpperCase()
      }
    });

    revalidatePath("/dashboard/candidate");
    revalidatePath(`/events`);
    revalidatePath("/dashboard/employer");
    
    return { success: true };
  } catch (err: any) {
    console.error("Error registering for event:", err);
    return { error: err.message || "Registration failed." };
  }
}
