import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Magnet, Mail, FileText, Zap, Heart, ArrowRight, Sparkles, Activity } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// ── Workflow Diagram ─────────────────────────────────────────────────────────

const DIAGRAM_STEPS = [
  { id: "01", label: "Attract", sub: "Generování leadů", color: "oklch(0.78 0.22 195)", x: 60 },
  { id: "02", label: "Convert", sub: "Outreach e-maily", color: "oklch(0.68 0.26 295)", x: 220 },
  { id: "03", label: "Deliver", sub: "Výzkum & Prezentace", color: "oklch(0.72 0.24 340)", x: 380 },
  { id: "04", label: "Automate", sub: "Automatizace", color: "oklch(0.78 0.22 145)", x: 540 },
  { id: "05", label: "Human", sub: "Vize & Vkus", color: "oklch(0.82 0.18 75)", x: 700 },
];

function WorkflowDiagram() {
  const W = 800;
  const H = 140;
  const CY = 62;
  const R = 28;

  return (
    <div
      className="w-full rounded-2xl overflow-hidden relative"
      style={{ background: "oklch(0.09 0.014 260)", border: "1px solid oklch(0.18 0.02 260)", boxShadow: "0 0 40px oklch(0 0 0 / 0.3)" }}
    >
      {/* subtle dot grid */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, oklch(0.30 0.02 260) 1px, transparent 0)", backgroundSize: "24px 24px" }} />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full relative z-10"
        style={{ height: "auto", maxHeight: "160px" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {DIAGRAM_STEPS.map((s) => (
            <radialGradient key={s.id} id={`glow-${s.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </radialGradient>
          ))}
          {DIAGRAM_STEPS.map((s) => (
            <filter key={`f-${s.id}`} id={`blur-${s.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          ))}
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="oklch(0.30 0.02 260)" />
          </marker>
        </defs>

        {/* Connecting lines between nodes */}
        {DIAGRAM_STEPS.slice(0, -1).map((s, i) => {
          const next = DIAGRAM_STEPS[i + 1];
          const x1 = s.x + R;
          const x2 = next.x - R;
          const midX = (x1 + x2) / 2;
          return (
            <g key={`line-${i}`}>
              {/* Glow line */}
              <line
                x1={x1} y1={CY} x2={x2} y2={CY}
                stroke={s.color}
                strokeWidth="1.5"
                strokeOpacity="0.15"
                filter={`url(#blur-${s.id})`}
              />
              {/* Solid line */}
              <line
                x1={x1} y1={CY} x2={x2} y2={CY}
                stroke="oklch(0.22 0.022 260)"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              {/* Animated dot */}
              <circle r="3" fill={s.color} opacity="0.7">
                <animateMotion
                  dur={`${1.8 + i * 0.3}s`}
                  repeatCount="indefinite"
                  path={`M${x1},${CY} L${x2},${CY}`}
                />
              </circle>
              {/* Arrow label */}
              <text x={midX} y={CY - 8} textAnchor="middle" fontSize="7" fill="oklch(0.35 0.02 260)" fontFamily="monospace">
                →
              </text>
            </g>
          );
        })}

        {/* Node circles */}
        {DIAGRAM_STEPS.map((s) => (
          <g key={s.id}>
            {/* Outer glow */}
            <circle cx={s.x} cy={CY} r={R + 10} fill={`url(#glow-${s.id})`} filter={`url(#blur-${s.id})`} />
            {/* Ring */}
            <circle
              cx={s.x} cy={CY} r={R}
              fill="oklch(0.11 0.016 260)"
              stroke={s.color}
              strokeWidth="1.5"
              strokeOpacity="0.6"
            />
            {/* Inner fill */}
            <circle cx={s.x} cy={CY} r={R - 6} fill={s.color} fillOpacity="0.08" />
            {/* Step number */}
            <text
              x={s.x} y={CY - 8}
              textAnchor="middle"
              fontSize="8"
              fontFamily="monospace"
              fontWeight="600"
              fill={s.color}
              fillOpacity="0.7"
            >
              {s.id}
            </text>
            {/* Label */}
            <text
              x={s.x} y={CY + 5}
              textAnchor="middle"
              fontSize="10"
              fontFamily="system-ui, sans-serif"
              fontWeight="700"
              fill="oklch(0.90 0.01 260)"
            >
              {s.label}
            </text>
            {/* Sub label below circle */}
            <text
              x={s.x} y={CY + R + 14}
              textAnchor="middle"
              fontSize="7.5"
              fontFamily="monospace"
              fill={s.color}
              fillOpacity="0.65"
            >
              {s.sub}
            </text>
          </g>
        ))}

        {/* Client Result badge at the end */}
        <g>
          <rect x={W - 95} y={CY - 14} width={88} height={28} rx="8" fill="oklch(0.78 0.22 195 / 0.06)" stroke="oklch(0.78 0.22 195 / 0.2)" strokeWidth="1" />
          <text x={W - 51} y={CY + 5} textAnchor="middle" fontSize="9" fontFamily="system-ui, sans-serif" fontWeight="600" fill="oklch(0.78 0.22 195 / 0.8)">
            Výsledek pro klienta
          </text>
        </g>
      </svg>

      {/* Bottom label */}
      <div className="flex items-center justify-center pb-3 pt-0">
        <p className="text-[9px] font-mono tracking-widest" style={{ color: "oklch(0.30 0.02 260)" }}>AGENCY AI · 5-KROKÝ AUTOMATIZOVANÝ WORKFLOW</p>
      </div>
    </div>
  );
}

const STEPS = [
  {
    step: "01",
    label: "Attract",
    path: "/attract",
    icon: Magnet,
    description: "Generujte cílené seznamy leadů pomocí AI. Definujte své odvětví, platformu a kritéria — získáte strukturovanou tabulku kvalifikovaných zájemců.",
    color: "oklch(0.78 0.22 195)",
    glow: "oklch(0.78 0.22 195 / 0.35)",
    glowSoft: "oklch(0.78 0.22 195 / 0.08)",
    border: "oklch(0.78 0.22 195 / 0.3)",
    tag: "Generování leadů",
  },
  {
    step: "02",
    label: "Convert",
    path: "/convert",
    icon: Mail,
    description: "Proměňte seznam leadů v personalizované outreach e-maily. Každý návrh odkazuje na nedávnou aktivitu značky pro maximální relevanci.",
    color: "oklch(0.68 0.26 295)",
    glow: "oklch(0.68 0.26 295 / 0.35)",
    glowSoft: "oklch(0.68 0.26 295 / 0.08)",
    border: "oklch(0.68 0.26 295 / 0.3)",
    tag: "Outreach",
  },
  {
    step: "03",
    label: "Deliver",
    path: "/deliver",
    icon: FileText,
    description: "Provedeťe hloubkový brand výzkum a automaticky vygenerujte profesionální analytické zprávy a brandované prezentace.",
    color: "oklch(0.72 0.24 340)",
    glow: "oklch(0.72 0.24 340 / 0.35)",
    glowSoft: "oklch(0.72 0.24 340 / 0.08)",
    border: "oklch(0.72 0.24 340 / 0.3)",
    tag: "Výzkum & Prezentace",
  },
  {
    step: "04",
    label: "Automate",
    path: "/automate",
    icon: Zap,
    description: "Nastavte opakující se workflow, které pověde procesy vaší agentury na autopilotu — od obnovy leadů až po dodání reportů.",
    color: "oklch(0.78 0.22 145)",
    glow: "oklch(0.78 0.22 145 / 0.35)",
    glowSoft: "oklch(0.78 0.22 145 / 0.08)",
    border: "oklch(0.78 0.22 145 / 0.3)",
    tag: "Automatizace",
  },
  {
    step: "05",
    label: "Human Element",
    path: "/human-element",
    icon: Heart,
    description: "Nenahraditelná vrstva — vaše vize, vkus a péče, které proměňují automatizovaný výstup v autentické klientské vztahy.",
    color: "oklch(0.82 0.18 75)",
    glow: "oklch(0.82 0.18 75 / 0.35)",
    glowSoft: "oklch(0.82 0.18 75 / 0.08)",
    border: "oklch(0.82 0.18 75 / 0.3)",
    tag: "Vize & Vkus",
  },
];

export default function Home() {
  const { user } = useAuth();
  const leadLists = trpc.attract.list.useQuery();
  const campaigns = trpc.convert.list.useQuery();
  const reports = trpc.deliver.list.useQuery();
  
  // Income Calculator
  const { data: incomeCalc } = trpc.income.getOrCreate.useQuery();
  const updateIncome = trpc.income.update.useMutation();
  const [clientCount, setClientCount] = useState(incomeCalc?.clientCount ?? 0);
  const [monthlyRetainer, setMonthlyRetainer] = useState(incomeCalc?.monthlyRetainerCzk ?? 10000);
  
  useEffect(() => {
    if (incomeCalc) {
      setClientCount(incomeCalc.clientCount ?? 0);
      setMonthlyRetainer(incomeCalc.monthlyRetainerCzk ?? 10000);
    }
  }, [incomeCalc]);
  
  const handleIncomeUpdate = () => {
    updateIncome.mutate({ clientCount, monthlyRetainerCzk: monthlyRetainer });
  };

  const totalProjects =
    (leadLists.data?.length ?? 0) +
    (campaigns.data?.length ?? 0) +
    (reports.data?.length ?? 0);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[400px] rounded-full blur-[140px] pointer-events-none z-0" style={{ background: "oklch(0.78 0.22 195 / 0.04)" }} />
      <div className="fixed top-1/3 right-1/4 w-[500px] h-[400px] rounded-full blur-[140px] pointer-events-none z-0" style={{ background: "oklch(0.68 0.26 295 / 0.04)" }} />
      <div className="fixed bottom-1/4 left-1/3 w-[400px] h-[300px] rounded-full blur-[120px] pointer-events-none z-0" style={{ background: "oklch(0.72 0.24 340 / 0.03)" }} />

      <div className="relative z-10 px-8 py-10 max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider"
              style={{ background: "oklch(0.78 0.22 195 / 0.1)", border: "1px solid oklch(0.78 0.22 195 / 0.25)", color: "oklch(0.78 0.22 195)" }}
            >
              <Sparkles className="w-3 h-3" style={{ filter: "drop-shadow(0 0 4px oklch(0.78 0.22 195))" }} />
              AI-POWERED AGENCY WORKFLOW
            </div>
          </div>

          <h1 className="text-5xl font-bold text-foreground leading-[1.1] tracking-tight mb-4">
            Od prospectu k{" "}
            <span
              className="gradient-text-cyan"
              style={{ display: "inline-block" }}
            >
              Prezentaci,
            </span>
            <br />
            <span className="text-foreground/90">Automatizovaně.</span>
          </h1>

          <p className="text-muted-foreground text-base max-w-xl leading-relaxed">
            Kompletní 5-krokový framework pro moderní agentury. Generujte leady, tvořte outreach,
            zkoumejte značky a dodávejte profesionální prezentace — vše popohaněno AI.
          </p>

          {/* Quick stats */}
          {totalProjects > 0 && (
            <div className="flex items-center gap-4 mt-6">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                style={{ background: "oklch(0.78 0.22 195 / 0.08)", border: "1px solid oklch(0.78 0.22 195 / 0.2)" }}
              >
                <Activity className="w-3.5 h-3.5" style={{ color: "oklch(0.78 0.22 195)" }} />
                <span className="text-foreground font-semibold">{totalProjects}</span>
                <span className="text-muted-foreground">uložených projektů</span>
              </div>
              <span className="text-muted-foreground text-sm">
                Vítejte zpět, <span className="text-foreground font-medium">{user?.name?.split(" ")[0] ?? ""}</span>
              </span>
            </div>
          )}
        </div>

        {/* ── Income Calculator ── */}
        {incomeCalc && (
          <div className="mb-10 p-6 rounded-2xl border" style={{ background: "oklch(0.10 0.016 260)", borderColor: "oklch(0.78 0.22 195 / 0.3)", boxShadow: "0 0 24px oklch(0.78 0.22 195 / 0.1)" }}>
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <span style={{ color: "oklch(0.78 0.22 195)" }}>✦</span>
              Kalkulátor příjmů
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2 block">
                  Počet klientů
                </Label>
                <Input
                  type="number"
                  value={clientCount}
                  onChange={(e) => setClientCount(parseInt(e.target.value) || 0)}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2 block">
                  Měsíční retainer (Kč)
                </Label>
                <Input
                  type="number"
                  value={monthlyRetainer}
                  onChange={(e) => setMonthlyRetainer(parseInt(e.target.value) || 0)}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2 block">
                  Měsíční příjem
                </Label>
                <div className="text-2xl font-bold text-foreground">
                  {(clientCount * monthlyRetainer).toLocaleString()} Kč
                </div>
              </div>
            </div>
            <Button
              onClick={handleIncomeUpdate}
              className="mt-4 w-full"
              style={{ background: "oklch(0.78 0.22 195)", color: "white" }}
            >
              Uložit
            </Button>
          </div>
        )}

        {/* ── Workflow Diagram ── */}
        <div className="mb-10 mt-2">
          <WorkflowDiagram />
        </div>

        {/* Step cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {STEPS.slice(0, 3).map((step) => {
            const Icon = step.icon;
            return (
              <Link key={step.path} href={step.path}>
                <div
                  data-onboarding={step.label === "Attract" ? "attract-card" : undefined}
                  className="group relative rounded-2xl p-5 cursor-pointer transition-all duration-300 h-full"
                  style={{
                    background: `linear-gradient(135deg, ${step.glowSoft}, oklch(0.10 0.016 260))`,
                    border: `1px solid ${step.border}`,
                    boxShadow: `0 4px 24px oklch(0 0 0 / 0.3)`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 32px ${step.glow}, 0 8px 40px oklch(0 0 0 / 0.4)`;
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = step.color.replace(")", " / 0.5)");
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px oklch(0 0 0 / 0.3)`;
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = step.border;
                  }}
                >
                  {/* Step number */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${step.color.replace(")", " / 0.12)")}`, border: `1px solid ${step.color.replace(")", " / 0.3)")}` }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: step.color, filter: `drop-shadow(0 0 6px ${step.color})` }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono tracking-wider" style={{ color: `${step.color.replace(")", " / 0.6)")}` }}>
                        {step.step}
                      </span>
                      <ArrowRight
                        className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1"
                        style={{ color: `${step.color.replace(")", " / 0.5)")}` }}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-base font-bold text-foreground tracking-tight">{step.label}</h3>
                      <span
                        className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full"
                        style={{ background: `${step.color.replace(")", " / 0.1)")}`, color: `${step.color.replace(")", " / 0.8)")}`, border: `1px solid ${step.color.replace(")", " / 0.2)")}` }}
                      >
                        {step.tag}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>

                  {/* Bottom glow line */}
                  <div
                    className="absolute bottom-0 left-4 right-4 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${step.color}, transparent)` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom row — 2 cards + wider layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STEPS.slice(3).map((step) => {
            const Icon = step.icon;
            return (
              <Link key={step.path} href={step.path}>
                <div
                  className="group relative rounded-2xl p-5 cursor-pointer transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${step.glowSoft}, oklch(0.10 0.016 260))`,
                    border: `1px solid ${step.border}`,
                    boxShadow: `0 4px 24px oklch(0 0 0 / 0.3)`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 32px ${step.glow}, 0 8px 40px oklch(0 0 0 / 0.4)`;
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = step.color.replace(")", " / 0.5)");
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px oklch(0 0 0 / 0.3)`;
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = step.border;
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${step.color.replace(")", " / 0.12)")}`, border: `1px solid ${step.color.replace(")", " / 0.3)")}` }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: step.color, filter: `drop-shadow(0 0 6px ${step.color})` }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-foreground tracking-tight">{step.label}</h3>
                          <span className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${step.color.replace(")", " / 0.1)")}`, color: `${step.color.replace(")", " / 0.8)")}`, border: `1px solid ${step.color.replace(")", " / 0.2)")}` }}>
                            {step.tag}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono" style={{ color: `${step.color.replace(")", " / 0.5)")}` }}>{step.step}</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" style={{ color: `${step.color.replace(")", " / 0.5)")}` }} />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-4 right-4 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${step.color}, transparent)` }} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-10 flex items-center gap-3">
          <div className="neon-divider flex-1" />
          <p className="text-xs font-mono text-muted-foreground/50 tracking-wider px-3">AGENCY AI · 5-KROKOVÝ FRAMEWORK</p>
          <div className="neon-divider flex-1" />
        </div>
      </div>
    </div>
  );
}
