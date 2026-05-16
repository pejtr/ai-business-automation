import { Link } from "wouter";
import { Heart, Eye, Lightbulb, ChevronRight, ArrowRight, Users } from "lucide-react";

const stepColor = "oklch(0.82 0.18 75)";

const PILLARS = [
  {
    icon: Eye,
    label: "Vkus",
    color: "oklch(0.82 0.18 75)",
    description: "Schopnost rozpoznat kvalitu, krásu a rezonanci. AI může generovat — jen vy dokážete rozeznat, co skutečně oslovuje publikum.",
  },
  {
    icon: Lightbulb,
    label: "Vize",
    color: "oklch(0.78 0.22 195)",
    description: "Strategický směr, který žádný algoritmus nedá definovat. Kam chcete vzvést své klienty? Jakou budoucnost budujete?",
  },
  {
    icon: Users,
    label: "Péče",
    color: "oklch(0.72 0.24 340)",
    description: "Skutečný zájem o úspěch vašich klientů. Vztah, důvěra, důslednost — to jsou nenahraditelné lidské vlastnosti.",
  },
];

const PROMPTS = [
  "Jak vypadá váš ideální klientský vztah?",
  "Jaký kreativní směr odlišuje vaši agenturu?",
  "Jak chcete, aby se klienti cítili po spolupráci s vámi?",
  "Jakou vizi budujete v tomto roce?",
];

export default function HumanElement() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient glows */}
      <div className="fixed top-1/4 left-1/3 w-[500px] h-[400px] rounded-full blur-[140px] pointer-events-none z-0" style={{ background: "oklch(0.82 0.18 75 / 0.05)" }} />
      <div className="fixed bottom-1/3 right-1/4 w-[400px] h-[300px] rounded-full blur-[120px] pointer-events-none z-0" style={{ background: "oklch(0.72 0.24 340 / 0.04)" }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="px-8 py-6" style={{ borderBottom: "1px solid oklch(0.18 0.02 260)" }}>
          <div className="flex items-center gap-2 text-xs font-mono mb-3" style={{ color: "oklch(0.40 0.02 260)" }}>
            <span>Framework</span>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: stepColor }}>Human Element</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.82 0.18 75 / 0.12)", border: "1px solid oklch(0.82 0.18 75 / 0.35)", boxShadow: "0 0 16px oklch(0.82 0.18 75 / 0.2)" }}>
              <Heart className="w-4 h-4" style={{ color: stepColor, filter: "drop-shadow(0 0 6px oklch(0.82 0.18 75))" }} />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Human Element</h1>
            <span className="neon-badge" style={{ color: stepColor, background: "oklch(0.82 0.18 75 / 0.1)", borderColor: "oklch(0.82 0.18 75 / 0.3)", boxShadow: "0 0 10px oklch(0.82 0.18 75 / 0.2)" }}>
              STEP 05
            </span>
          </div>
          <p className="text-muted-foreground text-sm ml-12">
            Nenahraditelná vrstva, která proměňuje automatizovaný výstup ve skutečné klientské vztahy.
          </p>
        </div>

        <div className="px-8 py-10 max-w-3xl">
          {/* Philosophy quote */}
          <div
            className="rounded-2xl p-8 mb-8 relative overflow-hidden"
            style={{ background: "oklch(0.10 0.016 260)", border: "1px solid oklch(0.82 0.18 75 / 0.25)", boxShadow: "0 0 40px oklch(0.82 0.18 75 / 0.06)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, oklch(0.82 0.18 75 / 0.5), transparent)" }} />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, oklch(0.82 0.18 75 / 0.2) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
            <blockquote className="relative text-lg font-medium text-foreground leading-relaxed italic text-center">
              "„AI zvládá objem. Vy přinášíte{" "}
              <span style={{ color: stepColor, filter: "drop-shadow(0 0 8px oklch(0.82 0.18 75 / 0.6))" }}>vizi</span>,{" "}
              {" "}
              <span style={{ color: "oklch(0.78 0.22 195)", filter: "drop-shadow(0 0 8px oklch(0.78 0.22 195 / 0.6))" }}>vkus</span>{" "}
              a{" "}
              <span style={{ color: "oklch(0.72 0.24 340)", filter: "drop-shadow(0 0 8px oklch(0.72 0.24 340 / 0.6))" }}>péči</span>.“
            </blockquote>
          </div>

          {/* Three pillars */}
          <p className="text-xs font-mono tracking-wider uppercase mb-4" style={{ color: "oklch(0.40 0.02 260)" }}>Tři pilíře</p>
          <div data-onboarding="human-pillars" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.label}
                  className="rounded-2xl p-5 transition-all duration-300 relative overflow-hidden"
                  style={{ background: "oklch(0.10 0.016 260)", border: `1px solid ${pillar.color.replace(")", " / 0.25)")}` }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 28px ${pillar.color.replace(")", " / 0.15)")}`;
                    (e.currentTarget as HTMLDivElement).style.borderColor = pillar.color.replace(")", " / 0.45)");
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLDivElement).style.borderColor = pillar.color.replace(")", " / 0.25)");
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  }}
                >
                  <div className="absolute bottom-0 left-4 right-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${pillar.color}, transparent)`, opacity: 0.4 }} />
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${pillar.color.replace(")", " / 0.12)")}`, border: `1px solid ${pillar.color.replace(")", " / 0.3)")}` }}>
                    <Icon className="w-5 h-5" style={{ color: pillar.color, filter: `drop-shadow(0 0 6px ${pillar.color})` }} />
                  </div>
                  <h3 className="text-base font-bold mb-2 tracking-tight" style={{ color: pillar.color }}>{pillar.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>

          {/* Reflection prompts */}
          <div
            className="rounded-2xl p-6 mb-8"
            style={{ background: "oklch(0.10 0.016 260)", border: "1px solid oklch(0.20 0.022 260)" }}
          >
            <p className="text-xs font-mono tracking-wider uppercase mb-4" style={{ color: "oklch(0.40 0.02 260)" }}>Reflexní otázky</p>
            <div className="space-y-3">
              {PROMPTS.map((prompt, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-[10px] font-mono mt-0.5 flex-shrink-0 w-5" style={{ color: "oklch(0.82 0.18 75 / 0.5)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{prompt}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link href="/">
            <div
              className="flex items-center justify-between rounded-xl p-4 cursor-pointer transition-all duration-200 group"
              style={{ background: "oklch(0.82 0.18 75 / 0.06)", border: "1px solid oklch(0.82 0.18 75 / 0.2)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = "oklch(0.82 0.18 75 / 0.1)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 24px oklch(0.82 0.18 75 / 0.15)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = "oklch(0.82 0.18 75 / 0.06)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">Zpět na dashboard</p>
                <p className="text-xs text-muted-foreground">Vrátit se na přehled celého 5-krokového frameworku</p>
              </div>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: stepColor }} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
