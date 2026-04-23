import { useEffect, useState, useRef, useCallback } from "react";
import { useOnboarding, AVATAR_URL, ONBOARDING_STEPS } from "@/contexts/OnboardingContext";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, X, Sparkles, CheckCircle2 } from "lucide-react";

// ── Typing animation hook ─────────────────────────────────────────────────────
function useTypingText(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    function tick() {
      i++;
      setDisplayed(text.slice(0, i));
      if (i < text.length) {
        timerRef.current = setTimeout(tick, speed);
      } else {
        setDone(true);
      }
    }
    timerRef.current = setTimeout(tick, speed);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text, speed]);

  return { displayed, done };
}

// ── Spotlight rect tracker ────────────────────────────────────────────────────
function useSpotlightRect(selector: string | null) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!selector) { setRect(null); return; }
    const sel = selector;
    let attempts = 0;
    function tryFind() {
      const el = document.querySelector(sel);
      if (el) {
        setRect(el.getBoundingClientRect());
      } else if (attempts < 20) {
        attempts++;
        setTimeout(tryFind, 150);
      }
    }
    tryFind();
    function onResize() {
      const el = document.querySelector(sel);
      if (el) setRect(el.getBoundingClientRect());
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [selector]);

  return rect;
}

// ── Render bold markdown inline ───────────────────────────────────────────────
function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} style={{ color: "oklch(0.88 0.01 260)", fontWeight: 700 }}>
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ── Step dots ─────────────────────────────────────────────────────────────────
function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? "20px" : "6px",
            height: "6px",
            background:
              i < current
                ? "oklch(0.78 0.22 195 / 0.5)"
                : i === current
                ? "oklch(0.78 0.22 195)"
                : "oklch(0.22 0.02 260)",
            boxShadow: i === current ? "0 0 8px oklch(0.78 0.22 195 / 0.7)" : "none",
          }}
        />
      ))}
    </div>
  );
}

// ── Completion screen ─────────────────────────────────────────────────────────
function CompletionCard({ onDone }: { onDone: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "oklch(0 0 0 / 0.75)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative rounded-3xl p-8 max-w-md w-full mx-4 text-center"
        style={{
          background: "oklch(0.10 0.016 260)",
          border: "1px solid oklch(0.78 0.22 195 / 0.35)",
          boxShadow: "0 0 60px oklch(0.78 0.22 195 / 0.2), 0 24px 80px oklch(0 0 0 / 0.5)",
        }}
      >
        {/* Glow */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, oklch(0.78 0.22 195 / 0.08), transparent 70%)" }} />

        {/* Avatar */}
        <div className="relative mx-auto mb-5 w-20 h-20">
          <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: "oklch(0.78 0.22 195 / 0.2)", filter: "blur(12px)" }} />
          <img src={AVATAR_URL} alt="Aria" className="relative w-20 h-20 rounded-full object-cover object-top" style={{ border: "2px solid oklch(0.78 0.22 195 / 0.5)" }} />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "oklch(0.78 0.22 145)", border: "2px solid oklch(0.10 0.016 260)" }}>
            <CheckCircle2 className="w-3.5 h-3.5 text-black" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" style={{ color: "oklch(0.78 0.22 195)", filter: "drop-shadow(0 0 6px oklch(0.78 0.22 195))" }} />
          <h2 className="text-xl font-bold text-foreground tracking-tight">Průvodce dokončen!</h2>
          <Sparkles className="w-4 h-4" style={{ color: "oklch(0.68 0.26 295)", filter: "drop-shadow(0 0 6px oklch(0.68 0.26 295))" }} />
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Teď znáte celý framework od <strong className="text-foreground">Attract</strong> po <strong className="text-foreground">Human Element</strong>. Jste připraveni proměnit první lead v klienta. Začněte hned!
        </p>

        <button
          onClick={onDone}
          className="w-full py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, oklch(0.78 0.22 195 / 0.2), oklch(0.68 0.26 295 / 0.2))",
            border: "1px solid oklch(0.78 0.22 195 / 0.4)",
            color: "oklch(0.88 0.01 260)",
            boxShadow: "0 0 20px oklch(0.78 0.22 195 / 0.15)",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 30px oklch(0.78 0.22 195 / 0.3)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px oklch(0.78 0.22 195 / 0.15)"; }}
        >
          Začít generovat leady →
        </button>
      </div>
    </div>
  );
}

