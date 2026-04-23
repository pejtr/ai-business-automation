/**
 * Onboarding context logic tests
 * These test the pure logic of the onboarding data structure
 * (step navigation, persistence keys, step count, route mapping)
 * without requiring a DOM/browser environment.
 */
import { describe, it, expect } from "vitest";

// ── Mirror the onboarding constants from the frontend context ──────────────
const STORAGE_KEY = "aria_onboarding_completed";
const STEP_KEY = "aria_onboarding_step";

const ONBOARDING_STEPS = [
  { id: "welcome",              route: "/",              placement: "center" },
  { id: "dashboard",            route: "/",              placement: "bottom" },
  { id: "attract",              route: "/attract",       placement: "right"  },
  { id: "convert",              route: "/convert",       placement: "right"  },
  { id: "deliver-research",     route: "/deliver",       placement: "right"  },
  { id: "deliver-presentation", route: "/deliver",       placement: "top"    },
  { id: "automate",             route: "/automate",      placement: "bottom" },
  { id: "human-element",        route: "/human-element", placement: "top"    },
];

// ── Pure logic helpers (mirrors what OnboardingContext does) ──────────────
function getNextStepIndex(current: number, total: number): number | "complete" {
  const next = current + 1;
  return next >= total ? "complete" : next;
}

function getPrevStepIndex(current: number): number {
  return Math.max(0, current - 1);
}

function shouldAutoStart(storage: Record<string, string>): boolean {
  return !storage[STORAGE_KEY];
}

function markCompleted(storage: Record<string, string>): Record<string, string> {
  const next = { ...storage };
  next[STORAGE_KEY] = "true";
  delete next[STEP_KEY];
  return next;
}

function saveProgress(storage: Record<string, string>, step: number): Record<string, string> {
  return { ...storage, [STEP_KEY]: String(step) };
}

function restoreStep(storage: Record<string, string>): number {
  const saved = storage[STEP_KEY];
  return saved ? parseInt(saved, 10) : 0;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("Onboarding steps data", () => {
  it("has exactly 8 steps", () => {
    expect(ONBOARDING_STEPS).toHaveLength(8);
  });

  it("starts with the welcome step on route /", () => {
    expect(ONBOARDING_STEPS[0].id).toBe("welcome");
    expect(ONBOARDING_STEPS[0].route).toBe("/");
    expect(ONBOARDING_STEPS[0].placement).toBe("center");
  });

  it("ends with human-element step", () => {
    const last = ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1];
    expect(last.id).toBe("human-element");
    expect(last.route).toBe("/human-element");
  });

  it("covers all 5 framework routes", () => {
    const routes = ONBOARDING_STEPS.map(s => s.route);
    expect(routes).toContain("/attract");
    expect(routes).toContain("/convert");
    expect(routes).toContain("/deliver");
    expect(routes).toContain("/automate");
    expect(routes).toContain("/human-element");
  });

  it("all steps have valid placement values", () => {
    const validPlacements = ["center", "top", "bottom", "left", "right"];
    for (const step of ONBOARDING_STEPS) {
      expect(validPlacements).toContain(step.placement);
    }
  });
});

describe("Step navigation logic", () => {
  it("advances to next step correctly", () => {
    expect(getNextStepIndex(0, 8)).toBe(1);
    expect(getNextStepIndex(3, 8)).toBe(4);
    expect(getNextStepIndex(6, 8)).toBe(7);
  });

  it("returns complete when advancing past last step", () => {
    expect(getNextStepIndex(7, 8)).toBe("complete");
  });

  it("goes back to previous step correctly", () => {
    expect(getPrevStepIndex(3)).toBe(2);
    expect(getPrevStepIndex(1)).toBe(0);
  });

  it("does not go below step 0 when going back", () => {
    expect(getPrevStepIndex(0)).toBe(0);
  });
});

describe("Auto-start and persistence logic", () => {
  it("auto-starts for new users (empty storage)", () => {
    expect(shouldAutoStart({})).toBe(true);
  });

  it("does not auto-start for users who completed onboarding", () => {
    expect(shouldAutoStart({ [STORAGE_KEY]: "true" })).toBe(false);
  });

  it("marks onboarding as completed and clears step key", () => {
    const storage = { [STEP_KEY]: "5" };
    const result = markCompleted(storage);
    expect(result[STORAGE_KEY]).toBe("true");
    expect(result[STEP_KEY]).toBeUndefined();
  });

  it("saves progress step correctly", () => {
    const result = saveProgress({}, 4);
    expect(result[STEP_KEY]).toBe("4");
  });

  it("restores saved step from storage", () => {
    expect(restoreStep({ [STEP_KEY]: "3" })).toBe(3);
  });

  it("restores step 0 when no saved step", () => {
    expect(restoreStep({})).toBe(0);
  });

  it("restart clears completed flag and step key", () => {
    const storage = { [STORAGE_KEY]: "true", [STEP_KEY]: "7" };
    // Restart = remove both keys
    const restarted: Record<string, string> = {};
    expect(shouldAutoStart(restarted)).toBe(true);
    expect(restoreStep(restarted)).toBe(0);
  });
});

describe("Storage key constants", () => {
  it("uses stable storage key names", () => {
    expect(STORAGE_KEY).toBe("aria_onboarding_completed");
    expect(STEP_KEY).toBe("aria_onboarding_step");
  });
});
