export const categories = [
  { id: "cat-1", name: "Education" },
  { id: "cat-2", name: "Livelihoods & Skill Development" },
  { id: "cat-3", name: "Healthcare & Nutrition" },
  { id: "cat-4", name: "Environment & Sanitation" },
  { id: "cat-5", name: "Disaster Response" }
];

export const organizations = [
  {
    id: "org-1",
    name: "Goonj",
    logo: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=120&h=120&fit=crop",
    coverBanner: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&h=400&fit=crop",
    website: "https://goonj.org",
    description: "Goonj is a multi-award winning social impact organization using material as a resource to bridge the gap between urban surplus and rural resource-poor settings.",
    mission: "To make clothing a matter of concern and dignity, instead of charity.",
    vision: "An equitable society where material resource-poor rural communities thrive with self-respect.",
    areasOfWork: ["Rural Development", "Disaster Relief", "Material Re-use"],
    sdgs: ["No Poverty", "Good Health and Well-being", "Decent Work and Economic Growth"],
    causeAreas: ["Disaster Relief", "Livelihoods", "Clothing Dignity"],
    orgType: "NGO",
    registrationNumber: "S-34567/1999",
    yearFounded: 1999,
    headquarters: "New Delhi, Delhi",
    additionalLocations: ["Mumbai", "Kolkata", "Bengaluru"],
    orgSize: "201-500",
    employeesCount: 350,
    volunteersCount: 2000,
    annualBudget: "₹15 Crores",
    hiringStatus: true,
    careersPage: "https://goonj.org/careers",
    linkedin: "https://linkedin.com/company/goonj",
    facebook: "https://facebook.com/goonj.org",
    instagram: "https://instagram.com/goonj",
    twitter: "https://twitter.com/goonj",
    youtube: "https://youtube.com/goonj",
    email: "mail@goonj.org",
    phone: "+91-11-41372654",
    status: "APPROVED",
    ownerId: "user-employer-1"
  },
  {
    id: "org-2",
    name: "Pratham Education Foundation",
    logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&h=120&fit=crop",
    coverBanner: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=400&fit=crop",
    website: "https://pratham.org",
    description: "Pratham is one of the largest non-governmental organizations in India, focusing on high-quality, low-cost, and replicable educational interventions.",
    mission: "Every child in school and learning well.",
    vision: "To improve the quality of education and learning outcomes for underprivileged children across India.",
    areasOfWork: ["Elementary Education", "Vocational Training", "Digital Learning"],
    sdgs: ["Quality Education", "Gender Equality", "Decent Work and Economic Growth"],
    causeAreas: ["Education", "Child Development", "Skill Training"],
    orgType: "NGO",
    registrationNumber: "F-18903/1995",
    yearFounded: 1995,
    headquarters: "Mumbai, Maharashtra",
    additionalLocations: ["New Delhi", "Pune", "Patna"],
    orgSize: "501+",
    employeesCount: 1200,
    volunteersCount: 5000,
    annualBudget: "₹45 Crores",
    hiringStatus: true,
    careersPage: "https://pratham.org/careers",
    linkedin: "https://linkedin.com/company/pratham",
    facebook: "https://facebook.com/pratham",
    instagram: "https://instagram.com/pratham",
    twitter: "https://twitter.com/pratham",
    youtube: "https://youtube.com/pratham",
    email: "info@pratham.org",
    phone: "+91-22-22819561",
    status: "APPROVED",
    ownerId: "user-employer-2"
  }
];

