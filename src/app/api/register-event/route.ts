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
    const eventId = formData.get("eventId") as string;

    if (!eventId) {
      return new NextResponse("Missing eventId", { status: 400 });
    }

    // Check if already registered
    const existing = await db.registration.findFirst({
      where: { eventId, userId: session.user.id }
    });

    if (existing) {
      return NextResponse.redirect(new URL("/dashboard/candidate?status=already_registered", req.url), 303);
    }

    // Generate unique ticketing reference
    const ticketRef = `DW-EV-${eventId.substring(0, 4)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    await db.registration.create({
      data: {
        eventId,
        userId: session.user.id,
        qrCode: ticketRef,
        attended: false,
      },
    });

    return NextResponse.redirect(new URL("/events?status=registered", req.url), 303);
  } catch (error: any) {
    console.error("Error registering for event:", error);
    return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
  }
}
