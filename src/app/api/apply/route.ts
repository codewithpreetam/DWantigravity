import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const opportunityId = formData.get("opportunityId") as string;
    const type = formData.get("type") as string;

    // Disallow Employer users from applying to non-Grant/non-Event options
    if (session.user.role === "EMPLOYER") {
      if (type !== "GRANT" && type !== "EVENT") {
        return new NextResponse("Forbidden: Employers are only allowed to apply to Events and Grants.", { status: 403 });
      }
    }
    const resumeUrl = formData.get("resumeUrl") as string;
    const coverLetter = formData.get("coverLetter") as string;

    if (!opportunityId || !resumeUrl || !coverLetter) {
      return new NextResponse("Bad Request: Missing parameters", { status: 400 });
    }

    // Set target field based on type
    const data: any = {
      candidateId: session.user.id,
      resumeUrl,
      coverLetter,
      stage: "APPLIED",
    };

    switch (type) {
      case "JOB":
        data.jobId = opportunityId;
        break;
      case "INTERNSHIP":
        data.internshipId = opportunityId;
        break;
      case "FELLOWSHIP":
        data.fellowshipId = opportunityId;
        break;
      case "SCHOLARSHIP":
        data.scholarshipId = opportunityId;
        break;
      case "GRANT":
        data.grantId = opportunityId;
        break;
      case "CONSULTANCY":
        data.consultancyId = opportunityId;
        break;
      case "VOLUNTEER":
        data.volunteerId = opportunityId;
        break;
      case "EVENT":
        data.eventId = opportunityId;
        break;
      default:
        return new NextResponse("Invalid opportunity type", { status: 400 });
    }

    await db.application.create({ data });

    // Redirect to Candidate Dashboard on success
    return NextResponse.redirect(new URL("/dashboard/candidate?status=applied", req.url), 303);
  } catch (error: any) {
    console.error("Error creating application:", error);
    return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
  }
}
