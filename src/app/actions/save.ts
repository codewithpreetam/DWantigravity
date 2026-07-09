"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export type SaveOpportunityType = "JOB" | "INTERNSHIP" | "FELLOWSHIP" | "SCHOLARSHIP" | "GRANT" | "CONSULTANCY" | "VOLUNTEER" | "EVENT";

export async function toggleSaveOpportunity(opportunityId: string, type: SaveOpportunityType) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  
  const userId = session.user.id;
  const userRole = session.user.role;

  // Employers can only save Grants and Events
  if (userRole === "EMPLOYER" && type !== "GRANT" && type !== "EVENT") {
    throw new Error("Employers can only save grants and events");
  }

  // Check if it's already saved
  const existingSave = await db.savedJob.findFirst({
    where: {
      candidateId: userId,
      ...(type === "JOB" && { jobId: opportunityId }),
      ...(type === "INTERNSHIP" && { internshipId: opportunityId }),
      ...(type === "FELLOWSHIP" && { fellowshipId: opportunityId }),
      ...(type === "SCHOLARSHIP" && { scholarshipId: opportunityId }),
      ...(type === "GRANT" && { grantId: opportunityId }),
      ...(type === "CONSULTANCY" && { consultancyId: opportunityId }),
      ...(type === "VOLUNTEER" && { volunteerId: opportunityId }),
      ...(type === "EVENT" && { eventId: opportunityId }),
    },
  });

  if (existingSave) {
    // Unsave
    await db.savedJob.delete({
      where: { id: existingSave.id },
    });
    
    // Revalidate paths that might display saved state
    revalidatePath("/dashboard/candidate", "layout");
    revalidatePath("/dashboard/employer", "layout");
    
    return { saved: false };
  } else {
    // Save
    await db.savedJob.create({
      data: {
        candidateId: userId,
        ...(type === "JOB" && { jobId: opportunityId }),
        ...(type === "INTERNSHIP" && { internshipId: opportunityId }),
        ...(type === "FELLOWSHIP" && { fellowshipId: opportunityId }),
        ...(type === "SCHOLARSHIP" && { scholarshipId: opportunityId }),
        ...(type === "GRANT" && { grantId: opportunityId }),
        ...(type === "CONSULTANCY" && { consultancyId: opportunityId }),
        ...(type === "VOLUNTEER" && { volunteerId: opportunityId }),
        ...(type === "EVENT" && { eventId: opportunityId }),
      },
    });
    
    revalidatePath("/dashboard/candidate", "layout");
    revalidatePath("/dashboard/employer", "layout");
    
    return { saved: true };
  }
}
