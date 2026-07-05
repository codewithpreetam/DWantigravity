import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col`}>
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
