import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SavedOpportunitiesProvider } from "@/components/SavedOpportunitiesProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DevelopmentWala.org | NGO Jobs & Social Impact Opportunities",
    template: "%s | DevelopmentWala.org",
  },
  description: "Discover jobs, fellowships, internships, grants, and volunteer opportunities in the Indian social impact and nonprofit development sector.",
  metadataBase: new URL("https://developmentwala.org"),
  openGraph: {
    title: "DevelopmentWala.org | NGO Jobs & Social Impact Opportunities",
    description: "Discover jobs, fellowships, internships, grants, and volunteer opportunities in the Indian social impact and nonprofit development sector.",
    url: "https://developmentwala.org",
    siteName: "DevelopmentWala.org",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google-site-verification-placeholder",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role || null;
  let savedIds: string[] = [];

  if (isLoggedIn && session.user.id) {
    const savedJobs = await db.savedJob.findMany({
      where: { candidateId: session.user.id },
      select: {
        jobId: true,
        internshipId: true,
        fellowshipId: true,
        scholarshipId: true,
        grantId: true,
        consultancyId: true,
        volunteerId: true,
        eventId: true,
      },
    });

    savedIds = savedJobs.map((job: any) => 
      job.jobId || job.internshipId || job.fellowshipId || job.scholarshipId || 
      job.grantId || job.consultancyId || job.volunteerId || job.eventId
    ).filter(Boolean) as string[];
  }

  return (
    <html lang="en" className="h-full overflow-x-hidden" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col overflow-x-hidden`}>
        <SavedOpportunitiesProvider initialSavedIds={savedIds} isLoggedIn={isLoggedIn} userRole={userRole}>
          <Toaster position="bottom-right" />
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </SavedOpportunitiesProvider>
      </body>
    </html>
  );
}
