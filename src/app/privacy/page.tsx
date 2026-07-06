import type { Metadata } from "next";
import Link from "next/link";
import { Shield, User, Briefcase, Building2, KeyRound, Megaphone, MessageSquare, Cpu, Cookie, Lock, Clock, UserCheck, Globe, Link2, Baby, Pencil, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how DevelopmentWala.org collects, uses, stores, and protects your personal information. Read our full privacy policy.",
};

/* ─── section data ─── */

const sections = [
  {
    id: "about",
    number: "1",
    title: "About DevelopmentWala.org",
    icon: Briefcase,
    content: (
      <>
        <p>
          DevelopmentWala.org is an online platform dedicated to connecting individuals and organizations with
          opportunities in the social and development sector, including jobs, internships, fellowships, grants,
          scholarships, volunteering opportunities, consultancies, and events.
        </p>
        <p>
          DevelopmentWala.org is managed by <strong>Development Wala</strong>.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    number: "2",
    title: "Information We Collect",
    icon: User,
    content: (
      <>
        <p>Depending on how you use our platform, we may collect the following information.</p>

        <h4>Personal Information</h4>
        <ul>
          <li>Full Name</li>
          <li>Email Address</li>
          <li>Phone Number</li>
          <li>Profile Photograph</li>
          <li>Date of Birth (if provided)</li>
          <li>Gender (optional)</li>
          <li>Location</li>
          <li>Country</li>
          <li>State</li>
          <li>City</li>
        </ul>

        <h4>Professional Information</h4>
        <ul>
          <li>Resume / CV</li>
          <li>Cover Letter</li>
          <li>Educational Qualifications</li>
          <li>Work Experience</li>
          <li>Skills</li>
          <li>Certifications</li>
          <li>Languages</li>
          <li>LinkedIn Profile</li>
          <li>Portfolio Website</li>
          <li>Other professional links</li>
        </ul>

        <h4>Organization Information</h4>
        <p>For employer accounts, we may collect:</p>
        <ul>
          <li>Organization Name</li>
          <li>Organization Description</li>
          <li>Logo</li>
          <li>Website</li>
          <li>Social Media Links</li>
          <li>Contact Details</li>
          <li>Organization Type</li>
          <li>Office Location</li>
          <li>Recruiter Information</li>
        </ul>

        <h4>Account Information</h4>
        <p>When creating an account, we may collect:</p>
        <ul>
          <li>Username</li>
          <li>Password (encrypted)</li>
          <li>Login Activity</li>
          <li>Account Preferences</li>
          <li>Notification Preferences</li>
        </ul>

        <h4>Opportunity Information</h4>
        <p>Employers may provide information relating to:</p>
        <ul>
          <li>Jobs</li>
          <li>Internships</li>
          <li>Fellowships</li>
          <li>Scholarships</li>
          <li>Grants</li>
          <li>Volunteer Opportunities</li>
          <li>Events</li>
          <li>Consultancies</li>
        </ul>

        <h4>Communication Information</h4>
        <p>When you contact us, we may collect:</p>
        <ul>
          <li>Emails</li>
          <li>Messages</li>
          <li>Feedback</li>
          <li>Support Requests</li>
          <li>Survey Responses</li>
        </ul>

        <h4>Technical Information</h4>
        <p>We may automatically collect:</p>
        <ul>
          <li>IP Address</li>
          <li>Browser Type</li>
          <li>Device Information</li>
          <li>Operating System</li>
          <li>Referring URLs</li>
          <li>Date and Time of Access</li>
          <li>Pages Visited</li>
          <li>Session Information</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    number: "3",
    title: "How We Use Your Information",
    icon: Cpu,
    content: (
      <>
        <p>We use your information to:</p>
        <ul>
          <li>Create and manage user accounts.</li>
          <li>Allow employers to post opportunities.</li>
          <li>Allow candidates to apply for opportunities.</li>
          <li>Match candidates with suitable opportunities.</li>
          <li>Facilitate communication between employers and applicants.</li>
          <li>Improve platform functionality and user experience.</li>
          <li>Respond to enquiries and support requests.</li>
          <li>Send important account notifications.</li>
          <li>Prevent fraud and misuse of the platform.</li>
          <li>Maintain platform security.</li>
          <li>Comply with legal obligations.</li>
        </ul>
      </>
    ),
  },
  {
    id: "recruitment",
    number: "4",
    title: "Recruitment Process",
    icon: Megaphone,
    content: (
      <>
        <p>
          When candidates apply for an opportunity, the information they submit becomes available to the respective
          employer or organization responsible for that opportunity.
        </p>
        <p>This may include:</p>
        <ul>
          <li>Resume</li>
          <li>Cover Letter</li>
          <li>Contact Details</li>
          <li>Professional Information</li>
          <li>Application Responses</li>
          <li>Supporting Documents</li>
        </ul>
        <p>
          DevelopmentWala.org is not responsible for how employers use candidate information after it has been shared
          through the recruitment process.
        </p>
      </>
    ),
  },
  {
    id: "employer-responsibilities",
    number: "5",
    title: "Employer Responsibilities",
    icon: Building2,
    content: (
      <>
        <p>Organizations using DevelopmentWala.org are responsible for:</p>
        <ul>
          <li>Protecting applicant information.</li>
          <li>Using applicant data only for legitimate recruitment purposes.</li>
          <li>Complying with applicable privacy and employment laws.</li>
          <li>Not sharing applicant information with unauthorized third parties.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    number: "6",
    title: "Cookies",
    icon: Cookie,
    content: (
      <>
        <p>DevelopmentWala.org may use cookies and similar technologies to:</p>
        <ul>
          <li>Maintain user sessions.</li>
          <li>Remember preferences.</li>
          <li>Improve website performance.</li>
          <li>Analyze website traffic.</li>
          <li>Enhance user experience.</li>
        </ul>
        <p>
          Users may disable cookies through their browser settings; however, some features of the website may not
          function properly.
        </p>
      </>
    ),
  },
  {
    id: "data-security",
    number: "7",
    title: "Data Security",
    icon: Lock,
    content: (
      <>
        <p>We implement reasonable technical and organizational measures to protect your information against:</p>
        <ul>
          <li>Unauthorized access</li>
          <li>Data loss</li>
          <li>Misuse</li>
          <li>Alteration</li>
          <li>Disclosure</li>
        </ul>
        <p>
          While we strive to protect your information, no internet transmission or electronic storage system can be
          guaranteed to be completely secure.
        </p>
      </>
    ),
  },
  {
    id: "data-retention",
    number: "8",
    title: "Data Retention",
    icon: Clock,
    content: (
      <>
        <p>We retain your information only for as long as necessary to:</p>
        <ul>
          <li>Provide our services.</li>
          <li>Maintain recruitment records.</li>
          <li>Meet legal and regulatory requirements.</li>
          <li>Resolve disputes.</li>
          <li>Enforce our policies.</li>
        </ul>
        <p>Users may request deletion of their accounts, subject to applicable legal obligations.</p>
      </>
    ),
  },
  {
    id: "your-rights",
    number: "9",
    title: "Your Rights",
    icon: UserCheck,
    content: (
      <>
        <p>Depending on applicable laws, you may have the right to:</p>
        <ul>
          <li>Access your personal information.</li>
          <li>Update your information.</li>
          <li>Correct inaccurate information.</li>
          <li>Delete your account.</li>
          <li>Withdraw consent where applicable.</li>
          <li>Request a copy of your personal data.</li>
          <li>Object to certain processing activities.</li>
        </ul>
        <p>Requests may be submitted via email.</p>
      </>
    ),
  },
  {
    id: "third-party",
    number: "10",
    title: "Third-Party Services",
    icon: Link2,
    content: (
      <>
        <p>DevelopmentWala.org may include links or integrations with third-party platforms such as:</p>
        <ul>
          <li>LinkedIn</li>
          <li>Google</li>
          <li>WhatsApp</li>
          <li>YouTube</li>
          <li>Social Media Platforms</li>
          <li>External Application Portals</li>
        </ul>
        <p>
          We are not responsible for the privacy practices of third-party websites or services. Users should review the
          privacy policies of those services separately.
        </p>
      </>
    ),
  },
  {
    id: "children",
    number: "11",
    title: "Children's Privacy",
    icon: Baby,
    content: (
      <>
        <p>
          DevelopmentWala.org is intended for users who are at least 18 years of age or who are legally permitted to use
          recruitment platforms under applicable laws.
        </p>
        <p>We do not knowingly collect personal information from children.</p>
      </>
    ),
  },
  {
    id: "international",
    number: "12",
    title: "International Users",
    icon: Globe,
    content: (
      <p>
        Users may access DevelopmentWala.org from different countries. By using our platform, you understand that your
        information may be processed and stored in accordance with applicable laws where our services are operated.
      </p>
    ),
  },
  {
    id: "changes",
    number: "13",
    title: "Changes to this Privacy Policy",
    icon: Pencil,
    content: (
      <>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our services, legal requirements,
          or operational practices.
        </p>
        <p>The updated version will be published on this page along with the revised effective date.</p>
        <p>
          Your continued use of DevelopmentWala.org after any changes constitutes your acceptance of the updated Privacy
          Policy.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    number: "14",
    title: "Contact Us",
    icon: Mail,
    content: (
      <>
        <p>
          If you have any questions, concerns, or requests regarding this Privacy Policy or the handling of your
          personal information, please contact us:
        </p>
        <p>
          <strong>DevelopmentWala.org</strong>
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:jobboard@developmentwala.org" className="text-primary hover:underline">
            jobboard@developmentwala.org
          </a>
        </p>
      </>
    ),
  },
];

/* ─── page component ─── */

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-10">
      {/* ── Hero / Header ── */}
      <div className="text-center space-y-4 flex flex-col items-center">
        <div className="p-4 bg-primary/10 text-primary rounded-2xl w-fit">
          <Shield className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Privacy Policy</h1>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted">
          <span>
            <strong className="text-foreground">Effective Date:</strong> 06 July 2026
          </span>
          <span className="hidden sm:inline">•</span>
          <span>
            <strong className="text-foreground">Last Updated:</strong> 06 July 2026
          </span>
        </div>
        <p className="text-sm text-muted max-w-2xl mx-auto leading-relaxed">
          Welcome to <strong className="text-foreground">DevelopmentWala.org</strong> (&ldquo;we,&rdquo;
          &ldquo;our,&rdquo; or &ldquo;us&rdquo;). Your privacy is important to us, and we are committed to
          protecting the personal information you share while using our platform.
        </p>
        <p className="text-xs text-muted max-w-xl mx-auto leading-relaxed">
          If you have any questions regarding this Privacy Policy, please contact us at:{" "}
          <a href="mailto:jobboard@developmentwala.org" className="text-primary hover:underline font-medium">
            jobboard@developmentwala.org
          </a>
        </p>
      </div>

      {/* ── Quick‑nav Table of Contents ── */}
      <nav className="glass-panel rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-bold text-foreground tracking-wide uppercase">Table of Contents</h2>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-muted list-none">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <span className="text-primary font-semibold">{s.number}.</span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* ── Sections ── */}
      <div className="space-y-6">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <section
              key={s.id}
              id={s.id}
              className="glass-panel rounded-xl p-6 sm:p-8 space-y-4 scroll-mt-24"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg shrink-0 mt-0.5">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground leading-tight">
                  {s.number}. {s.title}
                </h3>
              </div>
              <div className="privacy-prose text-xs text-muted leading-relaxed space-y-3 pl-0 sm:pl-[3.25rem]">
                {s.content}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Bottom effective dates ── */}
      <div className="glass-panel rounded-xl p-6 text-center space-y-1 text-xs text-muted">
        <p>
          <strong className="text-foreground">Effective Date:</strong> 06 July 2026
        </p>
        <p>
          <strong className="text-foreground">Last Updated:</strong> 06 July 2026
        </p>
      </div>

      {/* ── Back to home ── */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
