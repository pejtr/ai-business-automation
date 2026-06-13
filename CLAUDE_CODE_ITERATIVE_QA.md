# 🔄 Claude Code — Iterative AI QA for Pitch Script Generation

**Inspirace:** Video "Drop Shipping AI Apps" — Koncept iterativní AI QA (AI si opravuje vlastní práci)

---

## 📌 ÚKOL

Implementujte **Iterative AI QA** do Feature 1 (AI-powered Pitch Scripts), aby AI automaticky:
1. Vygeneroval pitch script
2. Zkontroloval si vlastní práci
3. Identifikoval chyby a nedostatky
4. Opravil skript
5. Opakoval, dokud není skript perfektní

---

## 🎯 KONCEPT

### Bez Iterative QA (Aktuální):
```
Lead Data → LLM → Script ✅ (Done)
                    ↓
                  Output
```

### S Iterative QA (Nový):
```
Lead Data → LLM (v1) → Script v1
                        ↓
                    QA Check
                        ↓
                    Errors found?
                        ↓ YES
                    LLM (v2) → Script v2
                        ↓
                    QA Check
                        ↓
                    Errors found?
                        ↓ NO
                    ✅ Final Script
```

---

## 🔧 IMPLEMENTACE

### Backend (server/routers.ts)

#### Step 1: QA Prompt Template
```typescript
// Prompt pro AI QA check
const QA_PROMPT_TEMPLATE = `Jsi expert QA tester pro sales pitch skripty.

Zkontroluj následující pitch script a identifikuj VŠECHNY problémy:

SCRIPT:
"""
{{script}}
"""

LEAD INFO:
- Jméno: {{leadName}}
- Firma: {{leadCompany}}
- Odvětví: {{leadIndustry}}

SCRIPT TYPE: {{scriptType}}

KRITÉRIA PRO KONTROLU:
1. Délka: {{scriptType === 'walk-in' ? '3-5 vět' : '5-10 vět'}}
2. Tón: {{scriptType === 'walk-in' ? 'přátelský, přímý' : 'profesionální, zaměřený na benefits'}}
3. Personalizace: Je skript personalizovaný na {{leadCompany}}?
4. Relevance: Obsahuje specifické pain points pro {{leadIndustry}}?
5. Gramatika: Je skript bez chyb?
6. Naturalness: Zní skript přirozeně (ne jako robot)?
7. Call-to-action: Je jasný další krok?

ODPOVĚĎ VRAŤ V TOMTO FORMÁTU (JSON):
{
  "isOk": boolean,
  "score": number (0-100),
  "issues": [
    {
      "type": "length" | "tone" | "personalization" | "relevance" | "grammar" | "naturalness" | "cta",
      "severity": "critical" | "warning" | "info",
      "message": "Popis problému",
      "suggestion": "Jak to opravit"
    }
  ],
  "overallFeedback": "Obecné zhodnocení"
}

Vrať POUZE JSON, bez dalšího textu.`;

// Prompt pro AI opravu
const FIX_PROMPT_TEMPLATE = `Jsi expert na sales pitch skripty.

Máš následující skript s problémy:

SCRIPT:
"""
{{script}}
"""

PROBLÉMY K OPRAVĚ:
{{issues}}

LEAD INFO:
- Jméno: {{leadName}}
- Firma: {{leadCompany}}
- Odvětví: {{leadIndustry}}

SCRIPT TYPE: {{scriptType}}

Oprav skript tak, aby:
1. Vyřešil všechny identifikované problémy
2. Zůstal {{scriptType === 'walk-in' ? '3-5 vět' : '5-10 vět'}}
3. Byl personalizovaný na {{leadCompany}}
4. Obsahoval specifické pain points pro {{leadIndustry}}
5. Zněl přirozeně a přátelsky
6. Měl jasný call-to-action

Vrať POUZE opravený skript, bez dalšího textu.`;
```

