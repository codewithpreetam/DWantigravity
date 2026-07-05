import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const body = await req.json();
    const { applicationId, stage, feedback, rating, tags } = body;

    if (!applicationId) {
      return NextResponse.json({ error: "applicationId is required" }, { status: 400 });
    }

    // Verify the recruiter owns the org that owns this application
    const recruiter = await db.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    });

    if (!recruiter?.organizationId || recruiter.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, any> = {};
    if (stage !== undefined) updateData.stage = stage;
    if (feedback !== undefined) updateData.feedback = feedback;
    if (rating !== undefined) updateData.rating = rating;
    if (tags !== undefined) updateData.tags = tags;

    const updated = await db.application.update({
      where: { id: applicationId },
      data: updateData,
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (err: any) {
    console.error("[ATS PATCH]", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Bulk stage update
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { applicationIds, stage } = body;

    if (!applicationIds?.length || !stage) {
      return NextResponse.json({ error: "applicationIds and stage are required" }, { status: 400 });
    }

    const recruiter = await db.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    });

    if (!recruiter?.organizationId || recruiter.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.application.updateMany({
      where: { id: { in: applicationIds } },
      data: { stage },
    });

    return NextResponse.json({ success: true, updatedCount: applicationIds.length });
  } catch (err: any) {
    console.error("[ATS POST BULK]", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
