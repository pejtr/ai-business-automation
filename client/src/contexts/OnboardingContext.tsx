import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";

export const AVATAR_URL = "/manus-storage/assistant-avatar_4d9e8bf4.jpg";
const STORAGE_KEY = "aria_onboarding_completed";
const STEP_KEY = "aria_onboarding_step";

export type OnboardingStep = {
  id: string;
  route: string;
  title: string;
  message: string;
  /** CSS selector of the element to spotlight, or null for center modal */
  target: string | null;
  /** Where to place the tooltip relative to the target */
  placement: "top" | "bottom" | "left" | "right" | "center";
  /** Optional action label shown as a secondary CTA */
  actionLabel?: string;
  actionRoute?: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    route: "/",
    title: "Vítejte v Agency AI! 👋",
    message:
      "Ahoj! Jsem Aria, vaše AI asistentka. Provedu vás celým 5-krokovým frameworkem, který proměňuje cizí firmy v platící klienty — automatizovaně. Připraveni? Začínáme!",
    target: null,
    placement: "center",
  },
  {
    id: "dashboard",
    route: "/",
    title: "Krok 1 — Attract",
    message:
      "Tady vidíte přehled celého frameworku. První krok je **Attract** — generování leadů pomocí AI. Klikněte na kartu Attract nebo já vás tam přivedu.",
    target: "[data-onboarding='attract-card']",
    placement: "bottom",
    actionLabel: "Přejít na Attract →",
    actionRoute: "/attract",
  },
  {
    id: "attract",
    route: "/attract",
    title: "Attract — Generování leadů",
    message:
      "Zde zadáte niku, platformu a požadovaný počet leadů. AI vygeneruje strukturovaný seznam firem s weby, sociálními sítěmi a aktuálními tématy. Zkuste to — výsledky jsou připraveny za pár sekund!",
    target: "[data-onboarding='attract-form']",
    placement: "right",
    actionLabel: "Dál na Convert →",
    actionRoute: "/convert",
  },
  {
    id: "convert",
    route: "/convert",
    title: "Krok 2 — Convert",
    message:
      "Skvělé! Teď přichází **Convert**. Nahrajte svůj lead list a AI napíše personalizovaný email pro každou firmu — s předmětem, tělem a odkazem na jejich aktuální aktivitu. Žádné copy-paste šablony.",
    target: "[data-onboarding='convert-form']",
    placement: "right",
    actionLabel: "Dál na Deliver →",
    actionRoute: "/deliver",
  },
  {
    id: "deliver-research",
    route: "/deliver",
    title: "Krok 3 — Deliver (Research)",
    message:
      "Klient projevil zájem? Čas na hluboký brand research. Zadejte název firmy nebo URL a AI sestaví detailní analýzu — online přítomnost, engagement vzorce, efektivita messagingu.",
    target: "[data-onboarding='deliver-form']",
    placement: "right",
    actionLabel: "Zobrazit prezentaci →",
    actionRoute: "/deliver",
  },
  {
    id: "deliver-presentation",
    route: "/deliver",
    title: "Krok 3 — Deliver (Prezentace)",
    message:
      "Z výzkumné zprávy AI automaticky vygeneruje brandovanou prezentaci. Extrahuje barvy a typografii přímo z webu klienta a aplikuje je na snímky. Profesionální deck za minuty.",
    target: "[data-onboarding='deliver-presentation']",
    placement: "top",
    actionLabel: "Dál na Automate →",
    actionRoute: "/automate",
  },
  {
    id: "automate",
    route: "/automate",
    title: "Krok 4 — Automate",
    message:
      "**Automate** je váš autopilot. Nastavte opakující se workflow — pravidelný refresh leadů, automatické odeslání outreach sekvencí, plánované reporty. Jednou nastavíte, systém pracuje za vás.",
    target: "[data-onboarding='automate-hero']",
    placement: "bottom",
    actionLabel: "Dál na Human Element →",
    actionRoute: "/human-element",
  },
  {
    id: "human-element",
    route: "/human-element",
    title: "Krok 5 — Human Element",
    message:
      "Poslední a nejdůležitější krok. AI dělá těžkou práci, ale **vy** přinášíte vizi, vkus a péči. To je to, co proměňuje automatizovaný výstup v opravdové klientské vztahy. Tohle AI nikdy nenahradí.",
    target: "[data-onboarding='human-pillars']",
    placement: "top",
    actionLabel: "Dokončit průvodce ✓",
    actionRoute: undefined,
  },
];

// ── Context ────────────────────────────────────────────────────────────────────

type OnboardingContextValue = {
  isActive: boolean;
  isCompleted: boolean;
  currentStepIndex: number;
  currentStep: OnboardingStep | null;
  totalSteps: number;
  startOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  restartOnboarding: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [, navigate] = useLocation();

  // Auto-start for first-time users
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    const savedStep = localStorage.getItem(STEP_KEY);
    if (!completed) {
      const step = savedStep ? parseInt(savedStep, 10) : 0;
      setCurrentStepIndex(step);
      // Small delay so the app renders first
      const timer = setTimeout(() => setIsActive(true), 800);
      return () => clearTimeout(timer);
    } else {
      setIsCompleted(true);
    }
  }, []);

  const navigateToStep = useCallback((step: OnboardingStep) => {
    navigate(step.route);
  }, [navigate]);

  const startOnboarding = useCallback(() => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setIsActive(true);
    navigateToStep(ONBOARDING_STEPS[0]);
  }, [navigateToStep]);

  const nextStep = useCallback(() => {
    const next = currentStepIndex + 1;
    if (next >= ONBOARDING_STEPS.length) {
      // Complete
      localStorage.setItem(STORAGE_KEY, "true");
      localStorage.removeItem(STEP_KEY);
      setIsActive(false);
      setIsCompleted(true);
      setCurrentStepIndex(0);
    } else {
      localStorage.setItem(STEP_KEY, String(next));
      setCurrentStepIndex(next);
      navigateToStep(ONBOARDING_STEPS[next]);
    }
  }, [currentStepIndex, navigateToStep]);

  const prevStep = useCallback(() => {
    const prev = Math.max(0, currentStepIndex - 1);
    localStorage.setItem(STEP_KEY, String(prev));
    setCurrentStepIndex(prev);
    navigateToStep(ONBOARDING_STEPS[prev]);
  }, [currentStepIndex, navigateToStep]);

  const skipOnboarding = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    localStorage.removeItem(STEP_KEY);
    setIsActive(false);
    setIsCompleted(true);
    setCurrentStepIndex(0);
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    localStorage.removeItem(STEP_KEY);
    setIsActive(false);
    setIsCompleted(true);
    setCurrentStepIndex(0);
    navigate("/attract");
  }, [navigate]);

  const restartOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STEP_KEY);
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setIsActive(true);
    navigate("/");
  }, [navigate]);

  const currentStep = isActive ? (ONBOARDING_STEPS[currentStepIndex] ?? null) : null;

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        isCompleted,
        currentStepIndex,
        currentStep,
        totalSteps: ONBOARDING_STEPS.length,
        startOnboarding,
        nextStep,
        prevStep,
        skipOnboarding,
        completeOnboarding,
        restartOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