#### Step 2: Iterative QA Procedure
```typescript
// server/routers.ts - convert router

generatePitchScriptWithQA: protectedProcedure
  .input(z.object({
    leadId: z.string(),
    leadName: z.string(),
    leadCompany: z.string(),
    leadIndustry: z.string(),
    leadRecentNews: z.string().optional(),
    scriptType: z.enum(['walk-in', 'video-demo']),
    maxIterations: z.number().default(3), // Max 3 iterace
    qualityThreshold: z.number().default(85), // Min 85% quality
  }))
  .mutation(async ({ input, ctx }) => {
    let currentScript = '';
    let qaHistory: any[] = [];
    let iteration = 0;
    let finalQAScore = 0;

    // Iterativní loop
    while (iteration < input.maxIterations) {
      iteration++;

      // Step 1: Generuj script (první iterace) nebo oprav (další iterace)
      if (iteration === 1) {
        // Generuj nový script
        currentScript = await generateInitialScript(input);
      } else {
        // Oprav script na základě QA feedback
        const lastQA = qaHistory[qaHistory.length - 1];
        currentScript = await fixScript(input, currentScript, lastQA.issues);
      }

      // Step 2: Spusť QA check
      const qaResult = await runQACheck(input, currentScript);
      qaHistory.push({
        iteration,
        script: currentScript,
        qaResult,
      });

      finalQAScore = qaResult.score;

      // Step 3: Rozhodnutí
      if (qaResult.isOk && qaResult.score >= input.qualityThreshold) {
        // ✅ Script je dobrý, skončit
        break;
      } else if (iteration >= input.maxIterations) {
        // ⚠️ Dosáhli jsme max iterací, vrátit nejlepší verzi
        console.log(`Max iterations (${input.maxIterations}) reached. Using best version.`);
        break;
      }
      // Jinak pokračovat na další iteraci
    }

    // Ulož do DB
    const result = await savePitchScript({
      leadId: input.leadId,
      scriptType: input.scriptType,
      walkInScript: input.scriptType === 'walk-in' ? currentScript : undefined,
      videoDemoScript: input.scriptType === 'video-demo' ? currentScript : undefined,
      tokensUsed: 0, // TODO: Track token usage
    });

    return {
      scriptId: result[0].id,
      leadId: input.leadId,
      scriptType: input.scriptType,
      content: currentScript,
      qualityScore: finalQAScore,
      iterations: iteration,
      qaHistory, // Debug info
      generatedAt: new Date(),
    };
  }),
```

#### Step 3: Helper Functions
```typescript
// server/db.ts

/**
 * Generuj iniciální pitch script
 */
async function generateInitialScript(input: {
  leadName: string;
  leadCompany: string;
  leadIndustry: string;
  leadRecentNews?: string;
  scriptType: 'walk-in' | 'video-demo';
}): Promise<string> {
  const scriptTypeText = input.scriptType === 'walk-in'
    ? 'Walk-in skript: 3-5 vět, přátelský tón, přímý kontakt'
    : 'Video demo skript: 5-10 vět, profesionální, zaměř se na benefits';

  const prompt = `Jsi expert na sales outreach. Vygeneruj personalizovaný ${input.scriptType} skript.

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

  const response = await invokeLLM({
    messages: [
      { role: 'system', content: 'Jsi expert na sales outreach.' },
      { role: 'user', content: prompt },
    ],
  });

  return response.choices[0].message.content;
}

/**
 * Spusť QA check na scriptu
 */
async function runQACheck(
  input: {
    leadName: string;
    leadCompany: string;
    leadIndustry: string;
    scriptType: 'walk-in' | 'video-demo';
  },
  script: string
): Promise<{
  isOk: boolean;
  score: number;
  issues: any[];
  overallFeedback: string;
}> {
  const qaPrompt = QA_PROMPT_TEMPLATE
    .replace('{{script}}', script)
    .replace('{{leadName}}', input.leadName)
    .replace('{{leadCompany}}', input.leadCompany)
    .replace('{{leadIndustry}}', input.leadIndustry)
    .replace(/{{scriptType}}/g, input.scriptType);

  const response = await invokeLLM({
    messages: [
      { role: 'system', content: 'Jsi expert QA tester. Vrací pouze JSON.' },
      { role: 'user', content: qaPrompt },
    ],
  });

  const qaResult = JSON.parse(response.choices[0].message.content);
  return qaResult;
}

/**
 * Oprav script na základě QA feedback
 */
async function fixScript(
  input: {
    leadName: string;
    leadCompany: string;
    leadIndustry: string;
    scriptType: 'walk-in' | 'video-demo';
  },
  script: string,
  issues: any[]
): Promise<string> {
  const issuesText = issues
    .map(i => `- [${i.severity}] ${i.type}: ${i.message}\n  Suggestion: ${i.suggestion}`)
    .join('\n');

  const fixPrompt = FIX_PROMPT_TEMPLATE
    .replace('{{script}}', script)
    .replace('{{issues}}', issuesText)
    .replace('{{leadName}}', input.leadName)
    .replace('{{leadCompany}}', input.leadCompany)
    .replace('{{leadIndustry}}', input.leadIndustry)
    .replace(/{{scriptType}}/g, input.scriptType);

  const response = await invokeLLM({
    messages: [
      { role: 'system', content: 'Jsi expert na sales pitch skripty. Vrací pouze skript.' },
      { role: 'user', content: fixPrompt },
    ],
  });

  return response.choices[0].message.content;
}
```

#### Step 4: Vitest Tests
```typescript
// server/routers/convert.generatePitchScriptWithQA.test.ts

