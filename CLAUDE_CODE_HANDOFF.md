# 🚀 Claude Code — Kompletní Handoff Prompt

Tento dokument je připraven pro přímé zkopírování do Claude Code. Obsahuje všechny detaily pro implementaci 3 HIGH priority features.

---

## 📌 INSTRUKCE PRO CLAUDE CODE

Jste vývojář na projektu **Agency AI** — AI Business Automation Platform. Vaším úkolem je implementovat **3 nové HIGH priority features** podle níže uvedeného zadání.

### Projekt Info
- **URL:** https://ai-business-automation.manus.space
- **GitHub:** https://github.com/pejtr/ai-business-automation
- **Stack:** React 19 + Express 4 + tRPC 11 + MySQL + Drizzle ORM
- **Jazyk:** Česky (všechny UI texty a AI prompty)

### Vaše Role
1. Implementovat backend (tRPC + DB)
2. Implementovat frontend (React komponenty)
3. Napsat Vitest testy
4. Commitnout na GitHub
5. Vytvořit checkpoint

---

## 🎯 FEATURE 1: AI-powered Pitch Scripts

### Zadání
Nahradit lokální placeholder texty skutečně personalizovanými skriptem generovanými přes LLM na základě lead dat a odvětví.

### Backend Implementation

#### 1. DB Schema (Drizzle)
**Soubor:** `drizzle/schema.ts`

Přidej novou tabulku:
```typescript
export const pitchScripts = sqliteTable('pitch_scripts', {
  id: text('id').primaryKey(),
  leadId: text('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  scriptType: text('script_type').notNull(), // 'walk-in' | 'video-demo'
  walkInScript: text('walk_in_script'),
  videoDemoScript: text('video_demo_script'),
  generatedAt: integer('generated_at', { mode: 'timestamp' }).notNull(),
  tokensUsed: integer('tokens_used'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});
```

**Migrační kroky:**
1. Spusť: `pnpm drizzle-kit generate`
2. Zkontroluj vygenerovaný SQL soubor v `drizzle/migrations/`
3. Aplikuj migraci přes Manus UI (Database panel)

#### 2. DB Helpers
**Soubor:** `server/db.ts`

Přidej tyto funkce:
```typescript
import { pitchScripts } from '../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export async function savePitchScript(data: {
  leadId: string;
  scriptType: 'walk-in' | 'video-demo';
  walkInScript?: string;
  videoDemoScript?: string;
  tokensUsed: number;
}) {
  return db.insert(pitchScripts).values({
    id: crypto.randomUUID(),
    leadId: data.leadId,
    scriptType: data.scriptType,
    walkInScript: data.walkInScript,
    videoDemoScript: data.videoDemoScript,
    tokensUsed: data.tokensUsed,
    generatedAt: new Date(),
  });
}

export async function getPitchScriptsByLead(leadId: string) {
  return db.query.pitchScripts.findMany({
    where: eq(pitchScripts.leadId, leadId),
    orderBy: [desc(pitchScripts.generatedAt)],
  });
}

export async function getPitchScriptById(scriptId: string) {
  return db.query.pitchScripts.findFirst({
    where: eq(pitchScripts.id, scriptId),
  });
}
```

#### 3. tRPC Procedure
**Soubor:** `server/routers.ts`

Přidej do `convert` routeru:
```typescript
generatePitchScript: protectedProcedure
  .input(z.object({
    leadId: z.string(),
    leadName: z.string(),
    leadCompany: z.string(),
    leadIndustry: z.string(),
    leadRecentNews: z.string().optional(),
    scriptType: z.enum(['walk-in', 'video-demo']),
  }))
  .mutation(async ({ input, ctx }) => {
    // Načti lead data z DB
    const lead = await db.query.leads.findFirst({
      where: eq(leads.id, input.leadId),
    });

    if (!lead) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Lead not found' });
    }

    // Příprava LLM promptu
    const scriptTypeText = input.scriptType === 'walk-in' 
      ? 'Walk-in skript: 3-5 vět, přátelský tón, přímý kontakt'
      : 'Video demo skript: 5-10 vět, profesionální, zaměř se na benefits';

    const prompt = `Jsi expert na sales outreach. Vygeneruj personalizovaný ${input.scriptType} skript pro lead.

Lead info:
- Jméno: ${input.leadName}
- Firma: ${input.leadCompany}
- Odvětví: ${input.leadIndustry}
${input.leadRecentNews ? `- Poslední zprávy: ${input.leadRecentNews}` : ''}

Požadavky:
- ${scriptTypeText}
- Personalizuj na konkrétní firmu a odvětví
- Zahrň specifické pain points pro ${input.leadIndustry}
- Česky

