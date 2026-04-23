import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  leadLists,
  InsertLeadList,
  outreachCampaigns,
  InsertOutreachCampaign,
  researchReports,
  InsertResearchReport,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── Users ──────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── Lead Lists ─────────────────────────────────────────────────────────────

export async function createLeadList(data: InsertLeadList) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(leadLists).values(data);
  return result;
}

export async function getLeadListsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leadLists).where(eq(leadLists.userId, userId)).orderBy(desc(leadLists.createdAt));
}

export async function getLeadListById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leadLists).where(eq(leadLists.id, id)).limit(1);
  return result[0];
}

export async function deleteLeadList(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(leadLists).where(eq(leadLists.id, id));
}

// ── Outreach Campaigns ─────────────────────────────────────────────────────

export async function createOutreachCampaign(data: InsertOutreachCampaign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(outreachCampaigns).values(data);
}

export async function getOutreachCampaignsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(outreachCampaigns).where(eq(outreachCampaigns.userId, userId)).orderBy(desc(outreachCampaigns.createdAt));
}

export async function getOutreachCampaignById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(outreachCampaigns).where(eq(outreachCampaigns.id, id)).limit(1);
  return result[0];
}

export async function deleteOutreachCampaign(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(outreachCampaigns).where(eq(outreachCampaigns.id, id));
}

// ── Research Reports ───────────────────────────────────────────────────────

export async function createResearchReport(data: InsertResearchReport): Promise<number | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(researchReports).values(data);
  // result[0].insertId is the auto-increment id
  const insertId = (result as unknown as [{ insertId: number }])[0]?.insertId;
  return insertId ?? null;
}

export async function getResearchReportsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(researchReports).where(eq(researchReports.userId, userId)).orderBy(desc(researchReports.createdAt));
}

export async function getResearchReportById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(researchReports).where(eq(researchReports.id, id)).limit(1);
  return result[0];
}

export async function getResearchReportByShareToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(researchReports).where(eq(researchReports.shareToken, token)).limit(1);
  return result[0];
}

export async function updateResearchReport(id: number, data: Partial<InsertResearchReport>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(researchReports).set(data).where(eq(researchReports.id, id));
}

export async function deleteResearchReport(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(researchReports).where(eq(researchReports.id, id));
}