describe('convert.generatePitchScriptWithQA', () => {
  const caller = appRouter.createCaller({ user: { id: 'test-user' } });

  it('should generate script and pass QA on first try', async () => {
    const result = await caller.convert.generatePitchScriptWithQA({
      leadId: 'lead-qa-1',
      leadName: 'John Doe',
      leadCompany: 'TechCorp',
      leadIndustry: 'tech',
      scriptType: 'walk-in',
    });

    expect(result.qualityScore).toBeGreaterThanOrEqual(85);
    expect(result.iterations).toBeLessThanOrEqual(3);
  });

  it('should iterate and improve script if QA fails', async () => {
    const result = await caller.convert.generatePitchScriptWithQA({
      leadId: 'lead-qa-2',
      leadName: 'Jane Smith',
      leadCompany: 'StartupXYZ',
      leadIndustry: 'tech',
      scriptType: 'video-demo',
      maxIterations: 3,
      qualityThreshold: 85,
    });

    // Ověř, že QA history má více iterací
    expect(result.qaHistory.length).toBeGreaterThan(0);
    expect(result.qaHistory[result.qaHistory.length - 1].qaResult.score).toBeGreaterThanOrEqual(85);
  });

  it('should track quality score improvement', async () => {
    const result = await caller.convert.generatePitchScriptWithQA({
      leadId: 'lead-qa-3',
      leadName: 'Bob Johnson',
      leadCompany: 'FitnessGym',
      leadIndustry: 'fitness',
      scriptType: 'walk-in',
    });

    // Ověř, že skóre se zlepšilo
    if (result.qaHistory.length > 1) {
      const firstScore = result.qaHistory[0].qaResult.score;
      const lastScore = result.qaHistory[result.qaHistory.length - 1].qaResult.score;
      expect(lastScore).toBeGreaterThanOrEqual(firstScore);
    }
  });

  it('should respect max iterations limit', async () => {
    const result = await caller.convert.generatePitchScriptWithQA({
      leadId: 'lead-qa-4',
      leadName: 'Test User',
      leadCompany: 'Test Corp',
      leadIndustry: 'tech',
      scriptType: 'walk-in',
      maxIterations: 2,
    });

    expect(result.iterations).toBeLessThanOrEqual(2);
  });

  it('should identify and fix common issues', async () => {
    const result = await caller.convert.generatePitchScriptWithQA({
      leadId: 'lead-qa-5',
      leadName: 'Issue Test',
      leadCompany: 'Test Company',
      leadIndustry: 'real-estate',
      scriptType: 'walk-in',
    });

    // Ověř, že finální skript obsahuje personalizaci
    expect(result.content).toContain('Test Company') || expect(result.content).toContain('real-estate');
  });

  it('should handle max iterations gracefully', async () => {
    const result = await caller.convert.generatePitchScriptWithQA({
      leadId: 'lead-qa-6',
      leadName: 'Max Iter Test',
      leadCompany: 'Max Corp',
      leadIndustry: 'tech',
      scriptType: 'video-demo',
      maxIterations: 1, // Jen 1 iterace
    });

    expect(result.iterations).toBe(1);
    expect(result.content.length).toBeGreaterThan(0);
  });
});
```

---

### Frontend (React)

#### Step 1: Enhanced PitchScriptGenerator Component
```typescript
// client/src/components/PitchScriptGeneratorWithQA.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Copy, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface PitchScriptGeneratorWithQAProps {
  leadId: string;
  leadName: string;
  leadCompany: string;
  leadIndustry: string;
  leadRecentNews?: string;
}

