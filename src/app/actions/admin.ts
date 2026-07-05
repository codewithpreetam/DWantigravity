"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { OrgStatus } from "@prisma/client";

export async function approveOrganizationAction(orgId: string, status: OrgStatus) {
  try {
    await db.organization.update({
      where: { id: orgId },
      data: { status },
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/organizations");
    return { success: true };
  } catch (error: any) {
    console.error("Admin approval error:", error);
    return { error: error.message };
  }
}
