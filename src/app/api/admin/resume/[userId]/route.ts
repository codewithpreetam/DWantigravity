import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    const { userId } = await params;

    // Verify Admin Authorization
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch user and resumeUrl
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { resumeUrl: true, name: true }
    });

    if (!user || !user.resumeUrl) {
      return new NextResponse("Resume not found", { status: 404 });
    }

    const isDownload = req.nextUrl.searchParams.get("download") === "1";
    const filename = `${user.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'candidate'}_resume`;

    // Handle Data URI (Base64)
    if (user.resumeUrl.startsWith("data:")) {
      const match = user.resumeUrl.match(/^data:(.*?);base64,(.*)$/);
      
      if (!match) {
        return new NextResponse("Invalid resume data format", { status: 400 });
      }

      const mimeType = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, "base64");
      
      // Map common mime types to extensions
      let ext = "pdf";
      if (mimeType === "application/msword") ext = "doc";
      if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ext = "docx";

      const headers = new Headers();
      headers.set("Content-Type", mimeType);
      
      if (isDownload) {
        headers.set("Content-Disposition", `attachment; filename="${filename}.${ext}"`);
      } else {
        headers.set("Content-Disposition", `inline; filename="${filename}.${ext}"`);
      }

      return new NextResponse(buffer, { headers, status: 200 });
    }

    // If it's an external URL (e.g. S3/Cloud Storage link), redirect securely
    // Or if we want to proxy it to obscure the real URL:
    try {
      const response = await fetch(user.resumeUrl);
      if (!response.ok) throw new Error("Failed to fetch external resume");
      
      const buffer = await response.arrayBuffer();
      const headers = new Headers();
      headers.set("Content-Type", response.headers.get("Content-Type") || "application/pdf");
      
      if (isDownload) {
        headers.set("Content-Disposition", `attachment; filename="${filename}.pdf"`);
      } else {
        headers.set("Content-Disposition", `inline; filename="${filename}.pdf"`);
      }

      return new NextResponse(buffer, { headers, status: 200 });
    } catch (e) {
      // Fallback redirect if proxying fails
      return NextResponse.redirect(user.resumeUrl);
    }
    
  } catch (error) {
    console.error("Admin Resume Fetch Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