Vygeneruj pouze skript, bez dalšího textu.`;

    // Zavolej LLM
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'Jsi expert na sales outreach a generování personalizovaných skriptů.' },
        { role: 'user', content: prompt },
      ],
    });

    const scriptContent = response.choices[0].message.content;
    const tokensUsed = response.usage?.total_tokens || 0;

    // Ulož do DB
    const result = await savePitchScript({
      leadId: input.leadId,
      scriptType: input.scriptType,
      walkInScript: input.scriptType === 'walk-in' ? scriptContent : undefined,
      videoDemoScript: input.scriptType === 'video-demo' ? scriptContent : undefined,
      tokensUsed,
    });

    return {
      scriptId: result[0].id,
      leadId: input.leadId,
      scriptType: input.scriptType,
      content: scriptContent,
      generatedAt: new Date(),
      tokensUsed,
    };
  }),

getPitchScripts: protectedProcedure
  .input(z.object({
    leadId: z.string(),
  }))
  .query(async ({ input }) => {
    return getPitchScriptsByLead(input.leadId);
  }),
```

#### 4. Vitest Tests
**Soubor:** `server/routers/convert.generatePitchScript.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTRPCMsw } from 'trpc-msw';
import { appRouter } from '../routers';

describe('convert.generatePitchScript', () => {
  const caller = appRouter.createCaller({ user: { id: 'test-user' } });

  it('should generate walk-in script with LLM', async () => {
    const result = await caller.convert.generatePitchScript({
      leadId: 'lead-123',
      leadName: 'John Doe',
      leadCompany: 'TechCorp',
      leadIndustry: 'tech',
      scriptType: 'walk-in',
    });

    expect(result).toHaveProperty('scriptId');
    expect(result).toHaveProperty('content');
    expect(result.scriptType).toBe('walk-in');
    expect(result.content.length).toBeGreaterThan(0);
  });

  it('should generate video demo script', async () => {
    const result = await caller.convert.generatePitchScript({
      leadId: 'lead-456',
      leadName: 'Jane Smith',
      leadCompany: 'StartupXYZ',
      leadIndustry: 'tech',
      scriptType: 'video-demo',
    });

    expect(result.scriptType).toBe('video-demo');
    expect(result.content).toContain('Dobrý den'); // Czech greeting
  });

  it('should include industry-specific content', async () => {
    const result = await caller.convert.generatePitchScript({
      leadId: 'lead-789',
      leadName: 'Bob Johnson',
      leadCompany: 'FitnessGym',
      leadIndustry: 'fitness',
      leadRecentNews: 'Nově otevřená pobočka',
      scriptType: 'walk-in',
    });

    expect(result.content).toContain('fitness') || expect(result.content).toContain('zdraví');
  });

  it('should save to database', async () => {
    const result = await caller.convert.generatePitchScript({
      leadId: 'lead-db-test',
      leadName: 'Test User',
      leadCompany: 'Test Company',
      leadIndustry: 'tech',
      scriptType: 'walk-in',
    });

    const scripts = await caller.convert.getPitchScripts({
      leadId: 'lead-db-test',
    });

    expect(scripts.length).toBeGreaterThan(0);
    expect(scripts[0].scriptType).toBe('walk-in');
  });

  it('should track token usage', async () => {
    const result = await caller.convert.generatePitchScript({
      leadId: 'lead-tokens',
      leadName: 'Token Test',
      leadCompany: 'Test Corp',
      leadIndustry: 'tech',
      scriptType: 'walk-in',
    });

    expect(result.tokensUsed).toBeGreaterThan(0);
  });
});
```

### Frontend Implementation

#### 1. Komponenta
**Soubor:** `client/src/components/PitchScriptGenerator.tsx`

```typescript
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Copy, Check } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface PitchScriptGeneratorProps {
  leadId: string;
  leadName: string;
  leadCompany: string;
  leadIndustry: string;
  leadRecentNews?: string;
}

export function PitchScriptGenerator({
  leadId,
  leadName,
  leadCompany,
  leadIndustry,
  leadRecentNews,
}: PitchScriptGeneratorProps) {
  const [copied, setCopied] = useState<'walk-in' | 'video-demo' | null>(null);
  const generateMutation = trpc.convert.generatePitchScript.useMutation();
  const getScriptQuery = trpc.convert.getPitchScripts.useQuery({ leadId });

  const handleGenerateScript = async (scriptType: 'walk-in' | 'video-demo') => {
    await generateMutation.mutateAsync({
      leadId,
      leadName,
      leadCompany,
      leadIndustry,
      leadRecentNews,
      scriptType,
    });
    getScriptQuery.refetch();
  };

  const handleCopy = (text: string, type: 'walk-in' | 'video-demo') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const scripts = getScriptQuery.data || [];
  const walkInScript = scripts.find(s => s.scriptType === 'walk-in');
  const videoDemoScript = scripts.find(s => s.scriptType === 'video-demo');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pitch Scripts</h3>
          <p className="text-sm text-gray-400">
            {leadName} @ {leadCompany} ({leadIndustry})
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => handleGenerateScript('walk-in')}
          disabled={generateMutation.isPending}
          className="flex items-center gap-2"
        >
          {generateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Generovat Walk-in Skript
        </Button>
        <Button
          onClick={() => handleGenerateScript('video-demo')}
          disabled={generateMutation.isPending}
          variant="outline"
          className="flex items-center gap-2"
        >
          {generateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Generovat Video Demo Skript
        </Button>
      </div>

      {/* Walk-in Script */}
      {walkInScript && (
        <Card className="p-4 border-cyan-500/20 bg-cyan-500/5">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-cyan-400">Walk-in Skript</h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(walkInScript.walkInScript || '', 'walk-in')}
            >
              {copied === 'walk-in' ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">
            {walkInScript.walkInScript}
          </p>
        </Card>
      )}

      {/* Video Demo Script */}
      {videoDemoScript && (
        <Card className="p-4 border-violet-500/20 bg-violet-500/5">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-violet-400">Video Demo Skript</h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(videoDemoScript.videoDemoScript || '', 'video-demo')}
            >
              {copied === 'video-demo' ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">
            {videoDemoScript.videoDemoScript}
          </p>
        </Card>
      )}
    </div>
  );
}
```

