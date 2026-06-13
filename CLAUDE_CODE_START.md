# 🚀 Claude Code — START HERE

**Toto je vaše startovací zadání. Vše je připraveno. Začněte zde.**

---

## 📌 PROJEKT

- **Název:** Agency AI — AI Business Automation Platform
- **URL:** https://ai-business-automation.manus.space
- **GitHub:** https://github.com/pejtr/ai-business-automation
- **Stack:** React 19 + Express 4 + tRPC 11 + MySQL + Drizzle ORM
- **Jazyk:** Česky (UI + AI prompty)

---

## 🎯 VAŠE ÚKOL

Implementujte **3 HIGH priority features** podle `CLAUDE_CODE_HANDOFF.md`:

1. **AI-powered Pitch Scripts** — LLM generování personalizovaných skriptů
2. **Income Growth Visualization** — Progress bar s 5 milníky (0-100k Kč/měsíc)
3. **Niche-specific AI Prompts** — Context-aware lead generation

---

## ⚡ QUICK START

### 1. Clone projekt
```bash
git clone https://github.com/pejtr/ai-business-automation.git
cd ai-business-automation
```

### 2. Čti dokumentaci
```bash
# Detailní specifikace všech 3 features
cat CLAUDE_CODE_HANDOFF.md

# Nebo pro přehled
cat CLAUDE_CODE_PROMPT.md
```

### 3. Instaluj dependencies
```bash
pnpm install
```

### 4. Spusť dev server
```bash
pnpm dev
```

Server poběží na `http://localhost:3000`

### 5. Začni implementovat
Sleduj workflow v `CLAUDE_CODE_HANDOFF.md` — Krok 1 až Krok 5

---

## 📂 STRUKTURA PROJEKTU

```
ai-business-automation/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/                  # Page components (Home, Attract, Convert, etc.)
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── AIChatBox.tsx
│   │   │   └── Map.tsx
│   │   ├── lib/
│   │   │   └── trpc.ts             # tRPC client setup
│   │   ├── App.tsx                 # Routes & layout
│   │   ├── main.tsx                # React entry
│   │   └── index.css               # Global styles (Tailwind)
│   └── index.html
│
├── server/                          # Express backend
│   ├── routers.ts                  # tRPC procedures (main file)
│   ├── db.ts                       # Database query helpers
│   ├── auth.logout.test.ts         # Example Vitest test
│   └── _core/                      # Framework internals
│       ├── context.ts             # tRPC context (auth)
│       ├── llm.ts                 # LLM integration
│       ├── voiceTranscription.ts  # Whisper API
│       ├── imageGeneration.ts     # Image generation
│       └── notification.ts        # Owner notifications
│
├── drizzle/                         # Database
│   ├── schema.ts                   # Drizzle ORM schema
│   └── migrations/                 # Generated SQL migrations
│
├── shared/                          # Shared types & constants
│
├── storage/                         # S3 storage helpers
│
├── package.json                     # Dependencies
├── pnpm-lock.yaml                  # Lock file
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Vite config
├── vitest.config.ts                # Vitest config
│
├── CLAUDE_CODE_HANDOFF.md          # ⭐ DETAILNÍ INSTRUKCE (ČTĚTE!)
├── CLAUDE_CODE_PROMPT.md           # Specifikace features
├── CLAUDE_CODE_START.md            # Toto (quick start)
├── todo.md                         # Task tracking
└── README.md                       # Project docs
```

---

## 🔑 KLÍČOVÉ SOUBORY PRO IMPLEMENTACI

### Backend (server/)
- `server/routers.ts` — Přidej tRPC procedures zde
- `server/db.ts` — Přidej DB helpers zde
- `drizzle/schema.ts` — Přidej DB tables zde

### Frontend (client/src/)
- `client/src/pages/` — Přidej nové stránky/moduly
- `client/src/components/` — Přidej nové komponenty
- `client/src/constants/` — Přidej nové konstanty

### Tests
- `server/*.test.ts` — Backend testy (Vitest)
- `client/src/**/*.test.ts` — Frontend testy (Vitest)

---

## 📋 CHECKLIST PŘED STARTEM

- [ ] Projekt naklonován
- [ ] `pnpm install` spuštěn
- [ ] `pnpm dev` běží na localhost:3000
- [ ] Přečteny `CLAUDE_CODE_HANDOFF.md` a `CLAUDE_CODE_PROMPT.md`
- [ ] Rozumíte struktuře projektu
- [ ] Máte přístup k GitHub repo

---

## 🎯 IMPLEMENTAČNÍ WORKFLOW

### Feature 1: AI-powered Pitch Scripts
```bash
# 1. Backend
# - Přidej schema v drizzle/schema.ts
# - Spusť: pnpm drizzle-kit generate
# - Aplikuj migraci v Manus UI
# - Přidej helpers v server/db.ts
# - Přidej tRPC proceduru v server/routers.ts
# - Napište testy

# 2. Frontend
# - Vytvoř komponentu: client/src/components/PitchScriptGenerator.tsx
# - Integruj do Convert modulu
# - Napište testy

# 3. Commit
git add -A
git commit -m "feat: Add AI-powered Pitch Scripts"
```

