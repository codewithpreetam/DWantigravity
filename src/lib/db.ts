import { PrismaClient } from "@prisma/client";
import * as mockData from "./mockData";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Check if DATABASE_URL is configured with real credentials or default template
const isDatabaseConnected = 
  process.env.DATABASE_URL && 
  !process.env.DATABASE_URL.includes("johndoe:randompassword")
    ? true
    : false;

// Initialize Prisma client conditionally
const prismaClient = isDatabaseConnected
  ? (globalForPrisma.prisma || new PrismaClient())
  : null;

if (isDatabaseConnected && prismaClient && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient;
}

// Setup in-memory DB collections attached to globalThis to persist across dev hot-reloads
const globalForDb = globalThis as unknown as { dbStore: Record<string, any[]> };

if (!globalForDb.dbStore) {
  globalForDb.dbStore = {
    user: [...mockData.users],
    organization: [...mockData.organizations],
    job: [...mockData.jobs],
    internship: [...mockData.internships],
    fellowship: [...mockData.fellowships],
    scholarship: [...mockData.scholarships],
    grant: [...mockData.grants],
    consultancy: [...mockData.consultancies],
    volunteer: [...mockData.volunteers],
    application: [...mockData.applications],
    event: [...mockData.events],
    registration: [...mockData.registrations],
    blog: [...mockData.blogs],
    category: [...mockData.categories],
    subscription: [...mockData.subscriptions],
    notification: [],
    message: [],
    payment: [],
    savedJob: [],
    savedSearch: []
  };
}

const dbStore = globalForDb.dbStore;