#### 2. Integrace do Convert modulu
**Soubor:** `client/src/pages/Convert.tsx`

Přidej nový tab:
```typescript
import { PitchScriptGenerator } from '@/components/PitchScriptGenerator';

// V komponentě Convert, přidej tab:
<Tabs defaultValue="email">
  <TabsList>
    <TabsTrigger value="email">Email Template</TabsTrigger>
    <TabsTrigger value="pitch-scripts">Pitch Scripts</TabsTrigger>
    <TabsTrigger value="tracking">Tracking</TabsTrigger>
  </TabsList>

  <TabsContent value="pitch-scripts">
    {selectedLead && (
      <PitchScriptGenerator
        leadId={selectedLead.id}
        leadName={selectedLead.name}
        leadCompany={selectedLead.company}
        leadIndustry={selectedLead.industry}
        leadRecentNews={selectedLead.recentNews}
      />
    )}
  </TabsContent>
</Tabs>
```

#### 3. Frontend Tests
**Soubor:** `client/src/components/PitchScriptGenerator.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PitchScriptGenerator } from './PitchScriptGenerator';
import { trpc } from '@/lib/trpc';

describe('PitchScriptGenerator', () => {
  it('should render generate buttons', () => {
    render(
      <PitchScriptGenerator
        leadId="test-123"
        leadName="John Doe"
        leadCompany="TechCorp"
        leadIndustry="tech"
      />
    );

    expect(screen.getByText('Generovat Walk-in Skript')).toBeInTheDocument();
    expect(screen.getByText('Generovat Video Demo Skript')).toBeInTheDocument();
  });

  it('should display lead info', () => {
    render(
      <PitchScriptGenerator
        leadId="test-123"
        leadName="John Doe"
        leadCompany="TechCorp"
        leadIndustry="tech"
      />
    );

    expect(screen.getByText('John Doe @ TechCorp (tech)')).toBeInTheDocument();
  });

  it('should copy script to clipboard', async () => {
    render(
      <PitchScriptGenerator
        leadId="test-123"
        leadName="John Doe"
        leadCompany="TechCorp"
        leadIndustry="tech"
      />
    );

    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
  });
});
```

---

## 📊 FEATURE 2: Income Growth Visualization

### Zadání
Rozšířit Income Calculator o vizuální progress bar a milestone tracking ukazující cestu od 0 do 100k Kč/měsíc s motivačními texty.

### Frontend Implementation

#### 1. Milestone Constants
**Soubor:** `client/src/constants/milestones.ts`

```typescript
export const INCOME_MILESTONES = [
  { target: 0, label: 'Start', emoji: '🚀', motivation: 'Začínáme!' },
  { target: 10000, label: '10k Kč/měsíc', emoji: '📈', motivation: 'První milestone! Skvělý start.' },
  { target: 25000, label: '25k Kč/měsíc', emoji: '⭐', motivation: 'Už jste na čtvrtině cesty!' },
  { target: 50000, label: '50k Kč/měsíc', emoji: '💪', motivation: 'Polovina! Pokračujte v tom dobrém.' },
  { target: 100000, label: '100k Kč/měsíc', emoji: '🏆', motivation: 'Dosáhli jste cíle! Gratulujeme!' },
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
  }).format(value);
}
```

#### 2. MilestoneTrack Komponenta
**Soubor:** `client/src/components/MilestoneTrack.tsx`