export function PitchScriptGeneratorWithQA({
  leadId,
  leadName,
  leadCompany,
  leadIndustry,
  leadRecentNews,
}: PitchScriptGeneratorWithQAProps) {
  const [copied, setCopied] = useState<'walk-in' | 'video-demo' | null>(null);
  const [showQAHistory, setShowQAHistory] = useState(false);

  const generateMutation = trpc.convert.generatePitchScriptWithQA.useMutation();

  const handleGenerateScript = async (scriptType: 'walk-in' | 'video-demo') => {
    await generateMutation.mutateAsync({
      leadId,
      leadName,
      leadCompany,
      leadIndustry,
      leadRecentNews,
      scriptType,
      maxIterations: 3,
      qualityThreshold: 85,
    });
  };

  const handleCopy = (text: string, type: 'walk-in' | 'video-demo') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const result = generateMutation.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pitch Scripts (s Iterative QA)</h3>
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

      {/* Loading State */}
      {generateMutation.isPending && (
        <Card className="p-4 bg-cyan-500/5 border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
            <span className="text-sm text-cyan-400">Generuji a optimalizuji skript...</span>
          </div>
        </Card>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Quality Score */}
          <Card className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-semibold">Kvalita: {Math.round(result.qualityScore)}%</span>
              </div>
              <span className="text-sm text-gray-400">
                {result.iterations} {result.iterations === 1 ? 'iterace' : 'iterací'}
              </span>
            </div>
          </Card>

          {/* Final Script */}
          <Card className="p-4 border-cyan-500/20 bg-cyan-500/5">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-cyan-400">
                {result.content.length > 100 ? 'Video Demo Skript' : 'Walk-in Skript'}
              </h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(result.content, 'walk-in')}
              >
                {copied === 'walk-in' ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">
              {result.content}
            </p>
          </Card>

          {/* QA History Toggle */}
          <Button
            onClick={() => setShowQAHistory(!showQAHistory)}
            variant="outline"
            size="sm"
          >
            {showQAHistory ? 'Skrýt' : 'Zobrazit'} QA Historii ({result.qaHistory.length})
          </Button>

          {/* QA History */}
          {showQAHistory && (
            <div className="space-y-3">
              {result.qaHistory.map((entry, idx) => (
                <Card key={idx} className="p-3 bg-gray-900/50 border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Iterace {entry.iteration}</span>
                    <span className="text-xs text-gray-400">
                      Skóre: {entry.qaResult.score}%
                    </span>
                  </div>

                  {entry.qaResult.issues.length > 0 && (
                    <div className="space-y-1">
                      {entry.qaResult.issues.map((issue, issueIdx) => (
                        <div key={issueIdx} className="text-xs text-gray-400">
                          <span className="text-yellow-400">[{issue.severity}]</span> {issue.message}
                        </div>
                      ))}
                    </div>
                  )}

                  {entry.qaResult.issues.length === 0 && (
                    <div className="text-xs text-green-400">✓ Bez problémů</div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

#### Step 2: Integration into Convert Module
```typescript
// client/src/pages/Convert.tsx

import { PitchScriptGeneratorWithQA } from '@/components/PitchScriptGeneratorWithQA';

// V komponentě Convert, přidej nový tab:
<Tabs defaultValue="email">
  <TabsList>
    <TabsTrigger value="email">Email Template</TabsTrigger>
    <TabsTrigger value="pitch-scripts">Pitch Scripts (QA)</TabsTrigger>
    <TabsTrigger value="tracking">Tracking</TabsTrigger>
  </TabsList>

  <TabsContent value="pitch-scripts">
    {selectedLead && (
      <PitchScriptGeneratorWithQA
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

#### Step 3: Frontend Tests
```typescript
// client/src/components/PitchScriptGeneratorWithQA.test.ts

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PitchScriptGeneratorWithQA } from './PitchScriptGeneratorWithQA';

describe('PitchScriptGeneratorWithQA', () => {
  it('should display quality score after generation', async () => {
    render(
      <PitchScriptGeneratorWithQA
        leadId="test-123"
        leadName="John Doe"
        leadCompany="TechCorp"
        leadIndustry="tech"
      />
    );

    const generateButton = screen.getByText('Generovat Walk-in Skript');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Kvalita:/)).toBeInTheDocument();
    });
  });

  it('should display iteration count', async () => {
    render(
      <PitchScriptGeneratorWithQA
        leadId="test-456"
        leadName="Jane Smith"
        leadCompany="StartupXYZ"
        leadIndustry="tech"
      />
    );

    const generateButton = screen.getByText('Generovat Video Demo Skript');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/iterace/)).toBeInTheDocument();
    });
  });

  it('should toggle QA history visibility', async () => {
    render(
      <PitchScriptGeneratorWithQA
        leadId="test-789"
        leadName="Bob Johnson"
        leadCompany="FitnessGym"
        leadIndustry="fitness"
      />
    );

    // Generuj script
    fireEvent.click(screen.getByText('Generovat Walk-in Skript'));

    await waitFor(() => {
      const historyButton = screen.getByText(/Zobrazit QA Historii/);
      fireEvent.click(historyButton);
      expect(screen.getByText(/Iterace 1/)).toBeInTheDocument();
    });
  });

  it('should copy script to clipboard', async () => {
    render(
      <PitchScriptGeneratorWithQA
        leadId="test-copy"
        leadName="Copy Test"
        leadCompany="Copy Corp"
        leadIndustry="tech"
      />
    );

    fireEvent.click(screen.getByText('Generovat Walk-in Skript'));

    await waitFor(() => {
      const copyButton = screen.getByRole('button', { name: /copy/i });
      fireEvent.click(copyButton);
      expect(screen.getByText(/Check/)).toBeInTheDocument();
    });
  });
});
```

---

## 🔄 WORKFLOW PRO IMPLEMENTACI

### Krok 1: Backend
```bash
# 1. Přidej helper functions v server/db.ts
# - generateInitialScript()
# - runQACheck()
# - fixScript()