### Feature 2: Income Growth Visualization
```bash
# 1. Frontend
# - Vytvoř constants: client/src/constants/milestones.ts
# - Vytvoř komponentu: client/src/components/MilestoneTrack.tsx
# - Integruj do IncomeCalculator
# - Napište testy

# 2. Commit
git commit -m "feat: Add Income Growth Visualization"
```

### Feature 3: Niche-specific AI Prompts
```bash
# 1. Backend
# - Vytvoř constants: server/constants/niches.ts
# - Přidej tRPC proceduru v server/routers.ts
# - Napište testy

# 2. Frontend
# - Vytvoř komponenty: NicheSelector, NicheContextPreview
# - Integruj do Attract modulu
# - Napište testy

# 3. Commit
git commit -m "feat: Add Niche-specific AI Prompts"
```

### Finalizace
```bash
# 1. Testy
pnpm test
pnpm tsc --noEmit

# 2. Push
git push user_github main

# 3. Checkpoint v Manus UI
# - Jdi do Management UI → Dashboard
# - Vytvoř checkpoint
```

---

## 🧪 TESTING

```bash
# Spusť všechny testy
pnpm test

# Spusť testy pro konkrétní soubor
pnpm test server/routers/convert.generatePitchScript.test.ts

# Watch mode
pnpm test --watch

# TypeScript check
pnpm tsc --noEmit
```

---

## 🐛 DEBUGGING

### Dev Server Logs
```bash
# Podívej se na server output
# Měl by běžet na http://localhost:3000
```

### Database
- Manus UI → Management UI → Database panel
- Zde vidíš všechny tabulky a data

### tRPC DevTools
- Otevři DevTools v prohlížeči
- Měl by být tRPC panel pro debugging

---

## 📚 DOKUMENTACE

### Existující Features
- ✅ 5-kroký framework (Attract, Convert, Deliver, Automate, Human)
- ✅ Email tracking (open/click s pixel a redirect)
- ✅ Income Calculator (interaktivní widget)
- ✅ Aria AI asistentka (chat widget s onboarding)
- ✅ Neon glow design + česká lokalizace

### Nové Features (Vaše úkol)
- 🚀 AI-powered Pitch Scripts
- 📊 Income Growth Visualization
- 🎯 Niche-specific AI Prompts

---

## 🔗 UŽITEČNÉ LINKY

- **tRPC docs:** https://trpc.io/docs
- **Drizzle ORM:** https://orm.drizzle.team
- **React docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Vitest:** https://vitest.dev
- **shadcn/ui:** https://ui.shadcn.com

---

## 💡 TIPS

1. **Čtěte kód** — Podívejte se na existující features (Email Tracking, Income Calculator)
2. **Kopírujte pattern** — Existující kód je template pro nové features
3. **Testujte vždy** — Vitest testy jsou povinné
4. **Commitujte často** — Malé, logické commity
5. **Pushujte na GitHub** — `git push user_github main`

---

## ⚠️ DŮLEŽITÉ

- ❌ Neměňte existující kód, jen přidávejte
- ✅ Vždy napište testy
- ✅ Všechny UI texty musí být v **češtině**
- ✅ Všechny AI prompty musí být v **češtině**
- ✅ Používejte existující design system (neon glow)
- ✅ Commitujte na `main` branch

---

## 🎬 NEXT STEPS

1. **Klonuj projekt**
   ```bash
   git clone https://github.com/pejtr/ai-business-automation.git
   cd ai-business-automation
   ```

2. **Instaluj a spusť**
   ```bash
   pnpm install
   pnpm dev
   ```

3. **Čti CLAUDE_CODE_HANDOFF.md**
   ```bash
   cat CLAUDE_CODE_HANDOFF.md
   ```

4. **Začni s Feature 1**
   - Přidej DB schema
   - Implementuj backend
   - Implementuj frontend
   - Napište testy
   - Commituj

5. **Opakuj pro Feature 2 a 3**

6. **Push a Checkpoint**
   ```bash
   git push user_github main
   # Vytvoř checkpoint v Manus UI
   ```

---

## 📞 HELP

Pokud máte otázky:

1. **Podívejte se na existující kód** — Je tam vždy příklad
2. **Čtěte dokumentaci** — CLAUDE_CODE_HANDOFF.md má všechno
3. **Spustťe testy** — `pnpm test` vám řekne, co je špatně
4. **TypeScript** — `pnpm tsc --noEmit` vám pokaže type errors

---

## ✅ HOTOVO!

Máte vše, co potřebujete. Začněte s:

```bash
git clone https://github.com/pejtr/ai-business-automation.git
cd ai-business-automation
pnpm install
pnpm dev
cat CLAUDE_CODE_HANDOFF.md
```

**Hodně štěstí! 🚀**

---

**Poslední update:** 2026-06-12  
**Status:** Ready for Implementation  
**Autor:** System Architect