```typescript
import React from 'react';
import { INCOME_MILESTONES, formatCurrency } from '@/constants/milestones';
import { Card } from '@/components/ui/card';

interface MilestoneTrackProps {
  currentIncome: number;
  maxIncome?: number;
}

export function MilestoneTrack({ currentIncome, maxIncome = 100000 }: MilestoneTrackProps) {
  const progress = (currentIncome / maxIncome) * 100;

  // Najdi aktuální milestone
  const currentMilestoneIndex = INCOME_MILESTONES.findIndex((m, idx) => {
    const nextMilestone = INCOME_MILESTONES[idx + 1];
    return currentIncome >= m.target && (!nextMilestone || currentIncome < nextMilestone.target);
  });

  const currentMilestone = INCOME_MILESTONES[currentMilestoneIndex] || INCOME_MILESTONES[0];

  return (
    <Card className="p-6 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border-cyan-500/20">
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Pokrok</span>
            <span className="text-cyan-400 font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Milestone Icons */}
        <div className="flex justify-between text-2xl">
          {INCOME_MILESTONES.map((milestone, idx) => (
            <div
              key={milestone.target}
              className={`transition-all ${
                idx <= currentMilestoneIndex
                  ? 'opacity-100 scale-110'
                  : 'opacity-50 scale-100'
              }`}
              title={milestone.label}
            >
              {milestone.emoji}
            </div>
          ))}
        </div>

        {/* Milestone Labels */}
        <div className="flex justify-between text-xs text-gray-400">
          {INCOME_MILESTONES.map(milestone => (
            <span key={milestone.target}>{milestone.label}</span>
          ))}
        </div>

        {/* Current Status */}
        <div className="border-t border-cyan-500/20 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Aktuální příjem:</span>
            <span className="text-lg font-bold text-cyan-400">
              {formatCurrency(currentIncome)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Milestone:</span>
            <span className="text-lg font-bold">
              {currentMilestone.emoji} {currentMilestone.label}
            </span>
          </div>

          <div className="text-center py-2 bg-violet-500/10 rounded border border-violet-500/20">
            <p className="text-sm font-semibold text-violet-300">
              "{currentMilestone.motivation}"
            </p>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Zbývá do 100k:</span>
            <span className="text-lg font-bold text-green-400">
              {formatCurrency(Math.max(0, maxIncome - currentIncome))}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

#### 3. Integrace do IncomeCalculator
**Soubor:** `client/src/components/IncomeCalculator.tsx`

Přidej MilestoneTrack:
```typescript
import { MilestoneTrack } from './MilestoneTrack';

export function IncomeCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  // ... existující kód ...

  return (
    <div className="space-y-6">
      {/* Existující calculator UI */}
      <div>
        {/* Input fields, sliders, atd. */}
      </div>

      {/* Nový MilestoneTrack */}
      <MilestoneTrack currentIncome={monthlyIncome} maxIncome={100000} />
    </div>
  );
}
```

#### 4. Frontend Tests
**Soubor:** `client/src/components/MilestoneTrack.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MilestoneTrack } from './MilestoneTrack';

