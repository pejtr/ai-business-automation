import { ChevronRight, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const AUTOMATION_IDEAS = [
  "Auto-reply to inbound leads based on intent detection",
  "Schedule and queue outreach emails via Instantly or Smartlead",
  "Monitor inbox for replies and trigger follow-up sequences",
  "Slack notifications for new leads and campaign metrics",
  "Weekly performance summaries sent to your team",
  "Auto-generate reports for new client onboarding",
];

const stepColor = "oklch(0.6 0.15 300)";

export default function Automate() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-3">
          <span>Framework</span>
          <ChevronRight className="w-3 h-3" />
          <span style={{ color: stepColor }}>Automate</span>
        </div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `oklch(0.6 0.15 300 / 0.1)`, border: `1px solid oklch(0.6 0.15 300 / 0.2)` }}>
            <Zap className="w-4 h-4" style={{ color: stepColor }} />
          </div>
          <h1 className="text-3xl font-serif text-foreground">Automate</h1>
          <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full border" style={{ color: stepColor, background: `oklch(0.6 0.15 300 / 0.1)`, borderColor: `oklch(0.6 0.15 300 / 0.2)` }}>
            STEP 04
          </span>
        </div>
        <p className="text-muted-foreground text-sm ml-12">
          Scale your workflows across the organization. Delegate repetitive tasks to AI.
        </p>
      </div>

      <div className="px-8 py-12 max-w-3xl">
        <div className="rounded-xl border border-border bg-card p-8 text-center mb-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: `oklch(0.6 0.15 300 / 0.1)`, border: `1px solid oklch(0.6 0.15 300 / 0.2)` }}>
            <Zap className="w-7 h-7" style={{ color: stepColor }} />
          </div>
          <h2 className="text-2xl font-serif text-foreground mb-3">Workflow Automation</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto mb-6">
            This module will connect your Attract, Convert, and Deliver workflows into fully automated pipelines —
            from lead discovery to personalized outreach to delivered reports, all without manual intervention.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono tracking-wider" style={{ background: `oklch(0.6 0.15 300 / 0.1)`, color: stepColor, border: `1px solid oklch(0.6 0.15 300 / 0.2)` }}>
            Coming Soon
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Planned Automations</h3>
          <div className="space-y-3">
            {AUTOMATION_IDEAS.map((idea, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: `oklch(0.6 0.15 300 / 0.5)` }} />
                <p className="text-sm text-muted-foreground">{idea}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <p className="text-sm text-muted-foreground">In the meantime, continue with:</p>
          <Link href="/attract">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              Attract <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
