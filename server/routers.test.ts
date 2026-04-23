import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB helpers
vi.mock("./db", () => ({
  createLeadList: vi.fn().mockResolvedValue({}),
  getLeadListsByUser: vi.fn().mockResolvedValue([]),
  getLeadListById: vi.fn().mockResolvedValue(null),
  deleteLeadList: vi.fn().mockResolvedValue({}),
  createOutreachCampaign: vi.fn().mockResolvedValue({}),
  getOutreachCampaignsByUser: vi.fn().mockResolvedValue([]),
  getOutreachCampaignById: vi.fn().mockResolvedValue(null),
  deleteOutreachCampaign: vi.fn().mockResolvedValue({}),
  createResearchReport: vi.fn().mockResolvedValue({}),
  getResearchReportsByUser: vi.fn().mockResolvedValue([]),
  getResearchReportById: vi.fn().mockResolvedValue(null),
  getResearchReportByShareToken: vi.fn().mockResolvedValue(null),
  updateResearchReport: vi.fn().mockResolvedValue({}),
  deleteResearchReport: vi.fn().mockResolvedValue({}),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: '{"leads":[]}' } }],
  }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@example.com");
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});

describe("attract.list", () => {
  it("returns empty array for user with no lead lists", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.attract.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});

describe("attract.save", () => {
  it("saves a lead list successfully", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.attract.save({
      title: "Test List",
      niche: "Health & Wellness",
      platform: "Instagram",
      count: 5,
      leads: [
        {
          company: "Test Brand",
          website: "https://test.com",
          instagram: "@testbrand",
          facebook: "testbrand",
          twitter: "@testbrand",
          recentTopics: "Health tips and product launches",
        },
      ],
    });
    expect(result).toEqual({ success: true });
  });
});

describe("convert.list", () => {
  it("returns empty array for user with no campaigns", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.convert.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("deliver.list", () => {
  it("returns empty array for user with no reports", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.deliver.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("deliver.getByShareToken", () => {
  it("returns null for invalid token", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.deliver.getByShareToken({ token: "invalid-token" });
    expect(result).toBeNull();
  });
});