describe('MilestoneTrack', () => {
  it('should display correct progress percentage', () => {
    render(<MilestoneTrack currentIncome={50000} maxIncome={100000} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should display current income', () => {
    render(<MilestoneTrack currentIncome={25000} />);
    expect(screen.getByText(/25 000 Kč/)).toBeInTheDocument();
  });

  it('should highlight correct milestone', () => {
    render(<MilestoneTrack currentIncome={25000} />);
    // Ověř, že 3. milestone (⭐) je zvýrazněn
    const milestones = screen.getAllByText(/\d+k Kč/);
    expect(milestones[2]).toHaveClass('opacity-100');
  });

  it('should show motivation text for current milestone', () => {
    render(<MilestoneTrack currentIncome={25000} />);
    expect(screen.getByText(/Už jste na čtvrtině cesty/)).toBeInTheDocument();
  });

  it('should calculate remaining amount correctly', () => {
    render(<MilestoneTrack currentIncome={75000} maxIncome={100000} />);
    expect(screen.getByText(/25 000 Kč/)).toBeInTheDocument(); // Zbývá
  });

  it('should handle zero income', () => {
    render(<MilestoneTrack currentIncome={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText(/Začínáme/)).toBeInTheDocument();
  });

  it('should handle income exceeding max', () => {
    render(<MilestoneTrack currentIncome={150000} maxIncome={100000} />);
    expect(screen.getByText(/150 000 Kč/)).toBeInTheDocument();
  });
});
```

---

## 🎯 FEATURE 3: Niche-specific AI Prompts

### Zadání
Rozšířit Attract generátor tak, aby při výběru niche šablony automaticky přizpůsobil AI prompt kontextem daného odvětví.

### Backend Implementation

#### 1. Niche Context Constants
**Soubor:** `server/constants/niches.ts`

```typescript
export const NICHE_CONTEXTS = {
  tech: {
    keywords: ['AI', 'cloud', 'automation', 'SaaS', 'DevOps', 'API', 'infrastructure'],
    tone: 'technical, data-driven',
    painPoints: ['scaling', 'technical debt', 'team hiring', 'infrastructure costs'],
    toneGuidance: 'Use technical jargon, reference industry trends, focus on ROI and efficiency',
    exampleCompanies: ['Startup', 'SaaS', 'Tech Agency'],
  },
  realEstate: {
    keywords: ['property', 'investment', 'location', 'market', 'portfolio', 'ROI'],
    tone: 'professional, location-focused',
    painPoints: ['lead generation', 'property valuation', 'market analysis', 'client retention'],
    toneGuidance: 'Emphasize location benefits, market trends, investment potential, local expertise',
    exampleCompanies: ['Real Estate Agency', 'Property Developer', 'Investment Firm'],
  },
  fitness: {
    keywords: ['health', 'wellness', 'training', 'nutrition', 'transformation', 'goals'],
    tone: 'motivational, health-focused',
    painPoints: ['member retention', 'class scheduling', 'nutrition guidance', 'transformation tracking'],
    toneGuidance: 'Use motivational language, focus on health benefits, personal transformation, community',
    exampleCompanies: ['Gym', 'Personal Trainer', 'Wellness Coach'],
  },
  ecommerce: {
    keywords: ['sales', 'conversion', 'inventory', 'shipping', 'customer experience', 'growth'],
    tone: 'sales-driven, growth-focused',
    painPoints: ['conversion rate', 'customer acquisition', 'retention', 'inventory management'],
    toneGuidance: 'Focus on sales metrics, growth potential, customer lifetime value, scalability',
    exampleCompanies: ['Online Store', 'Marketplace', 'Direct-to-Consumer Brand'],
  },
  consulting: {
    keywords: ['expertise', 'strategy', 'ROI', 'efficiency', 'transformation', 'advisory'],
    tone: 'professional, strategic',
    painPoints: ['business growth', 'process optimization', 'cost reduction', 'market expansion'],
    toneGuidance: 'Focus on strategic value, industry expertise, proven methodologies',
    exampleCompanies: ['Management Consulting', 'Strategy Firm', 'Business Advisory'],
  },
  healthcare: {
    keywords: ['patient care', 'efficiency', 'compliance', 'health outcomes', 'technology'],
    tone: 'professional, patient-focused',
    painPoints: ['patient retention', 'operational efficiency', 'compliance', 'staff management'],
    toneGuidance: 'Emphasize patient care quality, compliance, operational benefits',
    exampleCompanies: ['Medical Practice', 'Healthcare Clinic', 'Wellness Center'],
  },
  education: {
    keywords: ['learning', 'student engagement', 'outcomes', 'technology', 'growth'],
    tone: 'educational, growth-focused',
    painPoints: ['student retention', 'engagement', 'course development', 'scalability'],
    toneGuidance: 'Focus on student success, learning outcomes, educational innovation',
    exampleCompanies: ['Online Course', 'Training Institute', 'Educational Platform'],
  },
  manufacturing: {
    keywords: ['efficiency', 'production', 'quality', 'supply chain', 'automation'],
    tone: 'technical, efficiency-focused',
    painPoints: ['production efficiency', 'quality control', 'supply chain', 'cost reduction'],
    toneGuidance: 'Focus on operational efficiency, quality metrics, cost savings',
    exampleCompanies: ['Manufacturing Plant', 'Industrial Company', 'Production Facility'],
  },
} as const;

export type NicheType = keyof typeof NICHE_CONTEXTS;
```

#### 2. tRPC Procedure
**Soubor:** `server/routers.ts`

Přidej do `attract` routeru:
```typescript
generateLeadsWithNichContext: protectedProcedure
  .input(z.object({
    niche: z.enum(['tech', 'realEstate', 'fitness', 'ecommerce', 'consulting', 'healthcare', 'education', 'manufacturing']),
    targetRole: z.string().optional(),
    targetCompanySize: z.enum(['startup', 'SME', 'enterprise']).optional(),
    targetLocation: z.string().optional(),
    customKeywords: z.array(z.string()).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const nichContext = NICHE_CONTEXTS[input.niche];
    if (!nichContext) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid niche' });
    }

    // Příprava LLM promptu s niche kontextem
    const prompt = `Jsi expert na lead generation pro ${input.niche} industrii.

Niche Context:
- Klíčová slova: ${nichContext.keywords.join(', ')}
- Tón: ${nichContext.tone}
- Pain points: ${nichContext.painPoints.join(', ')}
- Guidance: ${nichContext.toneGuidance}

Vygeneruj seznam 50 potenciálních leadů pro ${input.niche} s těmito kritérii:
${input.targetRole ? `- Cílová role: ${input.targetRole}` : ''}
${input.targetCompanySize ? `- Velikost firmy: ${input.targetCompanySize}` : ''}
${input.targetLocation ? `- Lokace: ${input.targetLocation}` : ''}
${input.customKeywords ? `- Vlastní keywords: ${input.customKeywords.join(', ')}` : ''}

Pro každý lead vrať JSON s těmito poli:
{
  "name": "Jméno",
  "company": "Firma",
  "email": "email@example.com",
  "position": "Pozice",
  "relevanceScore": 85
}

Zaměř se na ${nichContext.painPoints.join(', ')} jako primární pain points.
Tón komunikace: ${nichContext.toneGuidance}

Vrať POUZE JSON array, bez dalšího textu.`;

    // Zavolej LLM
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'Jsi expert na lead generation. Vrací pouze validní JSON.' },
        { role: 'user', content: prompt },
      ],
    });

    let leads: any[] = [];
    try {
      const content = response.choices[0].message.content;
      leads = JSON.parse(content);
    } catch (e) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to parse LLM response' });
    }

    // Ulož leads do DB
    const leadIds: string[] = [];
    for (const lead of leads) {
      const result = await db.insert(leads).values({
        id: crypto.randomUUID(),
        name: lead.name,
        company: lead.company,
        email: lead.email,
        position: lead.position,
        niche: input.niche,
        relevanceScore: lead.relevanceScore,
        createdAt: new Date(),
      });
      leadIds.push(result[0].id);
    }

    return {
      leadIds,
      niche: input.niche,
      count: leads.length,
      generatedAt: new Date(),
    };
  }),
