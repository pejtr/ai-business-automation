# Claude Code — 3 HIGH Priority Features

Tento dokument obsahuje podrobné zadání pro implementaci 3 nových HIGH priority features do Agency AI platformy.

---

## 📋 Kontext

**Projekt:** AI Business Automation Platform (Agency AI)
**Stack:** React 19 + Express 4 + tRPC 11 + MySQL + Drizzle ORM
**URL:** https://ai-business-automation.manus.space
**GitHub:** https://github.com/pejtr/ai-business-automation

**Aktuální stav:**
- ✅ 5-kroký framework (Attract, Convert, Deliver, Automate, Human)
- ✅ Email tracking (open/click s pixel a redirect)
- ✅ Income Calculator (interaktivní widget)
- ✅ Aria AI asistentka (chat widget s onboarding)
- ✅ Neon glow design + česká lokalizace
- ✅ 14-slide prezentace

**Workflow:**
1. Backend: Implementuj tRPC proceduru + DB query helper
2. Frontend: Implementuj UI komponentu
3. Testing: Napište Vitest testy
4. Push: Commitni na GitHub
5. Checkpoint: Vytvoř checkpoint v Manus UI

---

## 🎯 Feature 1: AI-powered Pitch Scripts

### Cíl
Nahradit lokální placeholder texty skutečně personalizovanými skriptem generovanými přes LLM na základě lead dat a odvětví.

### Detaily

#### Backend (tRPC)
**Nová procedura:** `convert.generatePitchScript`

```typescript
// Input
{
  leadId: string;           // ID leadu z attract modulu
  leadName: string;         // Jméno kontaktu
  leadCompany: string;      // Název firmy
  leadIndustry: string;     // Odvětví (tech, real-estate, fitness, atd.)
  leadRecentNews?: string;  // Volitelně: poslední zprávy o firmě
  scriptType: 'walk-in' | 'video-demo'; // Typ skriptu
}

// Output
{
  scriptId: string;
  leadId: string;
  scriptType: string;
  walkInScript?: string;    // 3-5 vět pro walk-in
  videoDemoScript?: string; // 5-10 vět pro video demo
  generatedAt: Date;
  tokens_used: number;
}
```

**LLM Prompt Template:**
```
Jsi expert na sales outreach. Vygeneruj personalizovaný {{scriptType}} skript pro lead.

Lead info:
- Jméno: {{leadName}}
- Firma: {{leadCompany}}
- Odvětví: {{leadIndustry}}
- Poslední zprávy: {{leadRecentNews}}

Požadavky:
- {{scriptType === 'walk-in' ? 'Walk-in skript: 3-5 vět, přátelský tón, přímý kontakt' : 'Video demo skript: 5-10 vět, profesionální, zaměř se na benefits'}}
- Personalizuj na konkrétní firmu a odvětví
- Zahrň specifické pain points pro {{leadIndustry}}
- Česky

Vygeneruj pouze skript, bez dalšího textu.
```

**DB Schema (Drizzle):**
```typescript
export const pitchScripts = sqliteTable('pitch_scripts', {
  id: text('id').primaryKey(),
  leadId: text('lead_id').notNull().references(() => leads.id),
  scriptType: text('script_type').notNull(), // 'walk-in' | 'video-demo'
  walkInScript: text('walk_in_script'),
  videoDemoScript: text('video_demo_script'),
  generatedAt: integer('generated_at', { mode: 'timestamp' }).notNull(),
  tokensUsed: integer('tokens_used'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});
```

**DB Helper (server/db.ts):**
```typescript
export async function savePitchScript(data: {
  leadId: string;
  scriptType: string;
  walkInScript?: string;
  videoDemoScript?: string;
  tokensUsed: number;
}) {
  return db.insert(pitchScripts).values({
    id: generateId(),
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
    orderBy: desc(pitchScripts.generatedAt),
  });
}
```

**Vitest Test:**
```typescript
// server/routers/convert.generatePitchScript.test.ts
describe('convert.generatePitchScript', () => {
  it('should generate walk-in script with LLM', async () => {
    // Test LLM call
  });
  
  it('should generate video demo script', async () => {
    // Test LLM call
  });
  
  it('should save script to database', async () => {
    // Test DB save
  });
  
  it('should personalize based on industry', async () => {
    // Test industry-specific content
  });
});
```

#### Frontend (React)
**Nová komponenta:** `client/src/components/PitchScriptGenerator.tsx`

**Funkce:**
- Vstup: Lead data (jméno, firma, odvětví)
- Tlačítko: "Generovat walk-in skript" + "Generovat video demo skript"
- Loading state: Spinner během generování
- Výstup: Zobrazení vygenerovaného skriptu
- Akce: Kopírovat do schránky, uložit, sdílet