function createMockTable(tableName: string) {
  return {
    findMany: async (args?: any) => {
      let list = [...(dbStore[tableName] || [])];
      
      if (args?.where) {
        list = list.filter((item: any) => {
          for (const key in args.where) {
            const val = args.where[key];
            if (val === undefined) continue;
            
            if (val && typeof val === "object") {
              if ("in" in val) {
                if (!val.in.includes(item[key])) return false;
              } else if ("equals" in val) {
                if (item[key] !== val.equals) return false;
              } else if ("mode" in val) {
                // String search like contains
                if ("contains" in val) {
                  const searchStr = (val as any).contains.toLowerCase();
                  if (!item[key]?.toLowerCase().includes(searchStr)) return false;
                }
              } else if ("contains" in val) {
                const searchStr = (val as any).contains.toLowerCase();
                if (!item[key]?.toLowerCase().includes(searchStr)) return false;
              }
            } else if (item[key] !== val) {
              return false;
            }
          }
          return true;
        });
      }
      
      // Basic relations mapping
      return list.map((item: any) => {
        const enriched = { ...item };
        
        if (item.organizationId) {
          enriched.organization = dbStore.organization.find(o => o.id === item.organizationId);
        }
        if (item.categoryId) {
          enriched.category = dbStore.category.find(c => c.id === item.categoryId);
        }
        if (item.postedById) {
          enriched.postedBy = dbStore.user.find(u => u.id === item.postedById);
        }
        if (tableName === "message") {
          enriched.sender = dbStore.user.find((u: any) => u.id === item.senderId);
          enriched.receiver = dbStore.user.find((u: any) => u.id === item.receiverId);
        }
        if (tableName === "application") {
          enriched.candidate = dbStore.user.find(u => u.id === item.candidateId);
          if (item.assignedToId) {
            enriched.assignedTo = dbStore.user.find(u => u.id === item.assignedToId);
          }
          if (item.jobId) {
            const r = dbStore.job.find(j => j.id === item.jobId);
            if (r) enriched.job = { ...r, organization: dbStore.organization.find(o => o.id === r.organizationId) };
          }
          if (item.internshipId) {
            const r = dbStore.internship.find(i => i.id === item.internshipId);
            if (r) enriched.internship = { ...r, organization: dbStore.organization.find(o => o.id === r.organizationId) };
          }
          if (item.fellowshipId) {
            const r = dbStore.fellowship.find(f => f.id === item.fellowshipId);
            if (r) enriched.fellowship = { ...r, organization: dbStore.organization.find(o => o.id === r.organizationId) };
          }
          if (item.scholarshipId) {
            const r = dbStore.scholarship.find(s => s.id === item.scholarshipId);
            if (r) enriched.scholarship = { ...r, organization: dbStore.organization.find(o => o.id === r.organizationId) };
          }
          if (item.grantId) {
            const r = dbStore.grant.find(g => g.id === item.grantId);
            if (r) enriched.grant = { ...r, organization: dbStore.organization.find(o => o.id === r.organizationId) };
          }
          if (item.consultancyId) {
            const r = dbStore.consultancy.find(c => c.id === item.consultancyId);
            if (r) enriched.consultancy = { ...r, organization: dbStore.organization.find(o => o.id === r.organizationId) };
          }
          if (item.volunteerId) {
            const r = dbStore.volunteer.find(v => v.id === item.volunteerId);
            if (r) enriched.volunteer = { ...r, organization: dbStore.organization.find(o => o.id === r.organizationId) };
          }
          if (item.eventId) {
            const r = dbStore.event.find(e => e.id === item.eventId);
            if (r) enriched.event = { ...r, organization: dbStore.organization.find(o => o.id === r.organizerId) };
          }
        }
        if (tableName === "event" && item.organizerId) {
          enriched.organizer = dbStore.organization.find(o => o.id === item.organizerId);
        }
        
        return enriched;
      });
    },
    
    findUnique: async (args: any) => {
      const list = dbStore[tableName] || [];
      const item = list.find((x: any) => {
        for (const key in args.where) {
          if (x[key] === args.where[key]) return true;
        }
        return false;
      });
      if (!item) return null;
      
      const enriched = { ...item };
      if (item.organizationId) {
        enriched.organization = dbStore.organization.find(o => o.id === item.organizationId);
      }
      if (item.categoryId) {
        enriched.category = dbStore.category.find(c => c.id === item.categoryId);
      }
      if (item.postedById) {
        enriched.postedBy = dbStore.user.find(u => u.id === item.postedById);
      }
      if (tableName === "user" && item.organizationId) {
        enriched.organization = dbStore.organization.find(o => o.id === item.organizationId);
      }
      if (tableName === "application" && item.assignedToId) {
        enriched.assignedTo = dbStore.user.find(u => u.id === item.assignedToId);
      }
      return enriched;
    },
    
    findFirst: async (args?: any) => {
      const list = await createMockTable(tableName).findMany(args);
      return list[0] || null;
    },
    
    create: async (args: any) => {
      const newItem = {
        id: `${tableName.substring(0, 4)}-${Math.random().toString(36).substring(2, 11)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args.data
      };
      dbStore[tableName] = dbStore[tableName] || [];
      dbStore[tableName].push(newItem);
      return newItem;
    },
    
    update: async (args: any) => {
      const list = dbStore[tableName] || [];
      const index = list.findIndex((x: any) => {
        for (const key in args.where) {
          if (x[key] === args.where[key]) return true;
        }
        return false;
      });
      if (index === -1) throw new Error(`Record not found in mock database table ${tableName}`);
      
      const updated = { ...list[index], ...args.data, updatedAt: new Date() };
      list[index] = updated;
      return updated;
    },
    
    delete: async (args: any) => {
      const list = dbStore[tableName] || [];
      const index = list.findIndex((x: any) => {
        for (const key in args.where) {
          if (x[key] === args.where[key]) return true;
        }
        return false;
      });
      if (index === -1) throw new Error(`Record not found in mock database table ${tableName}`);
      
      const deleted = list.splice(index, 1)[0];
      return deleted;
    },
    
    count: async (args?: any) => {
      const list = await createMockTable(tableName).findMany(args);
      return list.length;
    }
  };
}

// Proxied exports
export const db: any = new Proxy(prismaClient || {}, {
  get(target, prop: string) {
    if ([
      "user", "organization", "job", "internship", "fellowship", 
      "scholarship", "grant", "consultancy", "volunteer", "application",
      "event", "registration", "blog", "category", "subscription",
      "notification", "message", "payment", "savedJob", "savedSearch"
    ].includes(prop)) {
      if (!isDatabaseConnected) {
        return createMockTable(prop);
      }
    }
    return (target as any)[prop];
  }
});
export default db;