export const users = [
  {
    id: "user-admin",
    name: "Admin User",
    email: "admin@developmentwala.org",
    role: "ADMIN",
    password: "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f" // sha256 of password123
  },
  {
    id: "user-employer-1",
    name: "Anshu Gupta",
    email: "anshu@goonj.org",
    role: "EMPLOYER",
    organizationId: "org-1",
    profilePhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    jobTitle: "Founder & Director",
    department: "Executive Committee",
    shortBio: "Social entrepreneur focusing on clothing dignity and disaster relief in rural India.",
    aboutMe: "Founded Goonj in 1999 to turn discarded clothes into a resource for rural development projects.",
    phone: "+91-9810012345",
    linkedin: "https://linkedin.com/in/anshugupta-goonj",
    website: "https://anshugupta.org",
    twitter: "https://twitter.com/anshugoonj",
    officeLocation: "Headquarters, New Delhi",
    team: "Leadership Team",
    roleInOrg: "Owner",
    password: "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
  },
  {
    id: "user-employer-2",
    name: "Madhav Chavan",
    email: "madhav@pratham.org",
    role: "EMPLOYER",
    organizationId: "org-2",
    profilePhoto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop",
    jobTitle: "Co-Founder & President",
    department: "Education Board",
    shortBio: "Pioneering learning-improvement strategies for children in India.",
    aboutMe: "Co-founded Pratham in 1995 to ensure learning opportunities for children in urban slum areas of Mumbai.",
    phone: "+91-9820054321",
    linkedin: "https://linkedin.com/in/madhavchavan",
    website: "https://pratham.org",
    twitter: "https://twitter.com/madhavpratham",
    officeLocation: "Central Office, Mumbai",
    team: "Education Board Team",
    roleInOrg: "Owner",
    password: "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
  },
  {
    id: "user-seeker",
    name: "Aarav Sharma",
    email: "seeker@developmentwala.org",
    role: "SEEKER",
    resumeUrl: "https://example.com/aarav_resume.pdf",
    skills: ["Project Management", "Field Research", "Data Analysis", "Report Writing"],
    experience: "3 years in education research",
    bio: "Passionate about implementing community-driven education programs in rural India.",
    password: "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
  }
];

export const jobs = [
  {
    id: "job-1",
    title: "Program Manager - Rural Livelihoods",
    description: "Oversee Goonj's rural livelihoods program. You will plan, execute, and monitor resource-based income generation schemes across Madhya Pradesh and Bihar. Strong community mobilization skills required.",
    requirements: "Master's degree in Social Work or Rural Development. Minimum 3 years of field experience.",
    location: "Bhopal, Madhya Pradesh",
    salaryMin: 500000,
    salaryMax: 700000,
    employmentType: "FULL_TIME",
    isRemote: false,
    workMode: "ON_SITE",
    isActive: true,
    organizationId: "org-1",
    categoryId: "cat-2",
    postedById: "user-employer-1",
    createdAt: new Date("2026-06-01")
  },
  {
    id: "job-2",
    title: "Program Associate - Early Childhood Education",
    description: "Design and implement learning activities for young kids (ages 3-6) in community centers in underserved urban slums.",
    requirements: "Bachelor's degree in Education, Psychology, or Social Work. Fluency in Hindi.",
    location: "Mumbai, Maharashtra",
    salaryMin: 350000,
    salaryMax: 450000,
    employmentType: "FULL_TIME",
    isRemote: true,
    workMode: "REMOTE",
    isActive: true,
    organizationId: "org-2",
    categoryId: "cat-1",
    postedById: "user-employer-2",
    createdAt: new Date("2026-06-15")
  }
];

export const internships = [
  {
    id: "intern-1",
    title: "Social Work & Operations Intern",
    description: "Assist with sorting, processing, and distribution of clothing and material resources at Goonj processing centers. Learn field operations firsthand.",
    requirements: "Undergrad students in social sciences preferred. Ready to work in field settings.",
    location: "New Delhi, Delhi",
    stipend: 10000,
    durationMonths: 3,
    isActive: true,
    organizationId: "org-1",
    categoryId: "cat-5",
    postedById: "user-employer-1",
    createdAt: new Date("2026-06-20")
  }
];

export const fellowships = [
  {
    id: "fellow-1",
    title: "Rural Development Fellowship 2026",
    description: "A prestigious 12-month residential fellowship program. Fellows will reside in rural communities and drive grassroots development initiatives around water sanitation and hygiene.",
    requirements: "Graduates from any stream. Age under 28. Strong commitment to social change.",
    location: "Rural Rajasthan",
    stipend: 25000,
    durationMonths: 12,
    isActive: true,
    organizationId: "org-1",
    categoryId: "cat-4",
    postedById: "user-employer-1",
    createdAt: new Date("2026-06-25")
  }
];

export const scholarships = [
  {
    id: "scholar-1",
    title: "Pratham Read India Scholars Program",
    description: "Financial grant program supporting meritorious girls from rural backgrounds pursuing higher education in education research or developmental sciences.",
    requirements: "Family income under 2.5 LPA. Minimum 75% in Class 12 exams.",
    amount: 50000,
    isActive: true,
    organizationId: "org-2",
    categoryId: "cat-1",
    postedById: "user-employer-2",
    createdAt: new Date("2026-06-10")
  }
];