```

#### 3. Vitest Tests
**Soubor:** `server/routers/attract.generateLeadsWithNichContext.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { appRouter } from '../routers';

describe('attract.generateLeadsWithNichContext', () => {
  const caller = appRouter.createCaller({ user: { id: 'test-user' } });

  it('should generate tech leads with niche context', async () => {
    const result = await caller.attract.generateLeadsWithNichContext({
      niche: 'tech',
    });

    expect(result.leadIds.length).toBe(50);
    expect(result.niche).toBe('tech');
  });

  it('should generate real estate leads', async () => {
    const result = await caller.attract.generateLeadsWithNichContext({
      niche: 'realEstate',
      targetLocation: 'Praha',
    });

    expect(result.leadIds.length).toBeGreaterThan(0);
  });

  it('should apply target role filter', async () => {
    const result = await caller.attract.generateLeadsWithNichContext({
      niche: 'fitness',
      targetRole: 'Manager',
    });

    expect(result.leadIds.length).toBeGreaterThan(0);
  });

  it('should apply company size filter', async () => {
    const result = await caller.attract.generateLeadsWithNichContext({
      niche: 'ecommerce',
      targetCompanySize: 'startup',
    });

    expect(result.leadIds.length).toBeGreaterThan(0);
  });

  it('should include custom keywords', async () => {
    const result = await caller.attract.generateLeadsWithNichContext({
      niche: 'tech',
      customKeywords: ['AI', 'machine learning'],
    });

    expect(result.leadIds.length).toBeGreaterThan(0);
  });

  it('should save leads with relevance scores', async () => {
    const result = await caller.attract.generateLeadsWithNichContext({
      niche: 'consulting',
    });

    const leads = await caller.attract.getLeads({ niche: 'consulting' });
    expect(leads.some(l => l.relevanceScore > 0)).toBe(true);
  });

  it('should reject invalid niche', async () => {
    expect(async () => {
      await caller.attract.generateLeadsWithNichContext({
        niche: 'invalid' as any,
      });
    }).rejects.toThrow();
  });
});
```

### Frontend Implementation

#### 1. Niche Selector
**Soubor:** `client/src/components/NichSelector.tsx`

```typescript
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NICHE_CONTEXTS } from '@/constants/niches';

interface NicheSelectorProps {
  selectedNiche: string;
  onSelect: (niche: string) => void;
}

