import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Magnet,
  Mail,
  FileText,
  Zap,
  Heart,
  ArrowRight,
  Sparkles,
  FolderOpen,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";

const STEPS = [
  {
    step: "01",
    label: "Attract",
    path: "/attract",
    icon: Magnet,
    description: "Generate targeted lead lists with AI. Define your niche, platform, and criteria — get a structured table of qualified prospects.",
    color: "oklch(0.82 0.08 75)",
    tag: "Lead Generation",
  },
  {
    step: "02",
    label: "Convert",
    path: "/convert",
    icon: Mail,
    description: "Turn your lead list into personalized outreach emails. Each draft references the brand's recent activity for maximum relevance.",
    color: "oklch(0.65 0.12 200)",
    tag: "Outreach",
  },
  {
    step: "03",
    label: "Deliver",
    path: "/deliver",
    icon: FileText,
    description: "Conduct deep brand research and generate professional analysis reports and branded presentations — automatically.",
    color: "oklch(0.7 0.1 150)",
    tag: "Research & Decks",
  },
  {
    step: "04",
    label: "Automate",
    path: "/automate",
    icon: Zap,
    description: "Scale your workflows across the organization. Delegate repetitive tasks to AI and focus on high-leverage decisions.",
    color: "oklch(0.6 0.15 300)",
    tag: "Workflows",
  },
  {
    step: "05",
    label: "Human Element",
    path: "/human-element",
    icon: Heart,
    description: "The irreplaceable edge: taste, vision, and genuine human connection. What AI can execute, only you can direct.",
    color: "oklch(0.7 0.15 10)",
    tag: "Strategy",
  },
];

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">Agency AI</p>
            <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/saved">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2">
              <FolderOpen className="w-4 h-4" />
              Saved Projects
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">{user?.name}</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Hero */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-mono tracking-wider text-primary uppercase">AI-Powered Agency Workflow</span>
          </div>
          <h1 className="text-5xl font-serif text-foreground mb-4 leading-tight">
            From Prospect to Presentation,<br />
            <span className="text-gold-gradient">Automated.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            A complete 5-step framework for modern agencies. Generate leads, craft outreach, research brands,
            and deliver polished presentations — all powered by AI.
          </p>
        </div>

        {/* 5-step framework grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Link key={step.path} href={step.path}>
                <div
                  className={cn(
                    "group relative rounded-xl border border-border bg-card p-6 cursor-pointer",
                    "hover:border-primary/30 transition-all duration-200 hover:bg-card/80",
                    "hover:shadow-[0_0_24px_oklch(0.82_0.08_75/0.08)]",
                    i === 4 ? "md:col-span-2 lg:col-span-1" : ""
                  )}
                >
                  {/* Step number */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${step.color}18`, border: `1px solid ${step.color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: step.color }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono tracking-wider text-muted-foreground">{step.step}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/60 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>

                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-lg font-serif text-foreground">{step.label}</h3>
                    <span
                      className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: `${step.color}15`, color: step.color }}
                    >
                      {step.tag}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

                  {/* Bottom accent line */}
                  <div
                    className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `linear-gradient(90deg, transparent, ${step.color}40, transparent)` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">Quick start:</p>
          <Link href="/attract">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Magnet className="w-3.5 h-3.5" />
              Generate Leads
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href="/deliver">
            <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-white/5 gap-2">
              <FileText className="w-3.5 h-3.5" />
              Research a Brand
            </Button>
          </Link>
          <Link href="/saved">
            <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground gap-2">
              <FolderOpen className="w-3.5 h-3.5" />
              View Saved
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Agency AI</p>
            <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">Platform</p>
          </div>
        </div>
        <Button
          onClick={() => window.location.href = getLoginUrl()}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Sign In
        </Button>
      </header>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-mono tracking-wider text-primary uppercase">AI-Powered Agency Workflow</span>
          </div>

          <h1 className="text-6xl font-serif text-foreground mb-6 leading-tight">
            The 5-Step Framework<br />
            <span className="text-gold-gradient">for Modern Agencies</span>
          </h1>

          <p className="text-muted-foreground text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
            Attract leads, convert with personalized outreach, deliver branded research and presentations —
            all automated with AI so you can focus on what only humans can do.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Steps preview */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{ background: `${step.color}15`, color: step.color, border: `1px solid ${step.color}25` }}
                  >
                    <Icon className="w-3 h-3" />
                    {step.label}
                  </div>
                  {i < STEPS.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-muted-foreground/30" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