export const grants = [
  {
    id: "grant-1",
    title: "Primary Education Innovation Grant",
    description: "Call for proposals from grassroots community organizations running innovative projects to improve foundational literacy and numeracy among first-generation learners.",
    requirements: "Registered NGO with 12A/80G status. Minimum 2 years of audit history.",
    amount: 1500000,
    deadline: new Date("2026-10-31"),
    isActive: true,
    organizationId: "org-2",
    categoryId: "cat-1",
    createdAt: new Date("2026-06-12")
  }
];

export const consultancies = [
  {
    id: "consult-1",
    title: "Impact Evaluator - Digital Learning Program",
    description: "Consultancy role to evaluate the learning outcomes of Pratham's tablets-based digital education initiative across 50 rural schools.",
    requirements: "Ph.D. or Master's in Economics, Statistics, or Education. Strong quantitative analysis skills.",
    location: "Remote / Pune",
    budget: 300000,
    isActive: true,
    organizationId: "org-2",
    categoryId: "cat-1",
    createdAt: new Date("2026-06-18")
  }
];

export const volunteers = [
  {
    id: "volunteer-1",
    title: "Monsoon Relief Material Volunteer",
    description: "Help pack and coordinate urgent relief material (food, sanitation kits) for communities affected by monsoon floods in eastern states.",
    requirements: "Minimum availability of 4 hours on weekends. Physical strength is a plus.",
    location: "Kolkata, West Bengal",
    isActive: true,
    organizationId: "org-1",
    categoryId: "cat-5",
    createdAt: new Date("2026-06-22")
  }
];

export const applications = [
  {
    id: "app-1",
    stage: "SHORTLISTED",
    resumeUrl: "https://example.com/aarav_resume.pdf",
    coverLetter: "I would love to manage Goonj's rural livelihoods programs in MP.",
    feedback: "Strong background, fit for interview phase.",
    candidateId: "user-seeker",
    jobId: "job-1",
    createdAt: new Date("2026-06-05")
  }
];

export const events = [
  {
    id: "event-1",
    title: "National CSR & NGO Collaboration Summit 2026",
    description: "Bringing together India's top corporate donors, foundations, and grassroots NGOs to align programs and discuss funding paradigms for climate-resilient livelihoods.",
    date: new Date("2026-11-15T09:00:00Z"),
    location: "India Habitat Centre, New Delhi",
    format: "HYBRID",
    organizerId: "org-1",
    createdAt: new Date("2026-06-01")
  },
  {
    id: "event-2",
    title: "Webinar: Designing Grassroots Literacy Interventions",
    description: "Learn how Pratham executes low-cost high-impact teaching methods. Learn teaching templates and community outreach scripts.",
    date: new Date("2026-08-20T15:00:00Z"),
    location: "Zoom Video Call",
    format: "WEBINAR",
    organizerId: "org-2",
    createdAt: new Date("2026-06-10")
  }
];

export const registrations = [
  {
    id: "reg-1",
    qrCode: "DW-EV-SUMMIT-2601",
    certificateUrl: null,
    attended: false,
    eventId: "event-1",
    userId: "user-seeker",
    createdAt: new Date("2026-06-05")
  }
];

export const blogs = [
  {
    id: "blog-1",
    title: "How to Design a Winning Project Proposal for Corporate CSR Grants",
    content: "Indian CSR funding has strict compliance mandates. In this post, we discuss how to draft logical frameworks (logframes), formulate budgets, and define indicators that corporate social responsibility teams look for in NGO partners...",
    published: true,
    authorId: "user-admin",
    categoryId: "cat-2",
    createdAt: new Date("2026-06-25")
  },
  {
    id: "blog-2",
    title: "Preparing for the Rural Fellowship: A Complete Guide",
    content: "Living in a rural community presents unique challenges and rewards. Here is a compilation of survival tips, community integration guidelines, and essential field tools from our alumni fellows...",
    published: true,
    authorId: "user-admin",
    categoryId: "cat-4",
    createdAt: new Date("2026-06-26")
  }
];

export const subscriptions = [
  {
    id: "sub-1",
    plan: "GROWTH",
    active: true,
    expiresAt: new Date("2027-01-01"),
    organizationId: "org-1"
  }
];
