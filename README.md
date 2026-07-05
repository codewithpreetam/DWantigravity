# DevelopmentWala.org

**DevelopmentWala.org** is a premium, production-ready opportunity and recruitment management platform for the Indian nonprofit and social development sector. Inspired by CharityJob, it bridges the gap between verified NGOs, CSR funding agencies, and passionate professionals.

---

## 🚀 Key Modules Built

- **Unified Feeds**: Individual, searchable directory lists for:
  - Jobs (Salary ranges, local maps, full-time contracts)
  - Fellowships (Stipends, rural durations)
  - Internships (Stipends, student tracks)
  - Grants & CSR Proposals (Funding amounts, PDF uploads)
  - Consultancies (Budgets, advisory contracts)
  - Volunteers (Aid dispatch, weekend relief)
- **Visual ATS Kanban Board**: Live drag-and-stage-select pipeline tracker (Applied, Screening, Shortlisted, Interview, Offer, Hired, Rejected) with feedback note logging.
- **Ticketing & Events**: QR-ticket generation for webinars, workshops, and collaboration conferences.
- **AI Career Tools**: Instant AI Seeker Profile Resume analysis scoring and sector opening matches.
- **Glassmorphic Theme**: A stunning UI designed with custom emerald/indigo theme variables, translucent panels, and native dark/light mode toggle support.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 16.2 (App Router)
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **Database ORM**: Prisma 7 (PostgreSQL native configuration)
- **Authentication**: Auth.js (NextAuth v5 Credentials Provider)
- **State Management**: Server Components & Server Actions (React 19)
- **Containerization**: Multi-stage production `Dockerfile`

### 💡 Graceful Local Fallback Proxy (No DB Setup Required!)
To ensure the platform runs instantly out-of-the-box in development environments without needing a live PostgreSQL database:
1. **Dynamic Connection Check**: The database client helper `src/lib/db.ts` checks if the `DATABASE_URL` env variable contains the template placeholder credentials.
2. **Transparent Proxy**: If no live database is connected, all Prisma query methods (like `findMany`, `findUnique`, `create`, `update`, `delete`, and relational joins) are intercepted by a JS Proxy and routed to an in-memory database store populated with seed data.
3. **Zero Configuration**: Simply download and run! The moment you provide a valid database URL, it automatically reconnects and runs against PostgreSQL.

---

## 🔑 Seeded Accounts (For Review)

You can log in to test any of the dashboard profiles. The default password for all seeded accounts is **`password123`**:

1. **Social Seeker Profile** (Aarav Sharma)
   - **Email**: `seeker@developmentwala.org`
   - *Use to test: Profile updates, event ticketpasses, submitted jobs checklist, AI resume keyword reviewer, AI Job Matcher.*
2. **NGO Employer 1** (Anshu Gupta at Goonj)
   - **Email**: `anshu@goonj.org`
   - *Use to test: Posting new roles, review candidate cover letters, dragging applicants across the ATS pipeline board, updating Goonj's NGO profile details.*
3. **NGO Employer 2** (Madhav Chavan at Pratham Education)
   - **Email**: `madhav@pratham.org`
4. **Platform Administrator** (Admin User)
   - **Email**: `admin@developmentwala.org`
   - *Use to test: Approving new NGO verification requests, revoking badges, viewing aggregate metrics.*

---

## 💻 Local Setup & Execution

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Launch Local Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.

### 3. Build & Compile Verification
```bash
npm run build
```

---

## 🐳 Docker Deployment

To build and run the platform inside a local container:

```bash
# Build production image
docker build -t developmentwala .

# Run container on port 3000
docker run -p 3000:3000 developmentwala
```

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── about/            # Static About Us page
│   ├── actions/          # Server Actions (Auth, ATS, Job Posting, Org Profiles)
│   ├── api/
│   │   ├── apply/        # API handler for resume/cover letter submissions
│   │   ├── auth/         # NextAuth endpoint routes
│   │   └── register-event# Ticketing registration handler
│   ├── auth/
│   │   ├── signin/       # Customized Glassmorphic login form (Suspense-wrapped)
│   │   └── signup/       # Dynamic registration form
│   ├── blog/             # NGO guides and Articles list/details [id]
│   ├── consultancies/    # Consultancy postings board
│   ├── contact/          # Support hotlines & message forms
│   ├── dashboard/        # Role-based dashboards (admin, candidate, employer)
│   ├── events/           # Conferences and webinar calendar registrations
│   ├── fellowships/      # Rural fellowship listings
│   ├── grants/           # Funding proposals calls
│   ├── internships/      # Student internship listings
│   ├── jobs/             # Job listings feed (CharityJob split view with JSON-LD)
│   ├── organizations/    # NGO verified directory
│   ├── scholarships/     # Study funding listings
│   ├── volunteer/        # Disaster aid & volunteer campaigns
│   ├── globals.css       # Styling tokens & glassmorphism utilities
│   ├── layout.tsx        # Main application layout wrapper
│   └── page.tsx          # Homepage landing layout
├── components/           # Reusable Client/Server components (Navbar, Footer, ThemeToggle)
├── lib/
│   ├── crypto.ts         # Secure cryptographic password utilities
│   ├── db.ts             # Deferring Prisma & Database Proxy Adapter
│   └── mockData.ts       # Full initial database collections mock
├── auth.config.ts        # NextAuth session callbacks & route permissions
├── auth.ts               # Credentials provider definitions
└── middleware.ts         # NextAuth global request middleware protection
```
