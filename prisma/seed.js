const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("Cleaning up database...");
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.application.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.job.deleteMany();
  await prisma.internship.deleteMany();
  await prisma.fellowship.deleteMany();
  await prisma.scholarship.deleteMany();
  await prisma.grant.deleteMany();
  await prisma.consultancy.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding categories...");
  const catEducation = await prisma.category.create({ data: { name: "Education" } });
  const catLivelihoods = await prisma.category.create({ data: { name: "Livelihoods & Skill Development" } });
  const catHealthcare = await prisma.category.create({ data: { name: "Healthcare & Nutrition" } });
  const catEnvironment = await prisma.category.create({ data: { name: "Environment & Sanitation" } });
  const catDisaster = await prisma.category.create({ data: { name: "Disaster Response" } });

  console.log("Seeding users...");
  const hashedPassword = hashPassword("password123");

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@developmentwala.org",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const employer1 = await prisma.user.create({
    data: {
      name: "Anshu Gupta",
      email: "anshu@goonj.org",
      password: hashedPassword,
      role: "EMPLOYER",
    },
  });

  const employer2 = await prisma.user.create({
    data: {
      name: "Madhav Chavan",
      email: "madhav@pratham.org",
      password: hashedPassword,
      role: "EMPLOYER",
    },
  });

  const seeker = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: "seeker@developmentwala.org",
      password: hashedPassword,
      role: "SEEKER",
      resumeUrl: "https://example.com/aarav_resume.pdf",
      skills: ["Project Management", "Field Research", "Data Analysis", "Report Writing"],
      experience: "3 years in education research",
      bio: "Passionate about implementing community-driven education programs in rural India.",
    },
  });

  console.log("Seeding organizations...");
  const goonj = await prisma.organization.create({
    data: {
      name: "Goonj",
      logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aba9?w=100&h=100&fit=crop",
      website: "https://goonj.org",
      description: "Goonj is a multi-award winning social enterprise using material as a resource to bridge the gap between urban surplus and rural resource-poor settings.",
      status: "APPROVED",
      ownerId: employer1.id,
    },
  });

  // Link employer1 to goonj organization
  await prisma.user.update({
    where: { id: employer1.id },
    data: { organizationId: goonj.id },
  });

  const pratham = await prisma.organization.create({
    data: {
      name: "Pratham Education Foundation",
      logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aba9?w=100&h=100&fit=crop",
      website: "https://pratham.org",
      description: "Pratham is one of the largest non-governmental organizations in India, focusing on high-quality, low-cost, and replicable interventions to address gaps in the education system.",
      status: "APPROVED",
      ownerId: employer2.id,
    },
  });

  // Link employer2 to pratham organization
  await prisma.user.update({
    where: { id: employer2.id },
    data: { organizationId: pratham.id },
  });

  console.log("Seeding opportunities...");
  
  // Jobs
  const job1 = await prisma.job.create({
    data: {
      title: "Program Manager - Rural Livelihoods",
      description: "Oversee Goonj's rural livelihoods program. You will plan, execute, and monitor resource-based income generation schemes across Madhya Pradesh and Bihar. Strong community mobilization skills required.",
      requirements: "Master's degree in Social Work or Rural Development. Minimum 3 years of field experience.",
      location: "Bhopal, Madhya Pradesh",
      salaryMin: 500000,
      salaryMax: 700000,
      organizationId: goonj.id,
      categoryId: catLivelihoods.id,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: "Program Associate - Early Childhood Education",
      description: "Design and implement learning activities for young kids (ages 3-6) in community centers in underserved urban slums.",
      requirements: "Bachelor's degree in Education, Psychology, or Social Work. Fluency in Hindi.",
      location: "Mumbai, Maharashtra",
      salaryMin: 350000,
      salaryMax: 450000,
      organizationId: pratham.id,
      categoryId: catEducation.id,
    },
  });

  // Internships
  const intern1 = await prisma.internship.create({
    data: {
      title: "Social Work & Operations Intern",
      description: "Assist with sorting, processing, and distribution of clothing and material resources at Goonj processing centers. Learn field operations firsthand.",
      requirements: "Undergrad students in social sciences preferred. Ready to work in field settings.",
      location: "New Delhi, Delhi",
      stipend: 10000,
      durationMonths: 3,
      organizationId: goonj.id,
      categoryId: catDisaster.id,
    },
  });

  // Fellowships
  const fellow1 = await prisma.fellowship.create({
    data: {
      title: "Rural Development Fellow 2026",
      description: "A prestigious 12-month residential fellowship program. Fellows will reside in rural communities and drive grassroots development initiatives around water sanitation and hygiene.",
      requirements: "Graduates from any stream. Age under 28. Strong commitment to social change.",
      location: "Rural Rajasthan",
      stipend: 25000,
      durationMonths: 12,
      organizationId: goonj.id,
      categoryId: catEnvironment.id,
    },
  });

  // Scholarships
  const scholar1 = await prisma.scholarship.create({
    data: {
      title: "Pratham Read India Scholars Program",
      description: "Financial grant program supporting meritorious girls from rural backgrounds pursuing higher education in education research or developmental sciences.",
      requirements: "Family income under 2.5 LPA. Minimum 75% in Class 12 exams.",
      amount: 50000,
      organizationId: pratham.id,
      categoryId: catEducation.id,
    },
  });

  // Grants
  const grant1 = await prisma.grant.create({
    data: {
      title: "Primary Education Innovation Grant",
      description: "Call for proposals from grassroots community organizations running innovative projects to improve foundational literacy and numeracy among first-generation learners.",
      requirements: "Registered NGO with 12A/80G status. Minimum 2 years of audit history.",
      amount: 1500000,
      deadline: new Date("2026-10-31"),
      organizationId: pratham.id,
      categoryId: catEducation.id,
    },
  });

  // Consultancies
  const consult1 = await prisma.consultancy.create({
    data: {
      title: "Impact Evaluator - Digital Learning Program",
      description: "Consultancy role to evaluate the learning outcomes of Pratham's tablets-based digital education initiative across 50 rural schools.",
      requirements: "Ph.D. or Master's in Economics, Statistics, or Education. Strong quantitative analysis skills.",
      location: "Remote / Pune",
      budget: 300000,
      organizationId: pratham.id,
      categoryId: catEducation.id,
    },
  });

  // Volunteers
  const volunteer1 = await prisma.volunteer.create({
    data: {
      title: "Monsoon Relief Material Volunteer",
      description: "Help pack and coordinate urgent relief material (food, sanitation kits) for communities affected by monsoon floods in eastern states.",
      requirements: "Minimum availability of 4 hours on weekends. Physical strength is a plus.",
      location: "Kolkata, West Bengal",
      organizationId: goonj.id,
      categoryId: catDisaster.id,
    },
  });

  console.log("Seeding applications & ATS...");
  const app1 = await prisma.application.create({
    data: {
      stage: "SHORTLISTED",
      resumeUrl: "https://example.com/aarav_resume.pdf",
      coverLetter: "I would love to manage Goonj's rural livelihoods programs in MP.",
      feedback: "Strong background, fit for interview phase.",
      candidateId: seeker.id,
      jobId: job1.id,
    },
  });

  console.log("Seeding events...");
  const event1 = await prisma.event.create({
    data: {
      title: "National CSR & NGO Collaboration Summit 2026",
      description: "Bringing together India's top corporate donors, foundations, and grassroots NGOs to align programs and discuss funding paradigms for climate-resilient livelihoods.",
      date: new Date("2026-11-15T09:00:00Z"),
      location: "India Habitat Centre, New Delhi",
      format: "HYBRID",
      organizerId: goonj.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: "Webinar: Designing Grassroots Literacy Interventions",
      description: "Learn how Pratham executes low-cost high-impact teaching methods. Learn teaching templates and community outreach scripts.",
      date: new Date("2026-08-20T15:00:00Z"),
      location: "Zoom Video Call",
      format: "WEBINAR",
      organizerId: pratham.id,
    },
  });

  console.log("Seeding registrations...");
  await prisma.registration.create({
    data: {
      qrCode: "DW-EV-SUMMIT-2601",
      certificateUrl: null,
      attended: false,
      eventId: event1.id,
      userId: seeker.id,
    },
  });

  console.log("Seeding blogs...");
  await prisma.blog.create({
    data: {
      title: "How to Design a Winning Project Proposal for Corporate CSR Grants",
      content: "Indian CSR funding has strict compliance mandates. In this post, we discuss how to draft logical frameworks (logframes), formulate budgets, and define indicators that corporate social responsibility teams look for in NGO partners...",
      published: true,
      authorId: admin.id,
      categoryId: catLivelihoods.id,
    },
  });

  await prisma.blog.create({
    data: {
      title: "Preparing for the Rural Fellowship: A Complete Guide",
      content: "Living in a rural community presents unique challenges and rewards. Here is a compilation of survival tips, community integration guidelines, and essential field tools from our alumni fellows...",
      published: true,
      authorId: admin.id,
      categoryId: catEnvironment.id,
    },
  });

  console.log("Seeding subscriptions...");
  await prisma.subscription.create({
    data: {
      plan: "GROWTH",
      active: true,
      expiresAt: new Date("2027-01-01"),
      organizationId: goonj.id,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