**UI Layout:**
```
┌─────────────────────────────────────────┐
│ Pitch Scripts                           │
├─────────────────────────────────────────┤
│ Lead: John Doe @ TechCorp (Tech)       │
├─────────────────────────────────────────┤
│ [Generate Walk-in] [Generate Video]    │
├─────────────────────────────────────────┤
│ Walk-in Script:                         │
│ "Ahoj Johne, viděl jsem, že TechCorp  │
│  se zaměřuje na AI. Máme řešení..."    │
│ [Copy] [Save] [Share]                  │
├─────────────────────────────────────────┤
│ Video Demo Script:                      │
│ "Dobrý den, jsem [Your Name]..."       │
│ [Copy] [Save] [Share]                  │
└─────────────────────────────────────────┘
```

**Integrace do Convert modulu:**
- Přidat tab "Pitch Scripts" vedle "Email Template" a "Tracking"
- Zobrazit generované skripty pro vybraný lead
- Umožnit regeneraci s jiným kontextem

---

## 📊 Feature 2: Income Growth Visualization

### Cíl
Rozšířit Income Calculator o vizuální progress bar a milestone tracking ukazující cestu od 0 do 100k Kč/měsíc s motivačními texty.

### Detaily

#### Milestones
```typescript
const INCOME_MILESTONES = [
  { target: 0, label: 'Start', emoji: '🚀', motivation: 'Začínáme!' },
  { target: 10000, label: '10k Kč/měsíc', emoji: '📈', motivation: 'První milestone! Skvělý start.' },
  { target: 25000, label: '25k Kč/měsíc', emoji: '⭐', motivation: 'Už jste na čtvrtině cesty!' },
  { target: 50000, label: '50k Kč/měsíc', emoji: '💪', motivation: 'Polovina! Pokračujte v tom dobrém.' },
  { target: 100000, label: '100k Kč/měsíc', emoji: '🏆', motivation: 'Dosáhli jste cíle! Gratulujeme!' },
];
```

#### Frontend (React)
**Rozšíření:** `client/src/components/IncomeCalculator.tsx`

**Nové prvky:**
1. **Progress bar** — Vizuální indikátor pozice mezi 0 a 100k
2. **Milestone track** — Zobrazení všech milníků s ikonami
3. **Current position** — Zvýraznění aktuálního milníku
4. **Motivation text** — Dynamický text pro aktuální milestone

**UI Layout:**
```
┌─────────────────────────────────────────────────┐
│ Income Growth Visualization                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  🚀        📈        ⭐        💪        🏆    │
│  0k        10k       25k       50k       100k   │
│  |---------|---------|---------|---------|     │
│            ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                 │
│  Aktuální: 25,500 Kč/měsíc                    │
│  Milestone: ⭐ 25k Kč/měsíc                    │
│  "Už jste na čtvrtině cesty!"                  │
│                                                 │
│  Zbývá: 74,500 Kč do 100k                     │
│  Pokrok: 25.5%                                │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Komponenta struktura:**
```typescript
interface MilestoneTrackProps {
  currentIncome: number;
  maxIncome: number;
}

export function MilestoneTrack({ currentIncome, maxIncome }: MilestoneTrackProps) {
  const progress = (currentIncome / maxIncome) * 100;
  const currentMilestone = INCOME_MILESTONES.find(
    m => currentIncome >= m.target && 
         currentIncome < (INCOME_MILESTONES[INCOME_MILESTONES.indexOf(m) + 1]?.target || Infinity)
  );
  
  return (
    <div className="milestone-track">
      {/* Progress bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      
      {/* Milestone icons */}
      <div className="milestone-icons">
        {INCOME_MILESTONES.map(m => (
          <div 
            key={m.target} 
            className={`milestone ${currentMilestone?.target === m.target ? 'active' : ''}`}
          >
            {m.emoji}
          </div>
        ))}
      </div>
      
      {/* Motivation text */}
      <div className="motivation">
        <p>{currentMilestone?.motivation}</p>
        <p>Zbývá: {formatCurrency(maxIncome - currentIncome)}</p>
      </div>
    </div>
  );
}
```

**CSS (Tailwind):**
```css
.milestone-track {
  @apply space-y-4 p-6 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 rounded-lg border border-cyan-500/20;
}

.progress-bar {
  @apply h-2 bg-gray-800 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-500;
}

.milestone-icons {
  @apply flex justify-between text-2xl;
}

.milestone {
  @apply opacity-50 transition-opacity;
}

.milestone.active {
  @apply opacity-100 scale-110;
}