# 2. Přidej novou tRPC proceduru v server/routers.ts
# - generatePitchScriptWithQA

# 3. Napište testy
# - server/routers/convert.generatePitchScriptWithQA.test.ts

# 4. Spusť testy
pnpm test
```

### Krok 2: Frontend
```bash
# 1. Vytvoř novou komponentu
# - client/src/components/PitchScriptGeneratorWithQA.tsx

# 2. Integruj do Convert modulu
# - client/src/pages/Convert.tsx

# 3. Napište testy
# - client/src/components/PitchScriptGeneratorWithQA.test.ts

# 4. Spusť testy
pnpm test
```

### Krok 3: Commit
```bash
git add -A
git commit -m "feat: Add Iterative AI QA to Pitch Script Generation

- Implement AI self-checking and fixing mechanism
- Add QA check prompt with 7 quality criteria
- Add iterative improvement loop (max 3 iterations)
- Add quality score tracking (0-100%)
- Add QA history visualization in frontend
- Add 6+ Vitest tests for QA logic
- Inspired by 'Drop Shipping AI Apps' video concept"
```

---

## 📊 QUALITY CRITERIA

AI QA kontroluje:

1. **Délka** — Správný počet vět
2. **Tón** — Přátelský (walk-in) vs profesionální (video-demo)
3. **Personalizace** — Obsahuje jméno firmy a specifika
4. **Relevance** — Zaměřeno na pain points daného odvětví
5. **Gramatika** — Bez chyb
6. **Naturalness** — Zní přirozeně, ne jako robot
7. **Call-to-action** — Jasný další krok

---

## 🎯 EXPECTED RESULTS

### Bez QA:
- Script v1 → Output (70% kvalita)

### S Iterative QA:
- Script v1 (70%) → QA Check → Issues found
- Script v2 (82%) → QA Check → Issues found
- Script v3 (91%) → QA Check → ✅ OK
- Output (91% kvalita)

---

## 💡 INSPIRACE Z VIDEÍ

**Video 1 (Drop Shipping AI Apps):**
- Koncept: "Polish Prompts" — AI si opravuje vlastní práci
- Aplikace: Iterativní QA loop

**Video 2 (AI Meta Ads):**
- Koncept: A/B testing — Více verzí, vybrat nejlepší
- Aplikace: Tracking quality score across iterations

---

## 📝 POZNÁMKY

- Max 3 iterace (aby se nezvýšily náklady na LLM)
- Quality threshold: 85% (tunable)
- QA history pro debugging a transparency
- Token usage tracking (pro cost analysis)
- Všechny texty v ČEŠTINĚ

---

## ✅ CHECKLIST

- [ ] Backend helper functions implementovány
- [ ] tRPC procedura generatePitchScriptWithQA vytvořena
- [ ] QA prompts správně nastaveny
- [ ] Iterativní loop funguje
- [ ] Backend testy napsány (6+)
- [ ] Frontend komponenta vytvořena
- [ ] QA history visualization funguje
- [ ] Frontend testy napsány (4+)
- [ ] Integrováno do Convert modulu
- [ ] TypeScript bez chyb
- [ ] Commitnuto na GitHub

---

**Poslední update:** 2026-06-13  
**Status:** Ready for Implementation  
**Inspirace:** Video "Drop Shipping AI Apps" + Video "AI Meta Ads"