export function NicheSelector({ selectedNiche, onSelect }: NicheSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Vyberte odvětví</h3>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(NICHE_CONTEXTS).map(([niche, context]) => (
          <Button
            key={niche}
            onClick={() => onSelect(niche)}
            variant={selectedNiche === niche ? 'default' : 'outline'}
            className="h-auto flex-col items-start p-4"
          >
            <span className="font-semibold">{niche}</span>
            <span className="text-xs text-gray-400 mt-1">
              {context.keywords.slice(0, 2).join(', ')}...
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
```

#### 2. Niche Context Preview
**Soubor:** `client/src/components/NicheContextPreview.tsx`

```typescript
import React from 'react';
import { Card } from '@/components/ui/card';
import { NICHE_CONTEXTS } from '@/constants/niches';

interface NicheContextPreviewProps {
  niche: string;
}

export function NicheContextPreview({ niche }: NicheContextPreviewProps) {
  const context = NICHE_CONTEXTS[niche as keyof typeof NICHE_CONTEXTS];
  if (!context) return null;

  return (
    <Card className="p-4 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border-violet-500/20">
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-violet-400 mb-1">Klíčová slova</h4>
          <p className="text-sm text-gray-300">{context.keywords.join(', ')}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-cyan-400 mb-1">Tón</h4>
          <p className="text-sm text-gray-300">{context.tone}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-green-400 mb-1">Pain Points</h4>
          <p className="text-sm text-gray-300">{context.painPoints.join(', ')}</p>
        </div>
      </div>
    </Card>
  );
}
```

#### 3. Integrace do Attract
**Soubor:** `client/src/pages/Attract.tsx`

```typescript
import { NicheSelector } from '@/components/NicheSelector';
import { NicheContextPreview } from '@/components/NicheContextPreview';
import { trpc } from '@/lib/trpc';

export function Attract() {
  const [selectedNiche, setSelectedNiche] = useState('tech');
  const [filters, setFilters] = useState({});
  const generateMutation = trpc.attract.generateLeadsWithNichContext.useMutation();

  const handleGenerate = async () => {
    await generateMutation.mutateAsync({
      niche: selectedNiche,
      ...filters,
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Attract Module</h2>

      {/* Niche Selector */}
      <NicheSelector selectedNiche={selectedNiche} onSelect={setSelectedNiche} />

      {/* Niche Context Preview */}
      <NicheContextPreview niche={selectedNiche} />

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold">Cílová role</label>
          <input
            type="text"
            placeholder="např. CEO, Manager"
            onChange={(e) => setFilters({ ...filters, targetRole: e.target.value })}
            className="w-full mt-2 px-3 py-2 bg-gray-800 rounded border border-gray-700"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Velikost firmy</label>
          <select
            onChange={(e) => setFilters({ ...filters, targetCompanySize: e.target.value })}
            className="w-full mt-2 px-3 py-2 bg-gray-800 rounded border border-gray-700"
          >
            <option value="">Všechny</option>
            <option value="startup">Startup</option>
            <option value="SME">SME</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={generateMutation.isPending}
        className="w-full"
      >
        {generateMutation.isPending ? 'Generuji...' : 'Generovat Leady s Niche Kontextem'}
      </Button>

      {/* Results */}
      {generateMutation.data && (
        <Card className="p-4 bg-green-500/10 border-green-500/20">
          <p className="text-green-400">
            ✓ Vygenerováno {generateMutation.data.leadIds.length} leadů
          </p>
        </Card>
      )}
    </div>
  );
}
```

#### 4. Frontend Tests
**Soubor:** `client/src/components/NicheSelector.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NicheSelector } from './NicheSelector';

describe('NicheSelector', () => {
  it('should render all niches', () => {
    const mockOnSelect = vi.fn();
    render(<NicheSelector selectedNiche="tech" onSelect={mockOnSelect} />);

    expect(screen.getByText('tech')).toBeInTheDocument();
    expect(screen.getByText('realEstate')).toBeInTheDocument();
    expect(screen.getByText('fitness')).toBeInTheDocument();
  });

  it('should call onSelect when niche is clicked', () => {
    const mockOnSelect = vi.fn();
    render(<NicheSelector selectedNiche="tech" onSelect={mockOnSelect} />);

    fireEvent.click(screen.getByText('fitness'));
    expect(mockOnSelect).toHaveBeenCalledWith('fitness');
  });

  it('should highlight selected niche', () => {
    const mockOnSelect = vi.fn();
    const { rerender } = render(
      <NicheSelector selectedNiche="tech" onSelect={mockOnSelect} />
    );

    const techButton = screen.getByText('tech').closest('button');
    expect(techButton).toHaveClass('variant-default');

    rerender(<NicheSelector selectedNiche="fitness" onSelect={mockOnSelect} />);
    const fitnessButton = screen.getByText('fitness').closest('button');
    expect(fitnessButton).toHaveClass('variant-default');
  });
});
```

---

## ✅ WORKFLOW PRO IMPLEMENTACI

### Krok 1: Příprava
```bash
# 1. Checkout latest main
git checkout main
git pull user_github main

# 2. Vytvoř feature branch
git checkout -b feat/pitch-scripts-income-niche
```

### Krok 2: Feature 1 — AI Pitch Scripts
```bash
# 1. Backend
# - Přidej DB schema v drizzle/schema.ts
# - Spusť: pnpm drizzle-kit generate
# - Aplikuj migraci v Manus UI
# - Přidej helpers v server/db.ts
# - Přidej tRPC proceduru v server/routers.ts
# - Napište testy: server/routers/convert.generatePitchScript.test.ts
# - Spusť: pnpm test

# 2. Frontend
# - Vytvoř komponentu: client/src/components/PitchScriptGenerator.tsx
# - Integruj do Convert modulu: client/src/pages/Convert.tsx
# - Napište testy: client/src/components/PitchScriptGenerator.test.ts
# - Spusť: pnpm test

# 3. Commit
git add -A
git commit -m "feat: Add AI-powered Pitch Scripts with LLM integration

- Implement tRPC procedure for walk-in and video demo scripts
- Add pitch_scripts DB table with Drizzle ORM
- Create PitchScriptGenerator React component
- Add 5+ Vitest tests for backend and frontend
- Integrate into Convert module with tab navigation"
```

### Krok 3: Feature 2 — Income Growth Visualization
```bash
# 1. Frontend
# - Vytvoř constants: client/src/constants/milestones.ts
# - Vytvoř komponentu: client/src/components/MilestoneTrack.tsx
# - Integruj do IncomeCalculator: client/src/components/IncomeCalculator.tsx
# - Napište testy: client/src/components/MilestoneTrack.test.ts
# - Spusť: pnpm test

# 2. Commit
git add -A
git commit -m "feat: Add Income Growth Visualization with milestone tracking

- Implement MilestoneTrack component with progress bar
- Add 5 income milestones (0-100k Kč/měsíc) with motivational text
- Integrate into Income Calculator
- Add 6+ Vitest tests for visualization"
```

### Krok 4: Feature 3 — Niche-specific AI Prompts
```bash
# 1. Backend
# - Vytvoř constants: server/constants/niches.ts
# - Přidej tRPC proceduru: server/routers.ts (attract router)
# - Napište testy: server/routers/attract.generateLeadsWithNichContext.test.ts
# - Spusť: pnpm test

# 2. Frontend
# - Vytvoř komponentu: client/src/components/NicheSelector.tsx
# - Vytvoř komponentu: client/src/components/NicheContextPreview.tsx
# - Integruj do Attract: client/src/pages/Attract.tsx
# - Napište testy: client/src/components/NicheSelector.test.ts
# - Spusť: pnpm test

# 3. Commit
git add -A
git commit -m "feat: Add Niche-specific AI Prompts for lead generation

- Implement niche context mapping (tech, real-estate, fitness, etc.)
- Add generateLeadsWithNichContext tRPC procedure
- Create NicheSelector and NicheContextPreview components
- Integrate into Attract module
- Add 7+ Vitest tests"
```

### Krok 5: Finalizace
```bash
# 1. Spusť všechny testy
pnpm test

# 2. Zkontroluj TypeScript
pnpm tsc --noEmit

# 3. Commit all changes
git add -A
git commit -m "chore: All 3 HIGH priority features implemented and tested"

# 4. Push na GitHub
git push user_github feat/pitch-scripts-income-niche

# 5. Vytvoř Pull Request (volitelně)
# - Jdi na GitHub
# - Vytvoř PR z feat/pitch-scripts-income-niche do main
# - Merge PR

# 6. Merge do main
git checkout main
git pull user_github main
git merge feat/pitch-scripts-income-niche
git push user_github main

# 7. Vytvoř checkpoint v Manus UI
# - Jdi do Management UI → Dashboard
# - Klikni "Create Checkpoint"
# - Popis: "Implement 3 HIGH priority features: Pitch Scripts, Income Visualization, Niche Prompts"
```

---

## 📊 TESTING CHECKLIST

Pro každou feature:

- [ ] Backend tRPC procedura implementována
- [ ] DB schema vytvořeno a migrováno
- [ ] LLM prompt otestován
- [ ] Frontend komponenta vytvořena
- [ ] Vitest testy napsány (min. 5 per feature)
- [ ] `pnpm test` — všechny testy projdou
- [ ] `pnpm tsc --noEmit` — bez TypeScript chyb
- [ ] Tailwind styling aplikováno
- [ ] Integrováno do existujícího workflow
- [ ] Commitnuto na GitHub
- [ ] Checkpoint vytvořen v Manus UI

---

## 🔗 UŽITEČNÉ LINKY

- **Project:** https://ai-business-automation.manus.space
- **GitHub:** https://github.com/pejtr/ai-business-automation
- **tRPC docs:** https://trpc.io/docs
- **Drizzle ORM:** https://orm.drizzle.team
- **Vitest:** https://vitest.dev
- **Tailwind CSS:** https://tailwindcss.com

---

## 📝 POZNÁMKY

- Všechny UI texty musí být v **češtině**
- Všechny AI prompty musí být v **češtině**
- Používej existující design system (neon glow colors, Tailwind)
- Používej existující komponenty z `client/src/components/ui/`
- Neměň existující kód, jen přidávej nové features
- Piš čistý, čitelný kód s komentáři
- Vždy napište testy!

---

**Poslední update:** 2026-06-12
**Status:** Ready for Claude Code Implementation
**Autor:** System Architect

---

## 🎯 SHRNUTÍ

Máte 3 HIGH priority features k implementaci:

1. **AI-powered Pitch Scripts** — tRPC LLM integration pro personalizované skriptu
2. **Income Growth Visualization** — Progress bar s 5 milníky
3. **Niche-specific AI Prompts** — Context-aware lead generation

Každá feature zahrnuje:
- ✅ Backend (tRPC + DB)
- ✅ Frontend (React komponenty)
- ✅ Vitest testy
- ✅ UI mockupy a layouts
- ✅ Implementační workflow
- ✅ Checklist

**Vše je připraveno pro Claude Code. Stačí kopírovat a implementovat!**
