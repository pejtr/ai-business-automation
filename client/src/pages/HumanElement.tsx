import { ChevronRight, Heart, Eye, Palette, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const PILLARS = [
  {
    icon: Palette,
    title: "Taste",
    description: "Knowing what a good final product looks like. The ability to recognize quality, refine output, and set the standard that AI cannot define on its own.",
  },
  {
    icon: Eye,
    title: "Vision",
    description: "Understanding future trends, strategic direction, and the bigger picture. Seeing what the market needs before it knows it needs it.",
  },
  {
    icon: Users,
    title: "Care",
    description: "Genuine human-to-human connection. Emotional intelligence, understanding client motivations, and building relationships that no AI can replicate.",
  },
];

const stepColor = "oklch(0.7 0.15 10)";

export default function HumanElement() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-3">
          <span>Framework</span>
          <ChevronRight className="w-3 h-3" />
          <span style={{ color: stepColor }}>Human Element</span>
        </div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `oklch(0.7 0.15 10 / 0.1)`, border: `1px solid oklch(0.7 0.15 10 / 0.2)` }}>
            <Heart className="w-4 h-4" style={{ color: stepColor }} />
          </div>
          <h1 className="text-3xl font-serif text-foreground">Human Element</h1>
          <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full border" style={{ color: stepColor, background: `oklch(0.7 0.15 10 / 0.1)`, borderColor: `oklch(0.7 0.15 10 / 0.2)` }}>
            STEP 05
          </span>
        </div>
        <p className="text-muted-foreground text-sm ml-12">
          The irreplaceable edge. What AI can execute, only you can direct.
        </p>
      </div>

      <div className="px-8 py-12 max-w-3xl">
        {/* Philosophy */}
        <div className="rounded-xl border border-border bg-card p-8 mb-8">
          <blockquote className="text-2xl font-serif text-foreground leading-relaxed mb-4">
            "When AI handles the execution, the human's role shifts to providing what AI cannot."
          </blockquote>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The most successful agencies in the AI era are not those who use AI the most — they are those who
            understand where AI ends and human value begins. Attract, Convert, and Deliver can all be automated.
            But the taste to know what's excellent, the vision to see what's next, and the care to build real
            relationships — those remain irreplaceable.
          </p>
        </div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="rounded-xl border border-border bg-card p-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4" style={{ background: `oklch(0.7 0.15 10 / 0.1)`, border: `1px solid oklch(0.7 0.15 10 / 0.2)` }}>
                  <Icon className="w-4 h-4" style={{ color: stepColor }} />
                </div>
                <h3 className="text-lg font-serif text-foreground mb-2">{pillar.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{pillar.description}</p>
              </div>
            );
          })}
        </div>

        {/* Reflection prompts */}
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Reflection Prompts</h3>
          <div className="space-y-3">
            {[
              "What does an exceptional deliverable look like for your clients — and can you articulate why?",
              "Where is your industry heading in 18 months, and are you positioned for it?",
              "Which client relationships are built on genuine trust, not just transactions?",
              "What would you do with your time if AI handled 80% of your execution?",
            ].map((prompt, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                <span className="text-[10px] font-mono text-muted-foreground/50 mt-0.5 w-4">{i + 1}.</span>
                <p className="text-sm text-muted-foreground italic leading-relaxed">{prompt}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">Ready to put this into practice?</p>
          <Link href="/">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              Back to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
