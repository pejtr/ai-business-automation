import { Link } from "wouter";
import { Magnet, Mail, FileText, Zap, Heart, ArrowRight, Sparkles, Activity } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const STEPS = [
  {
    step: "01",
    label: "Attract",
    path: "/attract",
    icon: Magnet,
    description: "Generate targeted lead lists with AI. Define your niche, platform, and criteria — get a structured table of qualified prospects.",
    color: "oklch(0.78 0.22 195)",
    glow: "oklch(0.78 0.22 195 / 0.35)",
    glowSoft: "oklch(0.78 0.22 195 / 0.08)",
    border: "oklch(0.78 0.22 195 / 0.3)",
    tag: "Lead Generation",
  },
  {
    step: "02",
    label: "Convert",
    path: "/convert",
    icon: Mail,
    description: "Turn your lead list into personalized outreach emails. Each draft references the brand's recent activity for maximum relevance.",
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
    description: "Conduct deep brand research and generate professional analysis reports and branded presentations — automatically.",
    color: "oklch(0.72 0.24 340)",
    glow: "oklch(0.72 0.24 340 / 0.35)",
    glowSoft: "oklch(0.72 0.24 340 / 0.08)",
    border: "oklch(0.72 0.24 340 / 0.3)",
    tag: "Research & Decks",
  },
  {
    step: "04",
    label: "Automate",
    path: "/automate",
    icon: Zap,
    description: "Set up recurring workflows that run your agency processes on autopilot — from lead refresh to report delivery.",
    color: "oklch(0.78 0.22 145)",
    glow: "oklch(0.78 0.22 145 / 0.35)",
    glowSoft: "oklch(0.78 0.22 145 / 0.08)",
    border: "oklch(0.78 0.22 145 / 0.3)",
    tag: "Workflows",
  },
  {
    step: "05",
    label: "Human Element",
    path: "/human-element",
    icon: Heart,
    description: "The irreplaceable layer — your vision, taste, and care that transforms automated output into genuine client relationships.",
    color: "oklch(0.82 0.18 75)",
    glow: "oklch(0.82 0.18 75 / 0.35)",
    glowSoft: "oklch(0.82 0.18 75 / 0.08)",
    border: "oklch(0.82 0.18 75 / 0.3)",
    tag: "Vision & Taste",
  },
];

export default function Home() {
  const { user } = useAuth();
  const leadLists = trpc.attract.list.useQuery();
  const campaigns = trpc.convert.list.useQuery();
  const reports = trpc.deliver.list.useQuery();

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
            From Prospect to{" "}
            <span
              className="gradient-text-cyan"
              style={{ display: "inline-block" }}
            >
              Presentation,
            </span>
            <br />
            <span className="text-foreground/90">Automated.</span>
          </h1>

          <p className="text-muted-foreground text-base max-w-xl leading-relaxed">
            A complete 5-step framework for modern agencies. Generate leads, craft outreach,
            research brands, and deliver polished presentations — all powered by AI.
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
                <span className="text-muted-foreground">saved projects</span>
              </div>
              <span className="text-muted-foreground text-sm">
                Welcome back, <span className="text-foreground font-medium">{user?.name?.split(" ")[0] ?? "there"}</span>
              </span>
            </div>
          )}
        </div>

        {/* Step cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {STEPS.slice(0, 3).map((step) => {
            const Icon = step.icon;
            return (
              <Link key={step.path} href={step.path}>
                <div
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
          <p className="text-xs font-mono text-muted-foreground/50 tracking-wider px-3">AGENCY AI · 5-STEP FRAMEWORK</p>
          <div className="neon-divider flex-1" />
        </div>
      </div>
    </div>
  );
}