.motivation {
  @apply text-center text-sm text-gray-300;
}
```

#### DB Schema (volitelně — pro tracking)
```typescript
export const incomeProgress = sqliteTable('income_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  monthlyIncome: integer('monthly_income').notNull(),
  achievedMilestones: text('achieved_milestones').notNull(), // JSON array
  recordedAt: integer('recorded_at', { mode: 'timestamp' }).notNull(),
});
```

#### Vitest Test:
```typescript
// client/src/components/MilestoneTrack.test.ts
describe('MilestoneTrack', () => {
  it('should display correct progress percentage', () => {
    // Test progress calculation
  });
  
  it('should highlight current milestone', () => {
    // Test milestone highlighting
  });
  
  it('should show correct motivation text', () => {
    // Test motivation text for each milestone
  });
});
```

---

## 🎯 Feature 3: Niche-specific AI Prompts

### Cíl
Rozšířit Attract generátor tak, aby při výběru niche šablony automaticky přizpůsobil AI prompt kontextem daného odvětví pro relevantnější leady.

### Detaily

#### Niche Context Mapping
```typescript
const NICHE_CONTEXTS = {
  tech: {
    keywords: ['AI', 'cloud', 'automation', 'SaaS', 'DevOps', 'API'],
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
  // ... dalších 7 niche
};
```

#### Backend (tRPC)
**Nová procedura:** `attract.generateLeadsWithNichContext`

```typescript
// Input
{
  niche: string;              // 'tech' | 'real-estate' | 'fitness' | ...
  targetRole?: string;        // 'CEO', 'Marketing Manager', atd.
  targetCompanySize?: string; // 'startup' | 'SME' | 'enterprise'
  targetLocation?: string;    // Volitelně: město, region
  customKeywords?: string[];  // Volitelně: vlastní keywords
}

// Output
{
  leadIds: string[];
  niche: string;
  promptUsed: string;
  generatedAt: Date;
  relevanceScore: number; // 0-100
}
```

**LLM Prompt Template s Niche Context:**
```
Jsi expert na lead generation pro {{niche}} industrii.

Niche Context:
- Klíčová slova: {{keywords}}
- Tón: {{tone}}
- Pain points: {{painPoints}}
- Guidance: {{toneGuidance}}

Vygeneruj seznam 50 potenciálních leadů pro {{niche}} s těmito kritérii:
- Cílová role: {{targetRole}}
- Velikost firmy: {{targetCompanySize}}
- Lokace: {{targetLocation}}
{{customKeywords ? `- Vlastní keywords: ${customKeywords.join(', ')}` : ''}}

Pro každý lead vrať:
- Jméno
- Firma
- Email (realistický)
- Pozice
- Relevance score (0-100)

Zaměř se na {{painPoints.join(', ')}} jako primární pain points.
Tón komunikace: {{toneGuidance}}

Vrať JSON array s leads.
```

**DB Helper (server/db.ts):**
```typescript
export async function generateLeadsWithNichContext(data: {
  niche: string;
  targetRole?: string;
  targetCompanySize?: string;
  targetLocation?: string;
  customKeywords?: string[];
}) {
  const nichContext = NICHE_CONTEXTS[data.niche];
  if (!nichContext) throw new Error(`Unknown niche: ${data.niche}`);
  
  const prompt = buildNichPrompt(nichContext, data);
  const response = await invokeLLM({ messages: [{ role: 'user', content: prompt }] });
  
  const leads = JSON.parse(response.choices[0].message.content);
  
  // Uložit leads do DB
  for (const lead of leads) {
    await db.insert(leads).values({
      id: generateId(),
      name: lead.name,
      company: lead.company,
      email: lead.email,
      position: lead.position,
      niche: data.niche,
      relevanceScore: lead.relevanceScore,
      createdAt: new Date(),
    });
  }
  
  return { leadIds: leads.map(l => l.id), niche: data.niche };
}
```

**Vitest Test:**
```typescript
// server/routers/attract.generateLeadsWithNichContext.test.ts
describe('attract.generateLeadsWithNichContext', () => {
  it('should include niche-specific keywords in prompt', async () => {
    // Test prompt contains tech keywords
  });
  
  it('should generate relevant leads for tech niche', async () => {
    // Test tech lead generation
  });
  
  it('should generate relevant leads for real-estate niche', async () => {
    // Test real-estate lead generation
  });
  
  it('should apply custom keywords', async () => {
    // Test custom keyword filtering
  });
  
  it('should save leads with relevance scores', async () => {
    // Test DB save
  });
});
```

#### Frontend (React)
**Rozšíření:** `client/src/pages/Attract.tsx`

**Nové prvky:**
1. **Niche selector** — Dropdown s niche templates
2. **Niche context preview** — Zobrazení keywords, tone, pain points
3. **Custom filters** — Role, company size, location, custom keywords
4. **Generate button** — S niche context
5. **Results** — Leady s relevance score

**UI Layout:**
```
┌─────────────────────────────────────────────────┐
│ Attract Module                                  │
├─────────────────────────────────────────────────┤
│ Niche: [Tech ▼]                                │
│                                                 │
│ Niche Context:                                 │
│ Keywords: AI, cloud, automation, SaaS...      │
│ Tone: Technical, data-driven                  │
│ Pain points: Scaling, technical debt...       │
│                                                 │
│ Filters:                                       │
│ Role: [CEO ▼] | Size: [Startup ▼]            │
│ Location: [Optional] | Custom: [Optional]    │
│                                                 │
│ [Generate Leads with Niche Context]           │
│                                                 │
│ Results:                                       │
│ ┌──────────────────────────────────────┐      │
│ │ John Doe @ TechCorp (CEO)            │      │
│ │ Relevance: ████████░░ 85%            │      │
│ │ Keywords match: AI, automation       │      │
│ └──────────────────────────────────────┘      │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Komponenta:**
```typescript
export function AttractWithNichContext() {
  const [selectedNiche, setSelectedNiche] = useState('tech');
  const [filters, setFilters] = useState({});
  const generateLeads = trpc.attract.generateLeadsWithNichContext.useMutation();
  
  const nichContext = NICHE_CONTEXTS[selectedNiche];
  
  return (
    <div className="space-y-6">
      {/* Niche selector */}
      <Select value={selectedNiche} onValueChange={setSelectedNiche}>
        {Object.keys(NICHE_CONTEXTS).map(niche => (
          <SelectItem key={niche} value={niche}>
            {niche}
          </SelectItem>
        ))}
      </Select>
      
      {/* Niche context preview */}
      <div className="niche-context">
        <h3>Niche Context</h3>
        <p>Keywords: {nichContext.keywords.join(', ')}</p>
        <p>Tone: {nichContext.tone}</p>
        <p>Pain points: {nichContext.painPoints.join(', ')}</p>
      </div>
      
      {/* Filters */}
      <div className="filters">
        {/* Role, Size, Location, Custom Keywords */}
      </div>
      
      {/* Generate button */}
      <Button onClick={() => generateLeads.mutate({ niche: selectedNiche, ...filters })}>
        Generate Leads with Niche Context
      </Button>
      
      {/* Results with relevance scores */}
    </div>
  );
}
```

---

## 🔄 Workflow pro Implementaci

### Krok 1: Backend
1. Přidej nový tRPC router (nebo rozšíř existující)
2. Implementuj DB schema (Drizzle migration)
3. Implementuj LLM calling s `invokeLLM()`
4. Napište Vitest testy
5. Commit: `git add server/ && git commit -m "feat: Add [feature] backend"`

### Krok 2: Frontend
1. Vytvoř React komponentu
2. Integruj tRPC hook (`trpc.*.useQuery/useMutation`)
3. Implementuj UI s Tailwind + shadcn/ui
4. Napište Vitest testy
5. Commit: `git add client/ && git commit -m "feat: Add [feature] frontend"`

### Krok 3: Testing
1. Spusť `pnpm test` — všechny testy by měly projít
2. Zkontroluj TypeScript: `pnpm tsc --noEmit`
3. Manuální test v dev serveru

### Krok 4: Push & Checkpoint
1. `git push user_github main`
2. Vytvoř checkpoint v Manus UI
3. Oznám v todo.md: `[x] Feature name`

---

## 📚 Užitečné Odkazy

- **tRPC docs:** https://trpc.io/docs
- **Drizzle ORM:** https://orm.drizzle.team
- **LLM integration:** `server/_core/llm.ts`
- **Design system:** `client/src/index.css` (neon glow variables)
- **Existing routers:** `server/routers.ts`
- **Existing components:** `client/src/components/`

---

## ✅ Checklist pro Každou Feature

- [ ] Backend tRPC procedura implementována
- [ ] DB schema (Drizzle) vytvořeno a migrováno
- [ ] LLM prompt otestován
- [ ] Frontend komponenta vytvořena
- [ ] Vitest testy napsány (min. 5 per feature)
- [ ] TypeScript bez chyb
- [ ] Tailwind styling aplikováno
- [ ] Integrováno do existujícího workflow
- [ ] Commitnuto na GitHub
- [ ] Checkpoint vytvořen v Manus UI
- [ ] todo.md aktualizován

---

**Poslední update:** 2026-06-12
**Autor:** System Architect
**Status:** Ready for Claude Code Implementation
