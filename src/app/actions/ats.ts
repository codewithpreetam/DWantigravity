"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ApplicationStage } from "@prisma/client";

export async function updateApplicationStage(
  applicationId: string, 
  stage: ApplicationStage, 
  feedback?: string
) {
  try {
    const data: any = { stage };
    if (feedback !== undefined) {
      data.feedback = feedback;
    }

    await db.application.update({
      where: { id: applicationId },
      data,
    });

    revalidatePath("/dashboard/employer");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating stage:", error);
    return { error: error.message };
  }
}