// ── Main overlay ──────────────────────────────────────────────────────────────
export default function OnboardingOverlay() {
  const {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    nextStep,
    prevStep,
    skipOnboarding,
    completeOnboarding,
  } = useOnboarding();

  const [showCompletion, setShowCompletion] = useState(false);
  const [, navigate] = useLocation();
  const spotlightRect = useSpotlightRect(isActive ? (currentStep?.target ?? null) : null);
  const { displayed, done } = useTypingText(currentStep?.message ?? "", 16);

  // Detect last step completion
  const isLastStep = currentStepIndex === totalSteps - 1;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      setShowCompletion(true);
    } else {
      nextStep();
    }
  }, [isLastStep, nextStep]);

  const handleAction = useCallback(() => {
    if (currentStep?.actionRoute) {
      navigate(currentStep.actionRoute);
      nextStep();
    } else {
      setShowCompletion(true);
    }
  }, [currentStep, navigate, nextStep]);

  const handleCompletionDone = useCallback(() => {
    setShowCompletion(false);
    completeOnboarding();
  }, [completeOnboarding]);

  if (showCompletion) return <CompletionCard onDone={handleCompletionDone} />;
  if (!isActive || !currentStep) return null;

  const isCenter = currentStep.placement === "center" || !spotlightRect;

  // ── Spotlight cutout dimensions ──────────────────────────────────────────
  const PAD = 12;
  const spotX = spotlightRect ? spotlightRect.left - PAD : 0;
  const spotY = spotlightRect ? spotlightRect.top - PAD : 0;
  const spotW = spotlightRect ? spotlightRect.width + PAD * 2 : 0;
  const spotH = spotlightRect ? spotlightRect.height + PAD * 2 : 0;

  // ── Tooltip positioning ───────────────────────────────────────────────────
  const PANEL_W = 360;
  const PANEL_H_EST = 220;
  let panelStyle: React.CSSProperties = {};

  if (isCenter) {
    panelStyle = {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: PANEL_W,
    };
  } else if (spotlightRect) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { placement } = currentStep;

    if (placement === "bottom") {
      panelStyle = {
        position: "fixed",
        top: spotlightRect.bottom + PAD + 16,
        left: Math.min(Math.max(spotlightRect.left + spotlightRect.width / 2 - PANEL_W / 2, 12), vw - PANEL_W - 12),
        width: PANEL_W,
      };
    } else if (placement === "top") {
      panelStyle = {
        position: "fixed",
        top: Math.max(spotlightRect.top - PAD - PANEL_H_EST - 16, 12),
        left: Math.min(Math.max(spotlightRect.left + spotlightRect.width / 2 - PANEL_W / 2, 12), vw - PANEL_W - 12),
        width: PANEL_W,
      };
    } else if (placement === "right") {
      panelStyle = {
        position: "fixed",
        top: Math.min(Math.max(spotlightRect.top + spotlightRect.height / 2 - PANEL_H_EST / 2, 12), vh - PANEL_H_EST - 12),
        left: Math.min(spotlightRect.right + PAD + 16, vw - PANEL_W - 12),
        width: PANEL_W,
      };
    } else {
      // left
      panelStyle = {
        position: "fixed",
        top: Math.min(Math.max(spotlightRect.top + spotlightRect.height / 2 - PANEL_H_EST / 2, 12), vh - PANEL_H_EST - 12),
        left: Math.max(spotlightRect.left - PAD - PANEL_W - 16, 12),
        width: PANEL_W,
      };
    }
  }

  return (
    <>
      {/* ── Backdrop with spotlight cutout ── */}
      <div className="fixed inset-0 z-[9000] pointer-events-none">
        {spotlightRect && !isCenter ? (
          <svg className="w-full h-full" style={{ position: "absolute", inset: 0 }}>
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect x={spotX} y={spotY} width={spotW} height={spotH} rx="12" fill="black" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="oklch(0 0 0 / 0.65)" mask="url(#spotlight-mask)" />
            {/* Glow ring around spotlight */}
            <rect
              x={spotX - 1} y={spotY - 1} width={spotW + 2} height={spotH + 2}
              rx="13" fill="none"
              stroke="oklch(0.78 0.22 195 / 0.5)"
              strokeWidth="1.5"
              filter="url(#glow-filter)"
            />
            <defs>
              <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
          </svg>
        ) : (
          <div className="absolute inset-0" style={{ background: "oklch(0 0 0 / 0.72)", backdropFilter: "blur(2px)" }} />
        )}
      </div>

      {/* ── Tooltip panel ── */}
      <div
        className="z-[9100] pointer-events-auto"
        style={{
          ...panelStyle,
          position: "fixed",
          animation: "onboarding-slide-in 0.25s ease-out",
        }}
      >
        <style>{`
          @keyframes onboarding-slide-in {
            from { opacity: 0; transform: ${isCenter ? "translate(-50%, -46%)" : "translateY(8px)"}; }
            to   { opacity: 1; transform: ${isCenter ? "translate(-50%, -50%)" : "translateY(0)"}; }
          }
        `}</style>

        {/* Directional arrow pointer */}
        {!isCenter && spotlightRect && (() => {
          const { placement } = currentStep;
          const arrowStyle: React.CSSProperties = {
            position: "absolute",
            width: 0,
            height: 0,
            pointerEvents: "none",
          };
          if (placement === "bottom") {
            arrowStyle.top = -8;
            arrowStyle.left = "50%";
            arrowStyle.transform = "translateX(-50%)";
            arrowStyle.borderLeft = "8px solid transparent";
            arrowStyle.borderRight = "8px solid transparent";
            arrowStyle.borderBottom = "8px solid oklch(0.78 0.22 195 / 0.4)";
          } else if (placement === "top") {
            arrowStyle.bottom = -8;
            arrowStyle.left = "50%";
            arrowStyle.transform = "translateX(-50%)";
            arrowStyle.borderLeft = "8px solid transparent";
            arrowStyle.borderRight = "8px solid transparent";
            arrowStyle.borderTop = "8px solid oklch(0.78 0.22 195 / 0.4)";
          } else if (placement === "right") {
            arrowStyle.left = -8;
            arrowStyle.top = "50%";
            arrowStyle.transform = "translateY(-50%)";
            arrowStyle.borderTop = "8px solid transparent";
            arrowStyle.borderBottom = "8px solid transparent";
            arrowStyle.borderRight = "8px solid oklch(0.78 0.22 195 / 0.4)";
          } else if (placement === "left") {
            arrowStyle.right = -8;
            arrowStyle.top = "50%";
            arrowStyle.transform = "translateY(-50%)";
            arrowStyle.borderTop = "8px solid transparent";
            arrowStyle.borderBottom = "8px solid transparent";
            arrowStyle.borderLeft = "8px solid oklch(0.78 0.22 195 / 0.4)";
          }
          return <div style={arrowStyle} />;
        })()}

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "oklch(0.10 0.016 260)",
            border: "1px solid oklch(0.78 0.22 195 / 0.3)",
            boxShadow: "0 0 40px oklch(0.78 0.22 195 / 0.15), 0 20px 60px oklch(0 0 0 / 0.5)",
          }}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid oklch(0.78 0.22 195 / 0.1)", background: "oklch(0.78 0.22 195 / 0.04)" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3" style={{ color: "oklch(0.78 0.22 195)", filter: "drop-shadow(0 0 4px oklch(0.78 0.22 195))" }} />
              <span className="text-[10px] font-mono tracking-widest" style={{ color: "oklch(0.78 0.22 195 / 0.7)" }}>
                PRŮVODCE ARIA
              </span>
            </div>
            <button
              onClick={skipOnboarding}
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "oklch(0.35 0.02 260)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.65 0.02 260)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.35 0.02 260)"; }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            {/* Aria avatar + title */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full" style={{ background: "oklch(0.78 0.22 195 / 0.2)", filter: "blur(8px)" }} />
                <img
                  src={AVATAR_URL}
                  alt="Aria"
                  className="relative w-10 h-10 rounded-full object-cover object-top"
                  style={{ border: "1.5px solid oklch(0.78 0.22 195 / 0.5)" }}
                />
                {/* Online dot */}
                <div
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
                  style={{ background: "oklch(0.78 0.22 145)", border: "1.5px solid oklch(0.10 0.016 260)", boxShadow: "0 0 6px oklch(0.78 0.22 145)" }}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{currentStep.title}</p>
                <p className="text-[10px]" style={{ color: "oklch(0.78 0.22 195 / 0.6)" }}>Aria · AI asistentka</p>
              </div>
            </div>

            {/* Speech bubble */}
            <div
              className="rounded-xl p-3 mb-4 min-h-[72px]"
              style={{ background: "oklch(0.13 0.018 260)", border: "1px solid oklch(0.20 0.022 260)" }}
            >
              <p className="text-sm leading-relaxed" style={{ color: "oklch(0.75 0.01 260)" }}>
                <InlineMarkdown text={displayed} />
                {!done && (
                  <span
                    className="inline-block w-0.5 h-3.5 ml-0.5 rounded-full align-middle"
                    style={{ background: "oklch(0.78 0.22 195)", animation: "blink 0.8s step-end infinite" }}
                  />
                )}
              </p>
              <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
            </div>

            {/* Step progress */}
            <div className="flex items-center justify-between mb-4">
              <StepDots total={totalSteps} current={currentStepIndex} />
              <span className="text-[10px] font-mono" style={{ color: "oklch(0.35 0.02 260)" }}>
                {currentStepIndex + 1} / {totalSteps}
              </span>
            </div>

            {/* Action CTA (optional) */}
            {currentStep.actionLabel && done && (
              <button
                onClick={handleAction}
                className="w-full py-2 rounded-xl text-xs font-semibold tracking-wide mb-2 transition-all duration-150"
                style={{
                  background: "linear-gradient(135deg, oklch(0.78 0.22 195 / 0.15), oklch(0.68 0.26 295 / 0.15))",
                  border: "1px solid oklch(0.78 0.22 195 / 0.35)",
                  color: "oklch(0.88 0.01 260)",
                  boxShadow: "0 0 14px oklch(0.78 0.22 195 / 0.1)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 22px oklch(0.78 0.22 195 / 0.25)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 14px oklch(0.78 0.22 195 / 0.1)"; }}
              >
                {currentStep.actionLabel}
              </button>
            )}

            {/* Nav buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-30"
                style={{ color: "oklch(0.45 0.02 260)", border: "1px solid oklch(0.20 0.022 260)" }}
                onMouseEnter={e => { if (currentStepIndex > 0) (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.70 0.01 260)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.45 0.02 260)"; }}
              >
                <ChevronLeft className="w-3 h-3" /> Zpět
              </button>
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: "oklch(0.78 0.22 195 / 0.12)",
                  border: "1px solid oklch(0.78 0.22 195 / 0.3)",
                  color: "oklch(0.78 0.22 195)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.78 0.22 195 / 0.2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.78 0.22 195 / 0.12)"; }}
              >
                {isLastStep ? "Dokončit" : "Další"} <ChevronRight className="w-3 h-3" />
              </button>
              <button
                onClick={skipOnboarding}
                className="px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{ color: "oklch(0.30 0.02 260)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.50 0.02 260)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.30 0.02 260)"; }}
              >
                Přeskočit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
