import { Link } from "wouter";
import { Zap, CheckCircle2, ChevronRight, ArrowRight, Clock, RefreshCw, Bell } from "lucide-react";

const stepColor = "oklch(0.78 0.22 145)";

const PLANNED = [
  { icon: RefreshCw, label: "Auto Lead Refresh", desc: "Automatically regenerate your lead list weekly with fresh prospects matching your criteria." },
  { icon: Bell,      label: "Outreach Sequences", desc: "Schedule follow-up emails automatically based on open and click tracking events." },
  { icon: Clock,     label: "Report Scheduling", desc: "Generate and deliver brand research reports to clients on a recurring schedule." },
  { icon: Zap,       label: "Pipeline Triggers", desc: "Move leads through your pipeline automatically when they hit engagement thresholds." },
];

export default function Automate() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed top-1/4 right-1/4 w-[500px] h-[400px] rounded-full blur-[140px] pointer-events-none z-0" style={{ background: "oklch(0.78 0.22 145 / 0.05)" }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="px-8 py-6" style={{ borderBottom: "1px solid oklch(0.18 0.02 260)" }}>
          <div className="flex items-center gap-2 text-xs font-mono mb-3" style={{ color: "oklch(0.40 0.02 260)" }}>
            <span>Framework</span>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: stepColor }}>Automate</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.78 0.22 145 / 0.12)", border: "1px solid oklch(0.78 0.22 145 / 0.35)", boxShadow: "0 0 16px oklch(0.78 0.22 145 / 0.2)" }}>
              <Zap className="w-4 h-4" style={{ color: stepColor, filter: "drop-shadow(0 0 6px oklch(0.78 0.22 145))" }} />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Automate</h1>
            <span className="neon-badge" style={{ color: stepColor, background: "oklch(0.78 0.22 145 / 0.1)", borderColor: "oklch(0.78 0.22 145 / 0.3)", boxShadow: "0 0 10px oklch(0.78 0.22 145 / 0.2)" }}>
              STEP 04
            </span>
          </div>
          <p className="text-muted-foreground text-sm ml-12">
            Set up recurring workflows that run your agency processes on autopilot.
          </p>
        </div>

        <div className="px-8 py-10 max-w-3xl">
          {/* Coming soon hero */}
          <div
            className="rounded-2xl p-10 text-center mb-8 relative overflow-hidden"
            style={{ background: "oklch(0.10 0.016 260)", border: "1px solid oklch(0.78 0.22 145 / 0.25)", boxShadow: "0 0 40px oklch(0.78 0.22 145 / 0.08)" }}
          >
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, oklch(0.78 0.22 145 / 0.15) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
            <div className="relative">
              <div className="relative w-16 h-16 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full blur-xl" style={{ background: "oklch(0.78 0.22 145 / 0.3)", animation: "pulse 2s infinite" }} />
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "oklch(0.78 0.22 145 / 0.12)", border: "1px solid oklch(0.78 0.22 145 / 0.4)" }}>
                  <Zap className="w-7 h-7" style={{ color: stepColor, filter: "drop-shadow(0 0 8px oklch(0.78 0.22 145))" }} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Workflow Automation</h2>
              <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto leading-relaxed">
                Connect your Attract, Convert, and Deliver workflows into fully automated pipelines —
                from lead discovery to personalized outreach to delivered reports.
              </p>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-wider" style={{ background: "oklch(0.78 0.22 145 / 0.1)", color: stepColor, border: "1px solid oklch(0.78 0.22 145 / 0.3)", boxShadow: "0 0 12px oklch(0.78 0.22 145 / 0.2)" }}>
                Coming Soon
              </span>
            </div>
          </div>

          {/* Planned features */}
          <p className="text-xs font-mono tracking-wider uppercase mb-4" style={{ color: "oklch(0.40 0.02 260)" }}>Planned Automations</p>
          <div className="space-y-3 mb-8">
            {PLANNED.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-start gap-4 rounded-xl p-4 transition-all duration-200"
                  style={{ background: "oklch(0.10 0.016 260)", border: "1px solid oklch(0.20 0.022 260)" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(0.78 0.22 145 / 0.3)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 20px oklch(0.78 0.22 145 / 0.08)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(0.20 0.022 260)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "oklch(0.78 0.22 145 / 0.1)", border: "1px solid oklch(0.78 0.22 145 / 0.25)" }}>
                    <Icon className="w-4 h-4" style={{ color: stepColor }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full" style={{ background: "oklch(0.78 0.22 145 / 0.1)", color: "oklch(0.78 0.22 145 / 0.7)", border: "1px solid oklch(0.78 0.22 145 / 0.2)" }}>
                        planned
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: "oklch(0.78 0.22 145 / 0.4)" }} />
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <Link href="/attract">
            <div
              className="flex items-center justify-between rounded-xl p-4 cursor-pointer transition-all duration-200 group"
              style={{ background: "oklch(0.78 0.22 145 / 0.06)", border: "1px solid oklch(0.78 0.22 145 / 0.2)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = "oklch(0.78 0.22 145 / 0.1)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 24px oklch(0.78 0.22 145 / 0.15)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = "oklch(0.78 0.22 145 / 0.06)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">Start with Attract</p>
                <p className="text-xs text-muted-foreground">Generate your first lead list while automation is in development</p>
              </div>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: stepColor }} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
