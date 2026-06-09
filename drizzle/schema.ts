import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Lead Lists (Attract module)
export const leadLists = mysqlTable("lead_lists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  niche: varchar("niche", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 128 }).notNull(),
  count: int("count").notNull().default(10),
  leads: json("leads").notNull(), // Lead[]
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeadList = typeof leadLists.$inferSelect;
export type InsertLeadList = typeof leadLists.$inferInsert;

// Outreach Campaigns (Convert module)
export const outreachCampaigns = mysqlTable("outreach_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  leadListId: int("leadListId"),
  emails: json("emails").notNull(), // OutreachEmail[]
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OutreachCampaign = typeof outreachCampaigns.$inferSelect;
export type InsertOutreachCampaign = typeof outreachCampaigns.$inferInsert;

// Research Reports (Deliver module)
export const researchReports = mysqlTable("research_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  companyUrl: varchar("companyUrl", { length: 512 }),
  reportContent: text("reportContent").notNull(),
  presentationHtml: text("presentationHtml"),
  brandColors: json("brandColors"), // string[]
  brandFonts: json("brandFonts"), // string[]
  shareToken: varchar("shareToken", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResearchReport = typeof researchReports.$inferSelect;
export type InsertResearchReport = typeof researchReports.$inferInsert;

// Tracked Emails (Convert module — tracking)
export const trackedEmails = mysqlTable("tracked_emails", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  userId: int("userId").notNull(),
  emailIndex: int("emailIndex").notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  trackingToken: varchar("trackingToken", { length: 64 }).notNull().unique(),
  subject: varchar("subject", { length: 512 }).notNull(),
  bodyHtml: text("bodyHtml").notNull(), // HTML with tracking pixel + tracked links
  bodyText: text("bodyText").notNull(), // Plain text version
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrackedEmail = typeof trackedEmails.$inferSelect;
export type InsertTrackedEmail = typeof trackedEmails.$inferInsert;

// Email Tracking Events
export const emailTrackingEvents = mysqlTable("email_tracking_events", {
  id: int("id").autoincrement().primaryKey(),
  trackingToken: varchar("trackingToken", { length: 64 }).notNull(),
  campaignId: int("campaignId").notNull(),
  userId: int("userId").notNull(),
  emailIndex: int("emailIndex").notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  eventType: mysqlEnum("eventType", ["open", "click"]).notNull(),
  linkUrl: varchar("linkUrl", { length: 2048 }), // populated for click events
  ip: varchar("ip", { length: 64 }),
  userAgent: varchar("userAgent", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailTrackingEvent = typeof emailTrackingEvents.$inferSelect;
export type InsertEmailTrackingEvent = typeof emailTrackingEvents.$inferInsert;

// Niche Templates (Attract module enhancement)
export const nicheTemplates = mysqlTable("niche_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // "Zubař", "Fitness", etc.
  slug: varchar("slug", { length: 128 }).notNull().unique(), // "dentist", "fitness", etc.
  description: text("description").notNull(),
  averagePrice: int("averagePrice").notNull(), // in CZK
  recommendedSolution: varchar("recommendedSolution", { length: 512 }).notNull(), // e.g., "Appointment booking app"
  bestOutreachPlatform: varchar("bestOutreachPlatform", { length: 128 }).notNull(), // "LinkedIn", "Email", "Walk-in", etc.
  aiPromptContext: text("aiPromptContext").notNull(), // context for AI lead generation
  icon: varchar("icon", { length: 64 }), // emoji or icon name
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NicheTemplate = typeof nicheTemplates.$inferSelect;
export type InsertNicheTemplate = typeof nicheTemplates.$inferInsert;

// Income Calculator (Dashboard enhancement)
export const incomeCalculators = mysqlTable("income_calculators", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientCount: int("clientCount").notNull().default(0),
  monthlyRetainerCzk: int("monthlyRetainerCzk").notNull().default(10000), // average monthly retainer in CZK
  totalMonthlyRevenue: int("totalMonthlyRevenue").notNull().default(0), // calculated: clientCount * monthlyRetainerCzk
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IncomeCalculator = typeof incomeCalculators.$inferSelect;
export type InsertIncomeCalculator = typeof incomeCalculators.$inferInsert;
